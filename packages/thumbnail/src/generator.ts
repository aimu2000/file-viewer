import {
  createViewer,
  readFileViewerBuffer,
  type FileViewerInstance,
  type FileViewerSource,
} from '@file-viewer/core';
import {
  captureThumbnailElement,
  destroyReusableFileViewerDomCaptureContext,
  normalizeThumbnailBlob,
  type ReusableFileViewerDomCaptureContext,
} from './capture.js';
import {
  resolveFileViewerThumbnailConcurrency,
  resolveFileViewerThumbnailOptions,
  toCaptureOptions,
} from './options.js';
import {
  FileViewerThumbnailError,
  type CreateFileViewerThumbnailGeneratorOptions,
  type FileViewerThumbnailBatchItem,
  type FileViewerThumbnailGenerator,
  type FileViewerThumbnailOptions,
  type FileViewerThumbnailResult,
  type ResolvedFileViewerThumbnailOptions,
} from './types.js';

interface ThumbnailPoolSlot {
  host: HTMLDivElement;
  viewer: FileViewerInstance;
  captureContext: ReusableFileViewerDomCaptureContext;
}

interface ThumbnailJob<T> {
  signal?: AbortSignal;
  run(slot: ThumbnailPoolSlot): Promise<T>;
  resolve(value: T): void;
  reject(error: unknown): void;
  removeAbort?: () => void;
}

const toThumbnailError = (error: unknown) => {
  if (error instanceof FileViewerThumbnailError) {
    return error;
  }
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new FileViewerThumbnailError('aborted', 'Thumbnail generation was aborted.', error);
  }
  const message = error instanceof Error ? error.message : String(error);
  return new FileViewerThumbnailError('capture-failed', message, error);
};

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new FileViewerThumbnailError('aborted', 'Thumbnail generation was aborted.', signal.reason);
  }
};

const withDeadline = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal,
  onTimeout?: (error: FileViewerThumbnailError) => void
) => new Promise<T>((resolve, reject) => {
  throwIfAborted(signal);
  let settled = false;
  const finish = (callback: () => void) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
    callback();
  };
  const timer = setTimeout(() => finish(() => {
    const error = new FileViewerThumbnailError('timeout', `Thumbnail generation exceeded ${timeoutMs}ms.`);
    onTimeout?.(error);
    reject(error);
  }), timeoutMs);
  const onAbort = () => finish(() => reject(
    new FileViewerThumbnailError('aborted', 'Thumbnail generation was aborted.', signal?.reason)
  ));
  signal?.addEventListener('abort', onAbort, { once: true });
  operation.then(
    value => finish(() => resolve(value)),
    error => finish(() => reject(error))
  );
});

const waitForCaptureReadiness = async (documentRef: Document, signal?: AbortSignal) => {
  throwIfAborted(signal);
  await documentRef.fonts?.ready.catch(() => undefined);
  const view = documentRef.defaultView;
  await new Promise<void>(resolve => {
    if (!view?.requestAnimationFrame) {
      view?.setTimeout(() => resolve(), 0) ?? resolve();
      return;
    }
    view.requestAnimationFrame(() => view.requestAnimationFrame(() => resolve()));
  });
  throwIfAborted(signal);
};

const createPoolSlot = (
  documentRef: Document,
  options: CreateFileViewerThumbnailGeneratorOptions
): ThumbnailPoolSlot => {
  const host = documentRef.createElement('div');
  host.dataset.fileViewerThumbnailSlot = '';
  host.style.cssText = [
    'position:fixed',
    'left:-100000px',
    'top:0',
    'width:320px',
    'height:240px',
    'overflow:hidden',
    'pointer-events:none',
    'contain:layout style paint',
    'z-index:-2147483648',
  ].join(';');
  documentRef.body.append(host);
  const viewer = createViewer(host, {
    options: {
      ...options.viewerOptions,
      toolbar: false,
      watermark: false,
      fit: 'contain',
    },
    renderPurpose: 'thumbnail',
  });
  return { host, viewer, captureContext: {} };
};

const materializeThumbnailSource = async (
  source: FileViewerSource,
  signal?: AbortSignal
): Promise<FileViewerSource> => {
  if (source.buffer) {
    return source;
  }
  if (source.file) {
    return { ...source, buffer: await readFileViewerBuffer(source.file) };
  }
  if (source.url) {
    const response = await fetch(source.url, { signal });
    if (!response.ok) {
      throw new FileViewerThumbnailError(
        'capture-failed',
        `Unable to download thumbnail source: HTTP ${response.status}.`
      );
    }
    return {
      ...source,
      buffer: await response.arrayBuffer(),
      size: source.size ?? (Number(response.headers.get('content-length')) || undefined),
    };
  }
  throw new FileViewerThumbnailError('unsupported', 'Thumbnail source has no file bytes or URL.');
};

const generateInSlot = async (
  slot: ThumbnailPoolSlot,
  source: FileViewerSource,
  options: ResolvedFileViewerThumbnailOptions
): Promise<FileViewerThumbnailResult> => {
  const startedAt = performance.now();
  const remainingTime = () => Math.max(1, options.timeoutMs - (performance.now() - startedAt));
  const taskController = new AbortController();
  const onSourceAbort = () => taskController.abort(options.signal?.reason);
  if (options.signal?.aborted) {
    taskController.abort(options.signal.reason);
  } else {
    options.signal?.addEventListener('abort', onSourceAbort, { once: true });
  }
  const taskOptions = { ...options, signal: taskController.signal };
  const runWithDeadline = <T>(operation: Promise<T>) => withDeadline(
    operation,
    remainingTime(),
    taskController.signal,
    error => taskController.abort(error)
  );
  slot.host.style.width = `${options.width}px`;
  slot.host.style.height = `${options.height}px`;
  throwIfAborted(taskOptions.signal);

  try {
    const materializedSource = await runWithDeadline(materializeThumbnailSource(source, taskOptions.signal));
    const session = await runWithDeadline(slot.viewer.load(materializedSource, { signal: taskOptions.signal }));
    const normalizedSource = slot.viewer.getSource();
    const renderer = slot.viewer.getRenderer();
    if (!session || !normalizedSource || !renderer?.load) {
      throw new FileViewerThumbnailError(
        'unsupported',
        `No installed renderer can generate a .${normalizedSource?.extension || source.type || ''} thumbnail.`
      );
    }

    await runWithDeadline(waitForCaptureReadiness(slot.host.ownerDocument, taskOptions.signal));
    const adapter = slot.viewer.getThumbnailAdapter?.() || null;
    const captureOptions = toCaptureOptions(taskOptions);
    const captured = await runWithDeadline((async () => {
      await adapter?.beforeCapture?.(captureOptions);
      throwIfAborted(taskOptions.signal);

      let blob = await adapter?.capture?.(captureOptions) || null;
      let strategy: FileViewerThumbnailResult['strategy'] = 'provider-native';
      if (blob) {
        blob = await normalizeThumbnailBlob(slot.host.ownerDocument, blob, taskOptions);
      } else {
        const adapterTarget = await adapter?.getTarget?.(captureOptions) || null;
        strategy = adapterTarget ? 'provider-dom' : 'dom-fallback';
        blob = await captureThumbnailElement(
          slot.host.ownerDocument,
          adapterTarget || slot.host,
          taskOptions,
          slot.captureContext
        );
      }
      return { blob, strategy };
    })());
    const { blob, strategy } = captured;

    return {
      blob,
      width: options.width,
      height: options.height,
      mimeType: blob.type,
      filename: normalizedSource.filename,
      extension: normalizedSource.extension,
      rendererId: renderer.id,
      strategy,
      degraded: strategy === 'dom-fallback',
      durationMs: Math.max(0, performance.now() - startedAt),
    };
  } catch (error) {
    throw toThumbnailError(error);
  } finally {
    options.signal?.removeEventListener('abort', onSourceAbort);
    taskController.abort();
    const unloading = slot.viewer.unload?.('replace');
    await unloading?.catch(() => undefined);
  }
};

export const createFileViewerThumbnailGenerator = (
  createOptions: CreateFileViewerThumbnailGeneratorOptions = {}
): FileViewerThumbnailGenerator => {
  const documentRef = createOptions.document || (typeof document !== 'undefined' ? document : undefined);
  if (!documentRef?.body || !documentRef.defaultView) {
    throw new FileViewerThumbnailError('browser-required', 'Thumbnail generation requires a browser document.');
  }
  const concurrency = resolveFileViewerThumbnailConcurrency(createOptions.concurrency);
  const defaultTimeoutMs = createOptions.timeoutMs ?? 30_000;
  const slots = Array.from({ length: concurrency }, () => createPoolSlot(documentRef, createOptions));
  const availableSlots = [...slots];
  const jobs: Array<ThumbnailJob<unknown>> = [];
  const active = new Set<Promise<unknown>>();
  let destroyed = false;

  const drain = () => {
    while (!destroyed && availableSlots.length && jobs.length) {
      const slot = availableSlots.shift() as ThumbnailPoolSlot;
      const job = jobs.shift() as ThumbnailJob<unknown>;
      job.removeAbort?.();
      if (job.signal?.aborted) {
        availableSlots.push(slot);
        job.reject(new FileViewerThumbnailError('aborted', 'Thumbnail generation was aborted.', job.signal.reason));
        continue;
      }
      const task = job.run(slot);
      active.add(task);
      void task.then(job.resolve, job.reject).finally(() => {
        active.delete(task);
        availableSlots.push(slot);
        drain();
      });
    }
  };

  const enqueue = <T>(job: Omit<ThumbnailJob<T>, 'resolve' | 'reject'>) => new Promise<T>((resolve, reject) => {
    if (destroyed) {
      reject(new FileViewerThumbnailError('destroyed', 'The thumbnail generator has been destroyed.'));
      return;
    }
    if (job.signal?.aborted) {
      reject(new FileViewerThumbnailError('aborted', 'Thumbnail generation was aborted.', job.signal.reason));
      return;
    }
    const queued = { ...job, resolve, reject } as ThumbnailJob<unknown>;
    if (job.signal) {
      const onAbort = () => {
        const index = jobs.indexOf(queued);
        if (index >= 0) {
          jobs.splice(index, 1);
          reject(new FileViewerThumbnailError('aborted', 'Thumbnail generation was aborted.', job.signal?.reason));
        }
      };
      job.signal.addEventListener('abort', onAbort, { once: true });
      queued.removeAbort = () => job.signal?.removeEventListener('abort', onAbort);
    }
    jobs.push(queued);
    drain();
  });

  const generate = async (source: FileViewerSource, options?: FileViewerThumbnailOptions) => {
    const resolved = resolveFileViewerThumbnailOptions(options, defaultTimeoutMs);
    return enqueue<FileViewerThumbnailResult>({
      signal: resolved.signal,
      run: slot => generateInSlot(slot, source, resolved),
    });
  };

  const toBatchItem = async (
    source: FileViewerSource,
    index: number,
    options?: FileViewerThumbnailOptions
  ): Promise<FileViewerThumbnailBatchItem> => {
    try {
      return { ok: true, index, source, result: await generate(source, options) };
    } catch (error) {
      return { ok: false, index, source, error: toThumbnailError(error) };
    }
  };

  return {
    generate,
    generateBatch(sources, options) {
      return Promise.all(sources.map((source, index) => toBatchItem(source, index, options)));
    },
    async *generateStream(sources, options) {
      const streamController = new AbortController();
      const onSourceAbort = () => streamController.abort(options?.signal?.reason);
      if (options?.signal?.aborted) {
        streamController.abort(options.signal.reason);
      } else {
        options?.signal?.addEventListener('abort', onSourceAbort, { once: true });
      }
      const streamOptions = { ...options, signal: streamController.signal };
      const pending: Array<{ index: number; promise: Promise<FileViewerThumbnailBatchItem> }> = [];
      let nextIndex = 0;
      const fillWindow = () => {
        while (nextIndex < sources.length && pending.length < concurrency) {
          const index = nextIndex++;
          pending.push({ index, promise: toBatchItem(sources[index], index, streamOptions) });
        }
      };
      try {
        fillWindow();
        while (pending.length) {
          const completed = await Promise.race(pending.map(item =>
            item.promise.then(value => ({ index: item.index, value }))
          ));
          const pendingIndex = pending.findIndex(item => item.index === completed.index);
          if (pendingIndex >= 0) {
            pending.splice(pendingIndex, 1);
          }
          // Keep at most one concurrency window resident so a slow stream
          // consumer cannot accumulate a Blob for every source in memory.
          fillWindow();
          yield completed.value;
        }
      } finally {
        options?.signal?.removeEventListener('abort', onSourceAbort);
        streamController.abort('Thumbnail stream closed.');
      }
    },
    async destroy() {
      if (destroyed) {
        return;
      }
      destroyed = true;
      jobs.splice(0).forEach(job => {
        job.removeAbort?.();
        job.reject(new FileViewerThumbnailError('destroyed', 'The thumbnail generator has been destroyed.'));
      });
      await Promise.allSettled([...active]);
      await Promise.all(slots.map(slot => slot.viewer.destroy('component-unmount')));
      slots.forEach(slot => {
        destroyReusableFileViewerDomCaptureContext(slot.captureContext);
        slot.host.remove();
      });
      availableSlots.length = 0;
    },
  };
};

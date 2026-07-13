// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';

let activeLoads = 0;
let maxActiveLoads = 0;
let totalLoads = 0;
let embeddedThumbnail: Blob | null = null;

vi.mock('./capture.js', () => ({
  captureThumbnailElement: vi.fn(async () => new Blob(['fallback'], { type: 'image/webp' })),
  destroyReusableFileViewerDomCaptureContext: vi.fn(),
  normalizeThumbnailBlob: vi.fn(async (_document, blob: Blob) => blob),
}));

vi.mock('./embedded/index.js', () => ({
  canExtractEmbeddedThumbnail: vi.fn((extension: string) => extension === 'docx'),
  extractEmbeddedThumbnail: vi.fn(async () => embeddedThumbnail),
}));

vi.mock('@file-viewer/core', () => ({
  normalizeSource: vi.fn((source: { filename?: string; type?: string; buffer?: ArrayBuffer }) => ({
    ...source,
    filename: source.filename || `preview.${source.type || 'bin'}`,
    extension: source.type || source.filename?.split('.').pop() || '',
  })),
  createViewer: vi.fn((host: HTMLElement) => {
    let source: { filename?: string; type?: string } | null = null;
    return {
      container: host,
      async prepare() {},
      async load(nextSource: { filename?: string; type?: string }, loadOptions?: { signal?: AbortSignal }) {
        source = nextSource;
        activeLoads += 1;
        totalLoads += 1;
        maxActiveLoads = Math.max(maxActiveLoads, activeLoads);
        const delay = nextSource.filename?.startsWith('stream-0')
          ? 30
          : nextSource.filename?.startsWith('stream-1')
            ? 5
            : nextSource.filename?.startsWith('stream-2')
              ? 10
              : nextSource.filename?.startsWith('slow')
                ? 50
                : Number(nextSource.filename?.match(/\d+/)?.[0] || 1) % 3;
        try {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
              loadOptions?.signal?.removeEventListener('abort', onAbort);
              resolve();
            }, delay);
            const onAbort = () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            };
            loadOptions?.signal?.addEventListener('abort', onAbort, { once: true });
          });
          if (nextSource.filename?.startsWith('fail')) {
            throw new Error('fixture failure');
          }
          return { destroy() {} };
        } finally {
          activeLoads -= 1;
        }
      },
      async unload() {},
      async destroy() {},
      getSource() {
        return { filename: source?.filename || 'file.pdf', extension: source?.type || 'pdf' };
      },
      getRenderer() {
        return { id: 'pdf', load() {} };
      },
      getThumbnailAdapter() {
        return {
          captureSource: source?.filename?.startsWith('cover.') ? 'embedded' : 'rendered',
          capture: async () => new Blob(['thumbnail'], { type: 'image/webp' }),
        };
      },
    };
  }),
}));

import { createFileViewerThumbnailGenerator } from './generator.js';

describe('thumbnail generator pool', () => {
  beforeEach(() => {
    activeLoads = 0;
    maxActiveLoads = 0;
    totalLoads = 0;
    embeddedThumbnail = null;
  });

  it('returns an embedded thumbnail before loading the renderer', async () => {
    embeddedThumbnail = new Blob(['cover'], { type: 'image/png' });
    const generator = createFileViewerThumbnailGenerator({ concurrency: 1 });
    const result = await generator.generate({
      filename: 'book.docx',
      type: 'docx',
      buffer: new ArrayBuffer(8),
    });

    expect(result).toMatchObject({
      strategy: 'embedded',
      degraded: false,
      rendererId: 'pdf',
    });
    expect(totalLoads).toBe(0);
    await generator.destroy();
  });

  it('preserves embedded provenance from a renderer adapter', async () => {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 1 });
    const result = await generator.generate({
      filename: 'cover.umd',
      type: 'umd',
      buffer: new ArrayBuffer(8),
    });

    expect(result).toMatchObject({ strategy: 'embedded', degraded: false });
    expect(totalLoads).toBe(1);
    await generator.destroy();
  });

  it('keeps ordered batch results while enforcing concurrency', async () => {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 2 });
    const sources = Array.from({ length: 50 }, (_, index) => ({
      filename: `${index}.pdf`,
      type: 'pdf',
      buffer: new ArrayBuffer(0),
    }));
    const results = await generator.generateBatch(sources);
    expect(results).toHaveLength(50);
    expect(results.map(item => item.index)).toEqual(Array.from({ length: 50 }, (_, index) => index));
    expect(results.every(item => item.ok)).toBe(true);
    expect(maxActiveLoads).toBeLessThanOrEqual(2);
    await generator.destroy();
    expect(document.querySelectorAll('[data-file-viewer-thumbnail-slot]')).toHaveLength(0);
  });

  it('streams in completion order and rejects use after destroy', async () => {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 2 });
    const indexes: number[] = [];
    for await (const item of generator.generateStream([
      { filename: 'stream-0.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { filename: 'stream-1.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { filename: 'stream-2.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
    ])) {
      expect(item.ok).toBe(true);
      indexes.push(item.index);
    }
    expect(indexes).toEqual([1, 2, 0]);
    await generator.destroy();
    await expect(generator.generate({ filename: 'late.pdf', type: 'pdf' })).rejects.toMatchObject({ code: 'destroyed' });
  });

  it('uses stable timeout and abort errors without stopping a batch', async () => {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 2 });
    await expect(generator.generate(
      { filename: 'invalid.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { format: 'gif' as never }
    )).rejects.toMatchObject({ code: 'invalid-options' });
    await expect(generator.generate(
      { filename: 'slow.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { timeoutMs: 1 }
    )).rejects.toMatchObject({ code: 'timeout' });

    const controller = new AbortController();
    controller.abort('cancelled');
    await expect(generator.generate(
      { filename: 'aborted.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { signal: controller.signal }
    )).rejects.toMatchObject({ code: 'aborted' });

    const batch = await generator.generateBatch([
      { filename: 'fail.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { filename: 'ok.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
    ]);
    expect(batch[0]).toMatchObject({ ok: false, error: { code: 'capture-failed' } });
    expect(batch[1]).toMatchObject({ ok: true });
    await generator.destroy();
  });

  it('does not schedule the remainder after a stream consumer stops early', async () => {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 2 });
    for await (const item of generator.generateStream(Array.from({ length: 50 }, (_, index) => ({
      filename: `stream-${index}.pdf`,
      type: 'pdf',
      buffer: new ArrayBuffer(0),
    })))) {
      expect(item.ok).toBe(true);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 40));
    expect(totalLoads).toBeLessThanOrEqual(3);
    expect(activeLoads).toBe(0);
    await generator.destroy();
  });

  it('aborts active work when the generator is destroyed', async () => {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 1 });
    const pending = generator.generate(
      { filename: 'slow-destroy.pdf', type: 'pdf', buffer: new ArrayBuffer(0) },
      { timeoutMs: 10_000 }
    );
    await vi.waitFor(() => expect(activeLoads).toBe(1));
    const rejected = expect(pending).rejects.toMatchObject({ code: 'destroyed' });

    await generator.destroy();

    await rejected;
    expect(activeLoads).toBe(0);
    expect(document.querySelectorAll('[data-file-viewer-thumbnail-slot]')).toHaveLength(0);
  });
});

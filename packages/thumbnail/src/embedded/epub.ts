import type { NormalizedFileViewerSource } from '@file-viewer/core';
import {
  MAX_EMBEDDED_THUMBNAIL_BYTES,
  raceWithAbort,
  throwIfAborted,
} from './shared.js';

const resolveEpubFactory = (module: unknown) => {
  let value = module as { default?: unknown } | undefined;
  for (let depth = 0; depth < 3 && value && typeof value !== 'function'; depth += 1) {
    value = value.default as { default?: unknown } | undefined;
  }
  if (typeof value !== 'function') {
    throw new Error('epubjs module does not expose a callable factory.');
  }
  return value as (input: ArrayBuffer, options: Record<string, unknown>) => {
    ready: Promise<unknown>;
    coverUrl?: () => Promise<string | null>;
    destroy(): void;
  };
};
export const extractEpubCover = async (source: NormalizedFileViewerSource, signal?: AbortSignal) => {
  if (!source.buffer) {
    return null;
  }
  throwIfAborted(signal);
  const ePub = resolveEpubFactory(await import('epubjs'));
  const book = ePub(source.buffer.slice(0), { openAs: 'binary', replacements: 'blobUrl' });
  let destroyed = false;
  const destroyBook = () => {
    if (!destroyed) {
      destroyed = true;
      book.destroy();
    }
  };
  try {
    await raceWithAbort(book.ready, signal, destroyBook);
    const coverUrl = await raceWithAbort(book.coverUrl?.() || Promise.resolve(null), signal, destroyBook);
    if (!coverUrl) {
      return null;
    }
    const response = await fetch(coverUrl, { signal });
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return blob.size && blob.size <= MAX_EMBEDDED_THUMBNAIL_BYTES ? blob : null;
  } finally {
    destroyBook();
  }
};

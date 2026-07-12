import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS,
  resolveFileViewerThumbnailConcurrency,
  resolveFileViewerThumbnailOptions,
} from './options.js';
import { FileViewerThumbnailError } from './types.js';

describe('thumbnail options', () => {
  it('uses stable browser thumbnail defaults', () => {
    expect(resolveFileViewerThumbnailOptions()).toMatchObject(DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS);
  });

  it('validates dimensions, quality, timeout, and concurrency', () => {
    expect(() => resolveFileViewerThumbnailOptions({ width: 0 })).toThrow(FileViewerThumbnailError);
    expect(() => resolveFileViewerThumbnailOptions({ quality: 2 })).toThrow(FileViewerThumbnailError);
    expect(() => resolveFileViewerThumbnailOptions({ timeoutMs: 0 })).toThrow(FileViewerThumbnailError);
    expect(() => resolveFileViewerThumbnailConcurrency(9)).toThrow(FileViewerThumbnailError);
    expect(resolveFileViewerThumbnailConcurrency(4)).toBe(4);
  });

  it('accepts every public output format and fit mode', () => {
    expect(resolveFileViewerThumbnailOptions({ format: 'png', fit: 'cover' })).toMatchObject({
      format: 'png',
      fit: 'cover',
    });
    expect(resolveFileViewerThumbnailOptions({ format: 'jpeg', quality: 0 })).toMatchObject({
      format: 'jpeg',
      quality: 0,
    });
    expect(() => resolveFileViewerThumbnailOptions({ format: 'gif' as never })).toThrowError(
      expect.objectContaining({ code: 'invalid-options' })
    );
  });
});

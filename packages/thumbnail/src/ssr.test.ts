// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createFileViewerThumbnailGenerator } from './generator.js';

describe('server import boundary', () => {
  it('imports without DOM access and fails only when instantiated', () => {
    expect(() => createFileViewerThumbnailGenerator()).toThrowError(
      expect.objectContaining({ code: 'browser-required' })
    );
  });
});

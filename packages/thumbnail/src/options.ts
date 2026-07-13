import type { FileViewerThumbnailCaptureOptions } from '@file-viewer/core';
import {
  FileViewerThumbnailError,
  type FileViewerThumbnailOptions,
  type ResolvedFileViewerThumbnailOptions,
} from './types.js';

export const DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS = Object.freeze({
  width: 320,
  height: 240,
  format: 'webp',
  quality: 0.8,
  fit: 'contain',
  background: '#f1f5f9',
  timeoutMs: 30_000,
} as const);

const resolveInteger = (value: number | undefined, fallback: number, label: string) => {
  const resolved = value ?? fallback;
  if (!Number.isFinite(resolved) || resolved < 1 || resolved > 8192) {
    throw new FileViewerThumbnailError('invalid-options', `${label} must be between 1 and 8192.`);
  }
  return Math.round(resolved);
};

export const resolveFileViewerThumbnailOptions = (
  options: FileViewerThumbnailOptions = {},
  defaultTimeoutMs: number = DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.timeoutMs
): ResolvedFileViewerThumbnailOptions => {
  const format = options.format || DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.format;
  const fit = options.fit || DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.fit;
  const quality = options.quality ?? DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.quality;
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  if (!['webp', 'jpeg', 'png'].includes(format)) {
    throw new FileViewerThumbnailError('invalid-options', `Unsupported thumbnail format: ${format}`);
  }
  if (fit !== 'contain' && fit !== 'cover') {
    throw new FileViewerThumbnailError('invalid-options', `Unsupported thumbnail fit: ${fit}`);
  }
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new FileViewerThumbnailError('invalid-options', 'quality must be between 0 and 1.');
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1) {
    throw new FileViewerThumbnailError('invalid-options', 'timeoutMs must be greater than 0.');
  }
  return {
    width: resolveInteger(options.width, DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.width, 'width'),
    height: resolveInteger(options.height, DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.height, 'height'),
    format,
    quality,
    fit,
    background: options.background || DEFAULT_FILE_VIEWER_THUMBNAIL_OPTIONS.background,
    timeoutMs,
    signal: options.signal,
  };
};

export const toCaptureOptions = (
  options: ResolvedFileViewerThumbnailOptions
): FileViewerThumbnailCaptureOptions => ({
  width: options.width,
  height: options.height,
  format: options.format,
  quality: options.quality,
  fit: options.fit,
  background: options.background,
  signal: options.signal,
});

export const resolveFileViewerThumbnailConcurrency = (value = 2) => {
  if (!Number.isInteger(value) || value < 1 || value > 8) {
    throw new FileViewerThumbnailError('invalid-options', 'concurrency must be an integer between 1 and 8.');
  }
  return value;
};

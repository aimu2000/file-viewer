import type {
  FileViewerOptions,
  FileViewerSource,
  FileViewerThumbnailFit,
  FileViewerThumbnailFormat,
} from '@file-viewer/core';

export type FileViewerThumbnailErrorCode =
  | 'browser-required'
  | 'unsupported'
  | 'timeout'
  | 'aborted'
  | 'capture-failed'
  | 'capture-unavailable'
  | 'tainted-canvas'
  | 'empty-output'
  | 'destroyed'
  | 'invalid-options';

export class FileViewerThumbnailError extends Error {
  readonly code: FileViewerThumbnailErrorCode;
  readonly cause?: unknown;

  constructor(code: FileViewerThumbnailErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'FileViewerThumbnailError';
    this.code = code;
    this.cause = cause;
  }
}

export interface FileViewerThumbnailOptions {
  width?: number;
  height?: number;
  format?: FileViewerThumbnailFormat;
  quality?: number;
  fit?: FileViewerThumbnailFit;
  background?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface ResolvedFileViewerThumbnailOptions {
  width: number;
  height: number;
  format: FileViewerThumbnailFormat;
  quality: number;
  fit: FileViewerThumbnailFit;
  background: string;
  timeoutMs: number;
  signal?: AbortSignal;
}

export type FileViewerThumbnailStrategy = 'embedded' | 'provider-native' | 'provider-dom' | 'dom-fallback';

export interface FileViewerThumbnailResult {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  filename: string;
  extension: string;
  rendererId?: string;
  strategy: FileViewerThumbnailStrategy;
  degraded: boolean;
  durationMs: number;
}

export interface FileViewerThumbnailBatchSuccess {
  ok: true;
  index: number;
  source: FileViewerSource;
  result: FileViewerThumbnailResult;
}

export interface FileViewerThumbnailBatchFailure {
  ok: false;
  index: number;
  source: FileViewerSource;
  error: FileViewerThumbnailError;
}

export type FileViewerThumbnailBatchItem =
  | FileViewerThumbnailBatchSuccess
  | FileViewerThumbnailBatchFailure;

export interface CreateFileViewerThumbnailGeneratorOptions {
  viewerOptions?: FileViewerOptions;
  concurrency?: number;
  timeoutMs?: number;
  document?: Document;
}

export interface FileViewerThumbnailGenerator {
  generate(source: FileViewerSource, options?: FileViewerThumbnailOptions): Promise<FileViewerThumbnailResult>;
  generateBatch(
    sources: readonly FileViewerSource[],
    options?: FileViewerThumbnailOptions
  ): Promise<FileViewerThumbnailBatchItem[]>;
  generateStream(
    sources: readonly FileViewerSource[],
    options?: FileViewerThumbnailOptions
  ): AsyncIterable<FileViewerThumbnailBatchItem>;
  destroy(): Promise<void>;
}

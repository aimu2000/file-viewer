import type { NormalizedFileViewerSource } from '@file-viewer/core';
import { extractEpubCover } from './epub.js';
import {
  canExtractZipPackageThumbnail,
  extractZipPackageThumbnail,
} from './package.js';

export const canExtractEmbeddedThumbnail = (extension: string) => (
  extension === 'epub' || canExtractZipPackageThumbnail(extension)
);

export const extractEmbeddedThumbnail = async (
  source: NormalizedFileViewerSource,
  documentRef: Document,
  signal?: AbortSignal
) => {
  if (source.extension === 'epub') {
    return extractEpubCover(source, signal);
  }
  return extractZipPackageThumbnail(source, documentRef, signal);
};

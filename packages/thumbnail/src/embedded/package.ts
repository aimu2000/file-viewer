import type { NormalizedFileViewerSource } from '@file-viewer/core';
import {
  MAX_EMBEDDED_THUMBNAIL_BYTES,
  raceWithAbort,
  throwIfAborted,
  toImageBlob,
} from './shared.js';

const OPEN_XML_EXTENSIONS = new Set([
  'docx', 'docm', 'dotx', 'dotm',
  'pptx', 'pptm', 'potx', 'potm', 'ppsx', 'ppsm',
  'xlsx', 'xltx', 'xlsm', 'xltm', 'xlsb',
]);
const OPEN_DOCUMENT_EXTENSIONS = new Set(['odt', 'odp', 'ods']);
const OPEN_XML_MAIN_PARTS: Record<string, string> = {
  docx: 'word/document.xml', docm: 'word/document.xml',
  dotx: 'word/document.xml', dotm: 'word/document.xml',
  pptx: 'ppt/presentation.xml', pptm: 'ppt/presentation.xml',
  potx: 'ppt/presentation.xml', potm: 'ppt/presentation.xml',
  ppsx: 'ppt/presentation.xml', ppsm: 'ppt/presentation.xml',
  xlsx: 'xl/workbook.xml', xltx: 'xl/workbook.xml',
  xlsm: 'xl/workbook.xml', xltm: 'xl/workbook.xml',
  xlsb: 'xl/workbook.bin',
};
type ZipEntry = {
  dir: boolean;
  name: string;
  _data?: { uncompressedSize?: number };
  async(type: 'uint8array'): Promise<Uint8Array>;
};

type ZipPackage = {
  files: Record<string, ZipEntry>;
  file(path: string): ZipEntry | null;
};

const normalizeZipPath = (path: string) => {
  let decoded = path.trim().replace(/\\/g, '/').split(/[?#]/, 1)[0] || '';
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Keep the original package path when it contains malformed escapes.
  }
  try {
    return new URL(decoded, 'https://file-viewer.invalid/').pathname.replace(/^\/+/, '');
  } catch {
    return decoded.replace(/^\/+/, '');
  }
};

const findZipEntry = (zip: ZipPackage, path: string) => {
  const normalized = normalizeZipPath(path);
  const exact = zip.file(normalized);
  if (exact && !exact.dir) {
    return exact;
  }
  const lower = normalized.toLowerCase();
  return Object.values(zip.files).find(entry => !entry.dir && entry.name.toLowerCase() === lower) || null;
};

const readZipImage = async (zip: ZipPackage, paths: readonly string[], signal?: AbortSignal) => {
  for (const path of paths) {
    throwIfAborted(signal);
    const entry = findZipEntry(zip, path);
    if (!entry) {
      continue;
    }
    const declaredSize = Number(entry._data?.uncompressedSize);
    if (Number.isFinite(declaredSize) && declaredSize > MAX_EMBEDDED_THUMBNAIL_BYTES) {
      continue;
    }
    const blob = toImageBlob(await raceWithAbort(entry.async('uint8array'), signal), entry.name);
    if (blob) {
      return blob;
    }
  }
  return null;
};

const readPackageRelationshipTarget = async (
  zip: ZipPackage,
  documentRef: Document,
  typePattern: RegExp,
  signal?: AbortSignal
) => {
  const relationshipEntry = findZipEntry(zip, '_rels/.rels');
  if (!relationshipEntry) {
    return '';
  }
  const bytes = await raceWithAbort(relationshipEntry.async('uint8array'), signal);
  const Parser = documentRef.defaultView?.DOMParser || globalThis.DOMParser;
  if (!Parser) {
    return '';
  }
  const relationshipDocument = new Parser().parseFromString(new TextDecoder().decode(bytes), 'application/xml');
  const relationships = Array.from(relationshipDocument.getElementsByTagName('*'))
    .filter(element => (element.localName || element.tagName).toLowerCase() === 'relationship');
  for (const relationship of relationships) {
    const type = relationship.getAttribute('Type') || '';
    const targetMode = relationship.getAttribute('TargetMode') || '';
    if (typePattern.test(type) && !/^external$/i.test(targetMode)) {
      return normalizeZipPath(relationship.getAttribute('Target') || '');
    }
  }
  return '';
};

const extractOpenXmlThumbnail = async (
  zip: ZipPackage,
  extension: string,
  documentRef: Document,
  signal?: AbortSignal
) => {
  const mainPart = OPEN_XML_MAIN_PARTS[extension];
  if (!findZipEntry(zip, '[Content_Types].xml') || !mainPart || !findZipEntry(zip, mainPart)) {
    return null;
  }
  const relationshipTarget = await readPackageRelationshipTarget(
    zip, documentRef, /\/metadata\/thumbnail$/i, signal
  );
  return readZipImage(zip, [
    relationshipTarget,
    'docProps/thumbnail.jpeg', 'docProps/thumbnail.jpg',
    'docProps/thumbnail.png', 'docProps/thumbnail.webp',
  ].filter(Boolean), signal);
};

const extractThreeMfThumbnail = async (
  zip: ZipPackage,
  documentRef: Document,
  signal?: AbortSignal
) => {
  const hasModel = Object.values(zip.files).some(entry => !entry.dir && /^3d\/.*\.model$/i.test(entry.name));
  if (!findZipEntry(zip, '[Content_Types].xml') || !hasModel) {
    return null;
  }
  const relationshipTarget = await readPackageRelationshipTarget(zip, documentRef, /\/thumbnail$/i, signal);
  return readZipImage(zip, [
    relationshipTarget,
    'Metadata/thumbnail.png', 'Metadata/thumbnail.jpg', 'Metadata/thumbnail.jpeg',
  ].filter(Boolean), signal);
};

export const canExtractZipPackageThumbnail = (extension: string) => (
  extension === 'xmind' || extension === 'numbers' || extension === '3mf' ||
  OPEN_XML_EXTENSIONS.has(extension) || OPEN_DOCUMENT_EXTENSIONS.has(extension)
);

export const extractZipPackageThumbnail = async (
  source: NormalizedFileViewerSource,
  documentRef: Document,
  signal?: AbortSignal
) => {
  if (!source.buffer || !canExtractZipPackageThumbnail(source.extension)) {
    return null;
  }
  throwIfAborted(signal);
  const module = await import('jszip');
  const JSZip = (module.default || module) as typeof module.default;
  const zip = await raceWithAbort(JSZip.loadAsync(source.buffer) as Promise<ZipPackage>, signal);
  throwIfAborted(signal);

  if (OPEN_XML_EXTENSIONS.has(source.extension)) {
    return extractOpenXmlThumbnail(zip, source.extension, documentRef, signal);
  }
  if (OPEN_DOCUMENT_EXTENSIONS.has(source.extension)) {
    if (!findZipEntry(zip, 'mimetype') || !findZipEntry(zip, 'content.xml')) return null;
    return readZipImage(zip, [
      'Thumbnails/thumbnail.png', 'Thumbnails/thumbnail.jpg',
      'Thumbnails/thumbnail.jpeg', 'Thumbnails/thumbnail.webp',
    ], signal);
  }
  if (source.extension === 'xmind') {
    if (!findZipEntry(zip, 'content.json') && !findZipEntry(zip, 'content.xml')) return null;
    return readZipImage(zip, [
      'Thumbnails/thumbnail.png', 'Thumbnails/thumbnail.jpg',
      'Thumbnails/thumbnail.jpeg', 'preview.png', 'thumbnail.png',
    ], signal);
  }
  if (source.extension === 'numbers') {
    if (!findZipEntry(zip, 'Index/Document.iwa') && !findZipEntry(zip, 'index.xml')) return null;
    return readZipImage(zip, [
      'QuickLook/Thumbnail.jpg', 'QuickLook/Thumbnail.jpeg', 'QuickLook/Thumbnail.png',
    ], signal);
  }
  return extractThreeMfThumbnail(zip, documentRef, signal);
};

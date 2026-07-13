// @vitest-environment happy-dom
import JSZip from 'jszip';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractEmbeddedThumbnail } from './embedded/index.js';
import { MAX_EMBEDDED_THUMBNAIL_BYTES } from './embedded/shared.js';

const PNG_BYTES = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

let epubDestroyed = 0;

vi.mock('epubjs', () => ({
  default: vi.fn(() => ({
    ready: Promise.resolve(),
    coverUrl: async () => 'data:image/png;base64,iVBORw0KGgo=',
    destroy: () => {
      epubDestroyed += 1;
    },
  })),
}));

const source = (extension: string, buffer: ArrayBuffer) => ({
  kind: 'buffer' as const,
  filename: `fixture.${extension}`,
  extension,
  buffer,
  size: buffer.byteLength,
});

describe('embedded thumbnail extraction', () => {
  beforeEach(() => {
    epubDestroyed = 0;
  });

  it('uses the EPUB package cover API and releases the book', async () => {
    const blob = await extractEmbeddedThumbnail(
      source('epub', new ArrayBuffer(8)),
      document
    );

    expect(blob).toMatchObject({ type: 'image/png' });
    expect(epubDestroyed).toBe(1);
  });

  it('resolves an OOXML thumbnail relationship before conventional paths', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types />');
    zip.file('word/document.xml', '<document />');
    zip.file('_rels/.rels', `
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="thumb" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail" Target="custom/cover.png" />
      </Relationships>
    `);
    zip.file('custom/cover.png', PNG_BYTES);
    zip.file('docProps/thumbnail.jpeg', Uint8Array.from([0xff, 0xd8, 0xff, 0x00]));
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    const blob = await extractEmbeddedThumbnail(source('docx', buffer), document);
    expect(blob).toMatchObject({ type: 'image/png', size: PNG_BYTES.byteLength });
  });

  it('reads the standard OpenDocument thumbnail and ignores generic ZIP files', async () => {
    const zip = new JSZip();
    zip.file('mimetype', 'application/vnd.oasis.opendocument.text');
    zip.file('content.xml', '<office:document-content />');
    zip.file('Thumbnails/thumbnail.png', PNG_BYTES);
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    await expect(extractEmbeddedThumbnail(source('odt', buffer), document))
      .resolves.toMatchObject({ type: 'image/png' });
    await expect(extractEmbeddedThumbnail(source('zip', buffer), document)).resolves.toBeNull();
  });

  it('reads Numbers Quick Look and 3MF relationship thumbnails', async () => {
    const numbers = new JSZip();
    numbers.file('Index/Document.iwa', Uint8Array.from([1]));
    numbers.file('QuickLook/Thumbnail.jpg', Uint8Array.from([0xff, 0xd8, 0xff, 0x00]));
    const numbersBuffer = await numbers.generateAsync({ type: 'arraybuffer' });
    await expect(extractEmbeddedThumbnail(source('numbers', numbersBuffer), document))
      .resolves.toMatchObject({ type: 'image/jpeg' });

    const model = new JSZip();
    model.file('[Content_Types].xml', '<Types />');
    model.file('3D/3dmodel.model', '<model />');
    model.file('_rels/.rels', `
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="thumbnail" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel/thumbnail" Target="Metadata/model.png" />
      </Relationships>
    `);
    model.file('Metadata/model.png', PNG_BYTES);
    const modelBuffer = await model.generateAsync({ type: 'arraybuffer' });
    await expect(extractEmbeddedThumbnail(source('3mf', modelBuffer), document))
      .resolves.toMatchObject({ type: 'image/png' });
  });

  it('skips oversized packaged thumbnails before decompression', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types />');
    zip.file('word/document.xml', '<document />');
    const oversized = new Uint8Array(MAX_EMBEDDED_THUMBNAIL_BYTES + 1);
    oversized.set(PNG_BYTES);
    zip.file('docProps/thumbnail.png', oversized);
    const buffer = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });

    await expect(extractEmbeddedThumbnail(source('docx', buffer), document)).resolves.toBeNull();
  });
});

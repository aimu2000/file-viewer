import pdfRenderer from '../../renderers/pdf/src/index.js';
import ebookRenderer from '../../renderers/ebook/src/index.js';
import ofdRenderer from '../../renderers/ofd/src/index.js';
import presentationRenderer from '../../renderers/presentation/src/index.js';
import spreadsheetRenderer from '../../renderers/spreadsheet/src/index.js';
import typstRenderer from '../../renderers/typst/src/index.js';
import wordRenderer from '../../renderers/word/src/index.js';
import { createFileViewerThumbnailGenerator } from '../src/index.js';

const output = document.querySelector('[data-testid="result"]') as HTMLElement;
const typstCompilerWasmUrl = new URL(
  '../../renderers/typst/node_modules/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm',
  import.meta.url
).href;
const typstRendererWasmUrl = new URL(
  '../../renderers/typst/node_modules/@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm',
  import.meta.url
).href;

try {
  const fixtures = [
    {
      filename: 'prince-sample.pdf',
      type: 'pdf',
      url: '/apps/viewer-demo/public/example/en/prince-sample.pdf',
      expectedStrategy: 'provider-native',
    },
    {
      filename: 'calibre-demo.docx',
      type: 'docx',
      url: '/apps/viewer-demo/public/example/en/calibre-demo.docx',
      expectedStrategy: 'provider-dom',
    },
    {
      filename: 'financial-sample.xlsx',
      type: 'xlsx',
      url: '/apps/viewer-demo/public/example/en/financial-sample.xlsx',
      expectedStrategy: 'provider-dom',
    },
    {
      filename: 'book.epub',
      type: 'epub',
      url: '/apps/viewer-demo/public/example/book.epub',
      expectedStrategy: null,
    },
    {
      filename: 'render-fidelity.ofd',
      type: 'ofd',
      url: '/packages/renderers/ofd/test/fixtures/render-fidelity.ofd',
      expectedStrategy: 'provider-dom',
    },
    {
      filename: 'first-page.typ',
      type: 'typ',
      content: '#set page(width: 160pt, height: 120pt, fill: rgb("f97316"))\n#set text(size: 22pt, fill: white)\n#align(center + horizon)[FIRST PAGE]',
      expectedStrategy: 'provider-dom',
    },
    {
      filename: 'sample-presentation.pptx',
      type: 'pptx',
      url: '/apps/viewer-demo/public/example/en/sample-presentation.pptx',
      expectedStrategy: null,
    },
  ] as const;
  const sources = await Promise.all(fixtures.map(async fixture => ({
    filename: fixture.filename,
    type: fixture.type,
    buffer: 'content' in fixture
      ? new TextEncoder().encode(fixture.content).buffer
      : await fetch(fixture.url).then(response => response.arrayBuffer()),
  })));
  const generator = createFileViewerThumbnailGenerator({
    concurrency: 2,
    viewerOptions: {
      presentation: {
        workerUrl: '/packages/renderers/pptx/dist/worker/pptx.worker.js',
        workerType: 'classic',
      },
      typst: {
        compilerWasmUrl: typstCompilerWasmUrl,
        rendererWasmUrl: typstRendererWasmUrl,
      },
      renderers: [
        pdfRenderer,
        wordRenderer,
        spreadsheetRenderer,
        ebookRenderer,
        ofdRenderer,
        typstRenderer,
        presentationRenderer,
      ],
    },
  });
  const results = await generator.generateBatch(sources);
  await generator.destroy();
  const report = await Promise.all(results.map(async (item, index) => {
    if (!item.ok) {
      return { ok: false, index, code: item.error.code, message: item.error.message };
    }
    const bitmap = await createImageBitmap(item.result.blob);
    const value = {
      ok: bitmap.width === 320 && bitmap.height === 240 &&
        item.result.mimeType === 'image/webp' && item.result.blob.size > 100 &&
        (!fixtures[index].expectedStrategy || item.result.strategy === fixtures[index].expectedStrategy) &&
        item.result.strategy !== 'dom-fallback' && !item.result.degraded,
      index,
      rendererId: item.result.rendererId,
      strategy: item.result.strategy,
      degraded: item.result.degraded,
      width: bitmap.width,
      height: bitmap.height,
      size: item.result.blob.size,
    };
    bitmap.close();
    return value;
  }));
  const slotCount = document.querySelectorAll('[data-file-viewer-thumbnail-slot]').length;
  const passed = report.every(item => item.ok) && slotCount === 0;
  output.dataset.status = passed ? 'passed' : 'failed';
  output.textContent = JSON.stringify({ passed, slotCount, report }, null, 2);
} catch (error) {
  output.dataset.status = 'failed';
  output.textContent = JSON.stringify({
    passed: false,
    error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
  }, null, 2);
}

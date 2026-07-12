import { createFileViewerThumbnailGenerator } from '../src/index.js';

const output = document.querySelector('#result') as HTMLElement;

try {
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = 640;
  sourceCanvas.height = 480;
  const sourceContext = sourceCanvas.getContext('2d') as CanvasRenderingContext2D;
  sourceContext.fillStyle = '#e11d48';
  sourceContext.fillRect(0, 0, 640, 480);
  sourceContext.fillStyle = '#1d4ed8';
  sourceContext.fillRect(80, 80, 480, 320);
  sourceContext.fillStyle = '#ffffff';
  sourceContext.font = 'bold 64px sans-serif';
  sourceContext.fillText('PAGE 1', 190, 265);
  const sourceBlob = await new Promise<Blob>((resolve, reject) => sourceCanvas.toBlob(
    blob => blob ? resolve(blob) : reject(new Error('Unable to create fixture.')),
    'image/png'
  ));

  const generator = createFileViewerThumbnailGenerator({ concurrency: 2 });
  const result = await generator.generate({
    file: new File([sourceBlob], 'first-page.png', { type: 'image/png' }),
    filename: 'first-page.png',
    type: 'png',
  });
  const bitmap = await createImageBitmap(result.blob);
  const report = {
    width: bitmap.width,
    height: bitmap.height,
    mimeType: result.mimeType,
    strategy: result.strategy,
    degraded: result.degraded,
    size: result.blob.size,
  };
  bitmap.close();
  await generator.destroy();

  const mockRenderer = {
    id: 'thumbnail-smoke-renderer',
    definitions: [{
      id: 'thumbnail-smoke',
      label: 'Thumbnail smoke renderer',
      category: 'document',
      extensions: ['thumbmock'],
      async: true,
      capabilities: {},
    }],
    handlers: [{
      rendererId: 'thumbnail-smoke',
      handler: async (_buffer: ArrayBuffer, target: HTMLElement) => {
        const page = document.createElement('div');
        page.style.cssText = 'width:640px;height:480px;background:#f97316;color:white;font:700 64px sans-serif;display:grid;place-items:center';
        page.textContent = 'FALLBACK';
        target.replaceChildren(page);
        return { $el: page, unmount: () => target.replaceChildren() };
      },
    }],
  };
  const fallbackGenerator = createFileViewerThumbnailGenerator({
    concurrency: 1,
    viewerOptions: { renderers: [mockRenderer] as never },
  });
  const fallbackItems = await fallbackGenerator.generateBatch([
    { filename: 'one.thumbmock', type: 'thumbmock', buffer: new ArrayBuffer(1) },
    { filename: 'two.thumbmock', type: 'thumbmock', buffer: new ArrayBuffer(1) },
  ]);
  await fallbackGenerator.destroy();
  const fallbackPassed = fallbackItems.every(item => item.ok &&
    item.result.strategy === 'dom-fallback' && item.result.degraded &&
    item.result.width === 320 && item.result.height === 240 && item.result.blob.size > 100);
  const slotCount = document.querySelectorAll('[data-file-viewer-thumbnail-slot]').length;
  const passed = report.width === 320 && report.height === 240 &&
    report.mimeType === 'image/webp' && report.size > 100 &&
    report.strategy === 'provider-native' && fallbackPassed && slotCount === 0;
  output.dataset.status = passed ? 'passed' : 'failed';
  output.textContent = JSON.stringify({
    passed,
    fallbackPassed,
    fallbackItems: fallbackItems.map(item => item.ok
      ? { ok: true, strategy: item.result.strategy, degraded: item.result.degraded, size: item.result.blob.size }
      : { ok: false, code: item.error.code, message: item.error.message }),
    slotCount,
    ...report,
  }, null, 2);
} catch (error) {
  output.dataset.status = 'failed';
  output.textContent = JSON.stringify({
    passed: false,
    error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
  }, null, 2);
}

import pdfRenderer from '../../renderers/pdf/src/index.js';
import wordRenderer from '../../renderers/word/src/index.js';
import { createFileViewerThumbnailGenerator } from '../src/index.js';

const output = document.querySelector('[data-testid="result"]') as HTMLElement;
const viewerOptions = { renderers: [pdfRenderer, wordRenderer] };
const activeGenerators: Array<ReturnType<typeof createFileViewerThumbnailGenerator>> = [];
const memory = async () => {
  const measure = (performance as Performance & {
    measureUserAgentSpecificMemory?: () => Promise<{ bytes: number }>;
  }).measureUserAgentSpecificMemory;
  return measure ? measure.call(performance).then(result => result.bytes).catch(() => null) : null;
};

try {
  const [pdf, docx] = await Promise.all([
    fetch('/apps/viewer-demo/public/example/en/prince-sample.pdf').then(response => response.blob()),
    fetch('/apps/viewer-demo/public/example/en/calibre-demo.docx').then(response => response.blob()),
  ]);
  const sources = Array.from({ length: 20 }, (_, index) => index % 2 === 0
    ? { filename: `sample-${index}.pdf`, type: 'pdf', file: new File([pdf], `sample-${index}.pdf`) }
    : { filename: `sample-${index}.docx`, type: 'docx', file: new File([docx], `sample-${index}.docx`) });

  const coldDurations: number[] = [];
  const beforeColdMemory = await memory();
  const coldStartedAt = performance.now();
  for (const source of sources) {
    const generator = createFileViewerThumbnailGenerator({ concurrency: 1, viewerOptions });
    activeGenerators.push(generator);
    try {
      const startedAt = performance.now();
      await generator.generate(source);
      coldDurations.push(performance.now() - startedAt);
    } finally {
      await generator.destroy();
      activeGenerators.splice(activeGenerators.indexOf(generator), 1);
    }
  }
  const coldTotalMs = performance.now() - coldStartedAt;

  const pooledDurations: Array<{ type: string; durationMs: number }> = [];
  const pooledGenerator = createFileViewerThumbnailGenerator({ concurrency: 2, viewerOptions });
  activeGenerators.push(pooledGenerator);
  const pooledStartedAt = performance.now();
  for await (const item of pooledGenerator.generateStream(sources)) {
    if (!item.ok) throw item.error;
    pooledDurations.push({ type: item.source.type || '', durationMs: item.result.durationMs });
  }
  const pooledTotalMs = performance.now() - pooledStartedAt;
  await pooledGenerator.destroy();
  activeGenerators.splice(activeGenerators.indexOf(pooledGenerator), 1);
  const afterPooledMemory = await memory();
  const average = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;
  const perFormat = (type: string) => average(
    pooledDurations.filter(item => item.type === type).map(item => item.durationMs)
  );
  const report = {
    passed: document.querySelectorAll('[data-file-viewer-thumbnail-slot]').length === 0,
    samples: sources.length,
    coldStartMs: Math.round(coldDurations[0]),
    repeatedViewerTotalMs: Math.round(coldTotalMs),
    pooledTotalMs: Math.round(pooledTotalMs),
    pooledThroughputPerSecond: Number((sources.length / (pooledTotalMs / 1000)).toFixed(2)),
    speedup: Number((coldTotalMs / pooledTotalMs).toFixed(2)),
    averagePdfMs: Math.round(perFormat('pdf')),
    averageDocxMs: Math.round(perFormat('docx')),
    measuredMemoryBefore: beforeColdMemory,
    measuredMemoryAfter: afterPooledMemory,
  };
  output.dataset.status = report.passed ? 'passed' : 'failed';
  output.textContent = JSON.stringify(report, null, 2);
} catch (error) {
  await Promise.allSettled(activeGenerators.map(generator => generator.destroy()));
  output.dataset.status = 'failed';
  output.textContent = JSON.stringify({
    passed: false,
    error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
  }, null, 2);
}

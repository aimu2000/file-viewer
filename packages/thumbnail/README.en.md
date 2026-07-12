# @file-viewer/thumbnail

Browser thumbnail generation for Flyfish File Viewer. It reuses `createViewer()`, installed renderers, optional native thumbnail adapters, a bounded viewer pool, ordered batch results, and completion-order streaming.

```ts
import { createFileViewerThumbnailGenerator } from '@file-viewer/thumbnail'

const generator = createFileViewerThumbnailGenerator({
  // Uses the same preset/renderers configuration as createViewer().
  viewerOptions: { preset: 'all' },
  concurrency: 2,
})

const result = await generator.generate({ file, filename: file.name })
for await (const item of generator.generateStream(files)) {
  if (item.ok) await upload(item.result.blob)
}
await generator.destroy()
```

Each item can override `width`, `height`, `format: 'webp' | 'jpeg' | 'png'`, `quality`, `fit`, `background`, `timeoutMs`, and `signal`. `generate()` returns the Blob, actual MIME type, renderer ID, duration, `provider-native | provider-dom | dom-fallback` strategy, and `degraded` state. Batch results remain input-ordered and isolate failures; stream results are completion-ordered, carry the original index, and keep pending Blob results bounded by the concurrency window.

Failures use `FileViewerThumbnailError` with stable codes: `browser-required`, `unsupported`, `timeout`, `aborted`, `capture-failed`, `capture-unavailable`, `tainted-canvas`, `empty-output`, `destroyed`, and `invalid-options`.

- Requires a real browser. Server applications must invoke it inside Chromium.
- PDF and images use native capture; Office, OFD, and ebooks expose a first-content target.
- Other renderers use a DOM fallback and return `degraded: true`.
- Source files and generated thumbnails are never persisted by this package.

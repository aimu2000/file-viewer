# @file-viewer/renderer-pdf

Standalone PDF renderer package for Flyfish File Viewer. It is powered by PDF.js and provides page rendering, navigation, outline, search, zoom, print, and HTML export support.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { pdfRenderer } from '@file-viewer/renderer-pdf'

const options = {
  rendererMode: 'replace',
  renderers: pdfRenderer,
}
```

You can combine it with other renderer packages:

```ts
const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer],
}
```

## Offline Assets

PDF preview depends on the PDF.js worker, cMaps, WASM helpers, and standard fonts. Asset paths use the same unified options as `@file-viewer/core`:

```ts
const options = {
  renderers: pdfRenderer,
  pdf: {
    workerUrl: '/vendor/pdf/pdf.worker.mjs',
    cMapUrl: '/vendor/pdf/cmaps/',
    wasmUrl: '/vendor/pdf/wasm/',
    standardFontDataUrl: '/vendor/pdf/standard_fonts/',
  },
}
```

## Migration Note

PDF rendering has moved out of `@file-viewer/core` into this package, and `pdfjs-dist` is now declared only by `@file-viewer/renderer-pdf`. Installing core or a standard component package no longer pulls PDF.js; explicitly assemble this renderer when PDF preview is needed, or use `@file-viewer/preset-all`.

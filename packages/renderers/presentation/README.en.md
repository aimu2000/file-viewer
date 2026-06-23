# @file-viewer/renderer-presentation

Standalone presentation renderer package for Flyfish File Viewer. It is powered by `@file-viewer/pptx` and provides progressive PPTX/PPTM/POTX/POTM/PPSX/PPSM slide rendering, zoom, print, and HTML export.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { presentationRenderer } from '@file-viewer/renderer-presentation'

const options = {
  rendererMode: 'replace',
  renderers: presentationRenderer,
}
```

You can compose it with other renderers:

```ts
const options = {
  rendererMode: 'replace',
  renderers: [presentationRenderer],
}
```

## Notes

- This package focuses on OOXML presentation formats: `pptx`, `pptm`, `potx`, `potm`, `ppsx`, and `ppsm`.
- `odp` remains handled by the core OpenDocument compatibility renderer, keeping different format families separated.
- The rendering path reuses `@file-viewer/pptx` Worker based slide output and asset parsing, so it is a good fit for on-demand loading.

## Migration

`@file-viewer/core` no longer depends on `@file-viewer/pptx` directly. PowerPoint preview is provided by this renderer package and `@file-viewer/preset-all`. Core-only installs show a clear missing-renderer message for PPTX; pass `allRenderers` when you need the same complete format matrix as the official demo.

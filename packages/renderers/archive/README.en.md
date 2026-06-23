# @file-viewer/renderer-archive

Standalone archive renderer package for Flyfish File Viewer. It reads ZIP, TAR, GZIP, RAR, 7z, and other archive directories with `libarchive.js` Worker + WASM, then extracts internal files only when the user opens them.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { archiveRenderer } from '@file-viewer/renderer-archive'

const options = {
  rendererMode: 'replace',
  renderers: archiveRenderer,
}
```

You can also compose it with other renderer packages:

```ts
import { archiveRenderer } from '@file-viewer/renderer-archive'
import { pdfRenderer } from '@file-viewer/renderer-pdf'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer, cadRenderer, archiveRenderer],
}
```

## Capabilities

- Previews ZIP, TAR, GZIP, RAR, 7z, and common archive directories.
- Uses `libarchive.js` Worker + WASM first to keep large archive parsing off the main thread.
- Falls back to ZIP / TAR / GZIP parsing when the Worker cannot be started, which helps mobile WebViews, local static servers, and private intranet deployments.
- Extracts internal files on demand, then delegates nested previews through `renderNestedBuffer` or the core dispatcher.
- Includes archive size limits, entry preview limits, worker timeout, IndexedDB cache, and single-entry download.

## Offline Assets

Default asset paths are:

- `vendor/libarchive/worker-bundle.js`
- `vendor/libarchive/libarchive.wasm`

For private deployments, override them with `options.archive.workerUrl` and `options.archive.wasmUrl`.

```ts
const options = {
  archive: {
    workerUrl: '/file-viewer/vendor/libarchive/worker-bundle.js',
    wasmUrl: '/file-viewer/vendor/libarchive/libarchive.wasm',
    cache: true,
    workerTimeoutMs: 30000,
  },
}
```

## Migration Note

The core package no longer bundles the archive renderer and no longer installs `libarchive.js` for the archive pipeline. ZIP/TAR/GZIP fallback, `jszip`, cache, and Worker logic are owned by this package; core may still temporarily retain `jszip` for the OFD vendor path until OFD is fully extracted. Install this renderer explicitly, or use `@file-viewer/preset-all`, when archive preview is required.

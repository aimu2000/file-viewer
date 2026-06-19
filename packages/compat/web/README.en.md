# @flyfish-group/file-viewer-web

Pure web file preview package. This package is the historical alias of `@file-viewer/web` and now provides the same native DOM mounting API: it creates the complete Flyfish Viewer inside your target container.

```bash
npm install @flyfish-group/file-viewer-web@2.0.0
```

```ts
import { mountViewer } from '@flyfish-group/file-viewer-web'

const controller = mountViewer(document.getElementById('viewer')!, {
  url: '/files/demo.pdf',
  options: {
    theme: 'light',
    toolbar: { position: 'bottom-right' },
    search: { maxMatches: 1000 }
  },
  onEvent(event) {
    console.log(event.type, event.event, event.payload)
  }
})

controller.reload()
```

For authenticated files, download the file in your host application first and pass a `Blob` plus a filename:

```ts
const blob = await fetch('/api/files/contract', { credentials: 'include' }).then(res => res.blob())

mountViewer(document.getElementById('viewer')!, {
  file: blob,
  name: 'contract.pdf'
})
```

## Script Tag Usage

No-build projects can self-host the IIFE bundle. It exposes `window.FlyfishFileViewerWeb`:

```html
<div id="viewer" style="height: 720px"></div>
<script src="/vendor/file-viewer-web/flyfish-file-viewer-web.iife.js"></script>
<script>
  window.FlyfishFileViewerWeb.mountViewer(document.getElementById('viewer'), {
    url: '/files/demo.docx',
    options: { theme: 'light' }
  })
</script>
```

Browsers cannot resolve a bare package name such as `@flyfish-group/file-viewer-web` without a build tool. Use a static URL, the IIFE global bundle, or an import map. Workers, WASM files, and examples can be self-hosted with:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

`options` are passed to the shared core and cover theme, toolbar operations, watermarking, search, AI-friendly text chunks, unified zoom, archive workers, IndexedDB cache, and size limits. Lifecycle, operation availability, search state, and document location updates are emitted through `onEvent`.

New projects should prefer the standard package name `@file-viewer/web`. Official documentation: https://doc.flyfish.dev/

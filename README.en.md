# Flyfish Viewer

[Simplified Chinese](README.md) | [English](README.en.md)

Bring Word, Excel, PowerPoint, PDF, Typst, archives, email, audio, ebooks, drawings, CAD, 3D models, Markdown, images, and source code preview into the browser with a clean, deployable viewer.

`@flyfish-group/file-viewer3` is a pure frontend file preview component built with Vue 3, TypeScript, and Vite. Vue 2.7 projects should use the matching `@flyfish-group/file-viewer` package. The Vue 3 build is also the baseline runtime for the React, vanilla JavaScript, and iframe integration packages.

The viewer does not require a backend conversion service. It is designed for OA systems, knowledge bases, attachment centers, workflow platforms, customer support portals, document approval flows, intranet systems, and offline-capable deployments where file preview should feel like a maintained product module rather than a temporary feature.

- npm for Vue 3: [@flyfish-group/file-viewer3](https://www.npmjs.com/package/@flyfish-group/file-viewer3)
- npm for Vue 2.7: [@flyfish-group/file-viewer](https://www.npmjs.com/package/@flyfish-group/file-viewer)
- npm for React: [@flyfish-group/file-viewer-react](https://www.npmjs.com/package/@flyfish-group/file-viewer-react)
- npm for vanilla JavaScript: [@flyfish-group/file-viewer-web](https://www.npmjs.com/package/@flyfish-group/file-viewer-web)
- Official documentation: [doc.flyfish.dev](https://doc.flyfish.dev)
- Online demo: [viewer.flyfish.dev](https://viewer.flyfish.dev)
- Document comparison demo: [viewer.flyfish.dev/compare.html](https://viewer.flyfish.dev/compare.html)
- Release downloads: [github.com/flyfish-dev/file-viewer/releases](https://github.com/flyfish-dev/file-viewer/releases)
- GitHub artifact repository: [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer)
- Gitee artifact mirror: [gitee.com/flyfish-dev/file-viewer](https://gitee.com/flyfish-dev/file-viewer)
- Source access and commercial customization: [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)

## Current Packages

| Stack | Package | Version | Recommended branch | Notes |
| --- | --- | --- | --- | --- |
| Vue 3 | `@flyfish-group/file-viewer3` | `1.0.25` | `v3` | Recommended version and the runtime baseline for React / vanilla JS iframe integrations |
| Vue 2.7 | `@flyfish-group/file-viewer` | `1.0.25` | `main` | Vue 2 compatible package with the same format coverage and API semantics |
| React 17 / 18 / 19 | `@flyfish-group/file-viewer-react` | `1.0.25` | adapter package | iframe component that loads `/file-viewer/index.html` by default |
| Vanilla JavaScript | `@flyfish-group/file-viewer-web` | `1.0.25` | adapter package | iframe helpers and static viewer asset copier |

For intranet or offline environments, this artifact repository also ships npm tarballs under `artifacts/`:

```bash
npm install ./artifacts/flyfish-group-file-viewer3-1.0.25.tgz
npm install ./artifacts/flyfish-group-file-viewer-1.0.25.tgz
npm install ./artifacts/flyfish-group-file-viewer-web-1.0.25.tgz
npm install ./artifacts/flyfish-group-file-viewer-react-1.0.25.tgz
```

When installing the React tarball offline, install the same-version web tarball first because the React package depends on `@flyfish-group/file-viewer-web`.

If you use pnpm 10 and see `Ignored build scripts: @flyfish-group/file-viewer-web`, run:

```bash
pnpm approve-builds
```

Then allow `@flyfish-group/file-viewer-web`, or manually copy the bundled viewer assets:

```bash
pnpm exec file-viewer-copy-assets ./public/file-viewer
```

GitHub Releases provide all distribution downloads:

| File | Purpose |
| --- | --- |
| `file-viewer-v3-*-demo.tar.gz` | Main demo / iframe private deployment static site; extract it and use `/index.html?url=...` |
| `file-viewer-v3-*-adapter-demo.tar.gz` | React / vanilla JavaScript adapter demo site |
| `file-viewer-v3-*-lib-dist.tar.gz` | Vue 3 library dist for offline inspection or self-hosted packaging |
| `file-viewer-v3-*-docs.tar.gz` | Documentation site static output |
| `flyfish-group-file-viewer3-*.tgz` | Vue 3 local npm package |
| `flyfish-group-file-viewer-*.tgz` | Vue 2.7 local npm package |
| `flyfish-group-file-viewer-web-*.tgz` | Vanilla JavaScript iframe helper with viewer asset copy tooling |
| `flyfish-group-file-viewer-react-*.tgz` | React iframe component; install the same-version web package together with it |

![Flyfish Viewer demo](docs/_images/demo-main.png)

## Why Use It

- **Pure frontend and serverless.** File parsing and rendering happen in the browser. You do not need Office Server, a LibreOffice daemon, or a document conversion backend.
- **Broad format coverage.** The current release maps 152 extensions across 20 preview pipelines, including Office, PDF, OFD, Typst, archives, email, EDA files, CAD, 3D models, Excalidraw, draw.io, EPUB, UMD, Markdown, images, audio, video, and source code.
- **Lazy loaded renderers.** Heavy PDF, Office, OFD, Typst, archive, email, CAD, 3D, ebook, Markdown, and code highlighting dependencies are loaded only when the file type needs them.
- **Production-ready operations.** The viewer includes original file download, full rendered printing, rendered HTML export, watermark options, theme options, lifecycle hooks, iframe events, and before-operation guards for permission checks.
- **Better document reading.** Word and PDF keep a grey workspace, white paper surface, centered reading, width fitting, navigation, zoom, rotation, and complete print / HTML export paths.
- **Renderer-native zoom controls.** The common toolbar can zoom in, zoom out, and reset through per-format providers for PDF, Word, PPTX, virtual Excel tables, images, CAD, OFD, Typst, Markdown, code, and drawing files, avoiding fragile host-level CSS transforms.
- **Controlled theming.** `options.theme` supports `light`, `dark`, and `system`. Light business UIs can lock the viewer to `light` even when the operating system is in dark mode.
- **PDF toolbar ergonomics.** `toolbar.position` supports `auto`, `top`, and `bottom-right`. In `auto` mode, PDF uses a bottom-right floating operation bar to avoid duplicating the PDF navigation toolbar.
- **Demo and comparison views.** The repository includes the main demo and a standalone `/compare.html` page for side-by-side document comparison.
- **Component and standalone modes.** Use it as a Vue component, or deploy the static viewer and embed it through iframe in any system.
- **Artifact-first delivery.** This public repository contains minified build artifacts, static demos, documentation output, sample files, Docker deployment assets, and npm tarballs. It does not contain the private source tree.

## Supported Formats

The viewer is organized around preview pipelines rather than one-off file extensions.

| Category | Extensions | Rendering pipeline | Typical use |
| --- | --- | --- | --- |
| Word | `docx`, `docm`, `dotx`, `dotm` | `docx-preview`, read-only page preview, print and HTML export | Modern Word documents and templates |
| Legacy Word | `doc`, `dot` | `msdoc-viewer` with Word-like paper surface and CFB tolerance fixes | Old Word 97-2003 files |
| Excel | `xlsx`, `xltx` | `styled-exceljs` plus virtual table rendering, merged cells, styles, auto text color, workbook images | Business spreadsheets and templates |
| Excel-compatible | `xlsm`, `xlsb`, `xls`, `xlt`, `xltm`, `csv`, `ods`, `fods`, `numbers` | Progressive spreadsheet parsing and virtual rendering | Legacy spreadsheets and lightweight data preview |
| PowerPoint | `pptx`, `pptm`, `potx`, `potm`, `ppsx`, `ppsm` | Slide preview with images, shapes, theme backgrounds, clipping, and EMF fallback | Presentations, training decks, proposals |
| PDF | `pdf` | `pdfjs-dist`, streaming same-origin loading, Range support, zoom, rotation, page thumbnails, outline tree, width fitting, print, HTML export | Contracts, invoices, official layout documents |
| OFD | `ofd` | Browser-side OFD preview based on `DLTech21/ofd.js` source | Chinese e-invoices, government documents, archives |
| Typst | `typ`, `typst` | Direct Typst source rendering with browser WASM compiler and SVG pages | Technical reports, papers, engineering documents |
| Archives | `zip`, `zipx`, `7z`, `rar`, `tar`, `gz`, `tgz`, `bz2`, `xz`, `zst`, `cab`, `iso`, `jar`, `apk`, `cbz`, `cbr`, and more | `libarchive.js` Worker, directory listing, lazy extraction, IndexedDB cache | Attachment packages and internal document bundles |
| Email | `eml`, `msg` | `postal-mime` for EML, `@kenjiuno/msgreader` for MSG, headers, HTML/text body, attachment preview | Email archives and support tickets |
| EDA | `olb`, `dra` | CFB-based OrCAD / Allegro structure inspection, trees, symbols, footprints, padstack candidates, properties, strings, diagnostics | Component libraries and EDA attachments |
| CAD | `dwg`, `dxf`, `dwf`, `dwfx`, `xps` | `@flyfish-dev/cad-viewer` preview. DWG uses Worker + LibreDWG WASM, DXF uses a JS parser, and DWF/DWFx/XPS use the native `dwf-viewer` path for W2D/W3D/XPS graphics | Engineering drawings and AutoCAD archives |
| 3D models | `glb`, `gltf`, `obj`, `stl`, `ply`, `fbx`, `dae`, `3ds`, `3mf`, `amf`, `usd`, `usda`, `usdc`, `usdz`, `kmz`, `pcd`, `wrl`, `vrml`, `xyz`, `vtk`, `vtp`, `step`, `stp`, `iges`, `igs`, `ifc`, `3dm` | Three.js interactive preview, with conversion guidance for heavy CAD/BIM kernels | 3D assets, point clouds, design models |
| Excalidraw | `excalidraw` | Official `@excalidraw/excalidraw` restore and `exportToSvg` read-only rendering | Whiteboard sketches and product diagrams |
| draw.io | `drawio`, `dio` | Official diagrams.net `GraphViewer` | Flowcharts and architecture diagrams |
| EPUB | `epub` | `epubjs` table of contents and scrolling reader | Ebooks and long training materials |
| UMD ebook | `umd` | UMD metadata, chapters, offsets, zlib text blocks | Legacy mobile ebooks |
| Markdown | `md`, `markdown` | Markdown reading surface with theme-aware styles | README files and knowledge base articles |
| Images | `gif`, `jpg`, `jpeg`, `bmp`, `tiff`, `tif`, `png`, `svg`, `webp` | Native image preview | Image attachments and design assets |
| Source and text | `txt`, `json`, `js`, `mjs`, `cjs`, `css`, `java`, `py`, `html`, `htm`, `jsx`, `ts`, `tsx`, `xml`, `log`, `vue`, `yaml`, `yml`, `ini`, `sh`, `bash`, `sql`, `go`, `rs`, `php`, `c`, `cpp`, `cc`, `h`, `hpp`, `cs`, `diff` | Lightweight `highlight.js` language-specific highlighting, HTML shown as source | Logs, configs, code snippets, API responses |
| Audio | `mp3`, `mpeg`, `wav`, `ogg`, `oga`, `opus`, `m4a`, `aac`, `flac`, `weba` | Native browser audio player | Recordings and audio attachments |
| Video | `mp4` | Native browser video player | Screen recordings and demo videos |

## Vue 3 Integration

```bash
npm install @flyfish-group/file-viewer3
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<script setup lang="ts">
import { ref } from 'vue'

const url = ref('/files/demo.pdf')

const options = {
  theme: 'light',
  toolbar: { position: 'bottom-right', download: true, print: true, exportHtml: true },
  watermark: { text: 'Internal Preview', opacity: 0.14 },
  pdf: { streaming: 'same-origin', rangeChunkSize: 64 * 1024 }
}
</script>

<template>
  <div style="height: 100vh">
    <file-viewer :url="url" :options="options" />
  </div>
</template>
```

For local files or authenticated downloads, pass a `File` object:

```ts
const response = await fetch('/api/files/contract', { credentials: 'include' })
const blob = await response.blob()

file.value = new File([blob], 'contract.pdf', { type: blob.type })
```

The filename matters. The viewer uses the extension to choose the correct rendering pipeline.

## Vue 2.7 Integration

```bash
npm install @flyfish-group/file-viewer
```

```ts
import Vue from 'vue'
import FileViewer from '@flyfish-group/file-viewer'

Vue.use(FileViewer)
```

```vue
<template>
  <div style="height: 100vh">
    <file-viewer :url="url" :options="options" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: '/files/demo.pdf',
      options: {
        theme: 'light',
        toolbar: { position: 'bottom-right' }
      }
    }
  }
}
</script>
```

The Vue 2 and Vue 3 package lines share the same user-facing capabilities and option semantics.

## React Integration

The React package is an iframe adapter. It reuses the Vue 3 baseline viewer that is bundled by `@flyfish-group/file-viewer-web`.

```bash
npm install @flyfish-group/file-viewer-react
```

```tsx
import FileViewer from '@flyfish-group/file-viewer-react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/files/demo.pdf"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' },
          watermark: { text: 'Internal Preview', opacity: 0.14 }
        }}
        onViewerEvent={(event) => {
          console.log(event.type, event.event, event.payload)
        }}
      />
    </div>
  )
}
```

By default, the iframe loads `/file-viewer/index.html`. If your static assets are deployed elsewhere, pass `viewerUrl`.

## Vanilla JavaScript Integration

```bash
npm install @flyfish-group/file-viewer-web
```

```html
<div id="viewer" style="height: 100vh"></div>

<script type="module">
  import { mountViewerFrame } from '@flyfish-group/file-viewer-web'

  mountViewerFrame(document.getElementById('viewer'), {
    url: '/files/demo.pdf',
    options: {
      theme: 'light',
      toolbar: { position: 'bottom-right' },
      archive: { cache: true, workerTimeoutMs: 30000 }
    },
    onEvent(event) {
      console.log(event.type, event.event, event.payload)
    }
  })
</script>
```

The web package copies the static viewer into `public/file-viewer` during installation. If your package manager blocks install scripts, run:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

## iframe Protocol

If you cannot use npm helpers, deploy the static viewer and pass a file URL through query parameters:

```html
<iframe
  src="/file-viewer/index.html?url=%2Ffiles%2Fdemo.pdf&options=%7B%22theme%22%3A%22light%22%2C%22toolbar%22%3A%7B%22position%22%3A%22bottom-right%22%7D%7D"
  style="width: 100%; height: 100vh; border: 0"
></iframe>
```

For authenticated files, download the file in the host system and push a `Blob` to the iframe:

```ts
const viewerUrl = '/file-viewer/index.html'
const viewerOrigin = location.origin
const filename = 'contract.pdf'
const options = { theme: 'light', toolbar: { position: 'bottom-right' } }
const frame = document.getElementById('viewer') as HTMLIFrameElement

frame.src =
  `${viewerUrl}?name=${encodeURIComponent(filename)}` +
  `&from=${encodeURIComponent(location.origin)}` +
  `&options=${encodeURIComponent(JSON.stringify(options))}`

frame.onload = async () => {
  const response = await fetch('/api/files/contract', { credentials: 'include' })
  const blob = await response.blob()
  frame.contentWindow?.postMessage(blob, viewerOrigin)
}
```

The viewer validates `event.origin === from` and only accepts `Blob` messages from the declared origin.

## Core Options

| Option | Description |
| --- | --- |
| `theme` | `light`, `dark`, or `system`. Default is `system`. Use `light` when embedding in a fixed light UI. |
| `toolbar` | `true`, `false`, or an object that controls download, print, HTML export, unified zoom controls, and toolbar position. |
| `toolbar.zoom` | Shows or hides the built-in zoom group. The actual capability is provided by each renderer, so unsupported or interaction-sensitive formats are not force-scaled. |
| `toolbar.position` | `auto`, `top`, or `bottom-right`. Default `auto` floats the operation bar at bottom right for PDF and keeps other formats at top. |
| `watermark` | Text or image watermark configuration. Watermark participates in preview, print, and exported HTML. |
| `archive.workerUrl` | Custom `libarchive.js` Worker URL for special private deployments. By default the viewer tries `vendor/libarchive/worker-bundle.js` under the current base and falls back to the bundled Worker automatically. |
| `archive.wasmUrl` | Custom libarchive WASM URL used by the bundled Worker fallback. |
| `archive.workerTimeoutMs` | Worker initialization, encryption check, and directory-read timeout. Defaults to 30000ms and then falls back to ZIP/TAR/GZIP compatibility mode when possible. |
| `archive.cache` | Enables IndexedDB cache for extracted archive entries. |
| `archive.maxArchiveSize` | Maximum archive size allowed for directory parsing. |
| `archive.maxEntryPreviewSize` | Maximum extracted entry size allowed for online preview. |
| `pdf.streaming` | PDF URL loading strategy. Same-origin streaming is enabled by default. |
| `pdf.rangeChunkSize` | PDF.js Range request chunk size. |
| `typst.compilerWasmUrl` | Custom Typst compiler WASM URL. |
| `hooks` | Vue component lifecycle hooks for load and unload events. |
| `beforeOperation` | Vue component guard before download, print, HTML export, or zoom actions. Return `false` to cancel. |

React, vanilla JavaScript, and iframe integrations cannot serialize function hooks into query parameters. Use `onViewerEvent` or `onEvent` to receive lifecycle and operation events from the iframe.

## Printing, Exporting, and Watermarks

- Download keeps the original file bytes. It does not write rendered output back into the source file.
- Print opens a print-only document containing the rendered body and watermark, without the demo shell or host UI.
- PDF print and HTML export use a dedicated adapter that renders complete pages rather than only the visible canvas.
- Word print and HTML export preserve the white paper surface and page sizing while removing preview-only layout wrappers.
- Spreadsheet, archive, email, EPUB, audio, video, and 3D pipelines hide unreliable print buttons when the full document cannot be printed consistently.
- HTML export clones the current rendered output and converts canvas content where possible.

## Document Comparison

The production demo includes a standalone comparison page:

[https://viewer.flyfish.dev/compare.html](https://viewer.flyfish.dev/compare.html)

It supports two-pane document preview, built-in samples, URL input, local upload, swapping panes, reset, and synchronized scrolling. The comparison page is intentionally separate from the main viewer entry so that the primary component API stays small and predictable.

## Private Deployment

For npm-based iframe integrations, make sure your final static output contains:

```txt
file-viewer/index.html
file-viewer/assets/*
file-viewer/vendor/libarchive/worker-bundle.js  # optional unless you want a static Worker path
file-viewer/vendor/libarchive/libarchive.wasm   # keep next to worker-bundle.js when using archive.workerUrl
```

The artifact repository also contains:

| Path | Purpose |
| --- | --- |
| `dist/` | Minified library build artifacts |
| `demo/` | Static production demo, including `index.html` and `compare.html` |
| `adapter-demo/` | React and vanilla JavaScript integration demo |
| `docs/` | Static documentation site output |
| `example/` | Sample files used by the demo |
| `artifacts/` | npm tarballs and packaged static build archives |
| `README.md` | Default Chinese documentation |
| `README.en.md` | English documentation |
| `LICENSE` | Apache-2.0 license |

## Docker

The project provides a static nginx runtime image and build scripts for `linux/amd64` and `linux/arm64`. A typical deployment can serve the demo and comparison page directly:

```bash
docker run --rm -p 8080:80 flyfishdev/file-viewer:1.0.25
```

Then open:

```txt
http://localhost:8080/
http://localhost:8080/compare.html
```

If you build the image yourself, use the provided `Dockerfile` and keep the static viewer assets, examples, and vendor WASM files together.

## Public Artifacts vs Source Code

This public repository is for artifact delivery. It contains minified build output, static demo sites, sample files, documentation output, and npm tarballs. It intentionally does not include the private source tree. The Gitee mirror is synchronized from a clean latest-artifact snapshot when needed, so domestic users can clone the full expanded artifact repository without inheriting oversized binary release history.

If you need source code access, second development resources, or commercial customization, use the self-service source access portal:

[https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)

The self-service source access price is 4.99. It is designed to make legitimate second development and commercial evaluation straightforward without mixing source delivery into the public artifact repository.

## License and Attribution

Flyfish Viewer is distributed under the Apache-2.0 license. You may use the public artifacts according to that license.

For second development or commercial use, please keep clear attribution to Flyfish Viewer and contribute useful fixes or compatibility improvements back whenever possible. This keeps the preview ecosystem healthier for everyone using the component in real business systems.

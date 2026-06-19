# Flyfish Viewer

[Simplified Chinese](README.md) | [English](README.en.md)

Bring Word, Excel, PowerPoint, PDF, Typst, archives, email, audio/video, ebooks, drawings, CAD, geospatial data, 3D models, Markdown, images, fonts, design assets, structured data, and source code preview into the browser with a clean, deployable viewer.

`@file-viewer/core` provides the low-level preview capabilities, format matrix, lifecycle events, and operation APIs. Vue 3, Vue 2, React, vanilla JavaScript, jQuery, and Svelte wrappers provide native component experiences, type exports, and ecosystem-specific interaction layers on top of the same foundation. New integrations should prefer the standard `@file-viewer/*` package names; historical `@flyfish-group/*` package names remain synchronized.

The viewer does not require a backend conversion service. It is designed for OA systems, knowledge bases, attachment centers, workflow platforms, customer support portals, document approval flows, intranet systems, and offline-capable deployments where file preview should feel like a maintained product module rather than a temporary feature.

- npm for Vue 3 standard package: [@file-viewer/vue3](https://www.npmjs.com/package/@file-viewer/vue3)
- npm for Vue 3 compatibility package: [@flyfish-group/file-viewer3](https://www.npmjs.com/package/@flyfish-group/file-viewer3)
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
| Core | `@file-viewer/core` | `2.0.0` | `main` | Framework-neutral format matrix, preview capabilities, events, and operation APIs |
| Vue 3 | `@file-viewer/vue3` / `@flyfish-group/file-viewer3` | `2.0.0` | `v3` | Native Vue 3 component package now maintained from the independent `packages/wrappers/vue3` package line |
| Vue 2.7 | `@file-viewer/vue2.7` / `@flyfish-group/file-viewer` | `2.0.0` | `v2` | Native Vue 2 package with the same format coverage and API semantics |
| React 17 / 18 / 19 | `@file-viewer/react` / `@flyfish-group/file-viewer-react` | `2.0.0` | wrapper package | Native React component backed by the shared core |
| Vanilla JavaScript | `@file-viewer/web` / `@flyfish-group/file-viewer-web` | `2.0.0` | wrapper package | `mountViewer(container, options)` native DOM mounting and asset tooling |

For intranet or offline environments, this artifact repository also ships npm tarballs under `artifacts/`:

```bash
npm install ./artifacts/flyfish-group-file-viewer3-2.0.0.tgz
npm install ./artifacts/file-viewer-core-2.0.0.tgz
npm install ./artifacts/file-viewer-vue3-2.0.0.tgz
npm install ./artifacts/flyfish-group-file-viewer-2.0.0.tgz
npm install ./artifacts/flyfish-group-file-viewer-web-2.0.0.tgz
npm install ./artifacts/flyfish-group-file-viewer-react-2.0.0.tgz
```

The public artifact repository ships tarballs for core, Vue 3, Vue 2, React, React legacy, vanilla JavaScript, jQuery, Svelte, and historical compatibility packages. The unscoped `file-viewer3` compatibility package is still published to npm, but its package body duplicates `@flyfish-group/file-viewer3`, so the artifact repository does not store a second copy. React and vanilla JavaScript packages are native wrappers; use npm installation for the cleanest dependency resolution.

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
| `file-viewer-v2-*-demo.tar.gz` | Main demo static site with the primary viewer and `/compare.html` document comparison page |
| `file-viewer-v2-*-wrapper-demo.tar.gz` | React / vanilla JavaScript wrapper demo site |
| `file-viewer-v2-*-lib-dist.tar.gz` | Vue 3 library dist for offline inspection or self-hosted packaging |
| `file-viewer-v2-*-docs.tar.gz` | Documentation site static output |
| `file-viewer-core-*.tgz` | `@file-viewer/core` pure TypeScript foundation tarball |
| `file-viewer-vue3-*.tgz` | Vue 3 standard package tarball |
| `file-viewer-vue2.7-*.tgz` | Vue 2.7 standard wrapper tarball |
| `file-viewer-vue2.6-*.tgz` | Vue 2.6 standard wrapper tarball |
| `file-viewer-react-*.tgz` | React 18/19 standard wrapper tarball |
| `file-viewer-react-legacy-*.tgz` | React 16.8/17 standard wrapper tarball |
| `file-viewer-web-*.tgz` | Pure Web standard wrapper with viewer asset tooling |
| `file-viewer-jquery-*.tgz` | jQuery standard wrapper tarball |
| `file-viewer-svelte-*.tgz` | Svelte standard wrapper tarball |
| `flyfish-group-file-viewer3-*.tgz` | Vue 3 local npm package |
| `flyfish-group-file-viewer-*.tgz` | Vue 2.7 local npm package |
| `flyfish-group-file-viewer-web-*.tgz` | Historical vanilla JavaScript package with `mountViewer` native mounting and asset tooling |
| `flyfish-group-file-viewer-react-*.tgz` | Historical React package with a native React component entry |

The unscoped `file-viewer3` historical alias remains part of the npm release flow. The artifact repository uses `flyfish-group-file-viewer3-*.tgz` as the Vue 3 compatibility tarball to avoid storing duplicate package bodies.

<!-- FILE_VIEWER_PUBLIC_GENERATED:START -->
## Standard Ecosystem Packages and Public Repositories

This section is generated from `ecosystem/wrappers.json` and `packages/core/src/formats.ts`. The public artifact repository carries the same index so users can find the standard npm packages, historical compatibility packages, and public wrapper repositories from one place.

Core foundation package: `@file-viewer/core`. Core source is maintained only in the private Gitea repository; public GitHub/Gitee repositories publish wrapper source, minified build artifacts, demos, documentation output, examples, and tarballs.

| Framework | Standard npm package | Entrypoints | GitHub | Gitee | Historical aliases |
| --- | --- | --- | --- | --- | --- |
| Vue 3 | `@file-viewer/vue3` | ESM, type declarations | [file-viewer-vue3](https://github.com/flyfish-dev/file-viewer-vue3) | [file-viewer-vue3](https://gitee.com/flyfish-dev/file-viewer-vue3) | `@flyfish-group/file-viewer3`, `file-viewer3` |
| Vue 2.7 | `@file-viewer/vue2.7` | ESM, type declarations | [file-viewer-vue2.7](https://github.com/flyfish-dev/file-viewer-vue2.7) | [file-viewer-vue2.7](https://gitee.com/flyfish-dev/file-viewer-vue2.7) | `@flyfish-group/file-viewer` |
| Vue 2.6 | `@file-viewer/vue2.6` | ESM, type declarations | [file-viewer-vue2.6](https://github.com/flyfish-dev/file-viewer-vue2.6) | [file-viewer-vue2.6](https://gitee.com/flyfish-dev/file-viewer-vue2.6) | none |
| React 18/19 | `@file-viewer/react` | ESM, type declarations | [file-viewer-react](https://github.com/flyfish-dev/file-viewer-react) | [file-viewer-react](https://gitee.com/flyfish-dev/file-viewer-react) | `@flyfish-group/file-viewer-react` |
| React 16.8/17 | `@file-viewer/react-legacy` | ESM, type declarations | [file-viewer-react-legacy](https://github.com/flyfish-dev/file-viewer-react-legacy) | [file-viewer-react-legacy](https://gitee.com/flyfish-dev/file-viewer-react-legacy) | none |
| Pure Web | `@file-viewer/web` | ESM, type declarations, script tag IIFE, worker/WASM viewer assets, asset copy CLI | [file-viewer-web](https://github.com/flyfish-dev/file-viewer-web) | [file-viewer-web](https://gitee.com/flyfish-dev/file-viewer-web) | `@flyfish-group/file-viewer-web` |
| jQuery | `@file-viewer/jquery` | ESM, type declarations | [file-viewer-jquery](https://github.com/flyfish-dev/file-viewer-jquery) | [file-viewer-jquery](https://gitee.com/flyfish-dev/file-viewer-jquery) | none |
| Svelte | `@file-viewer/svelte` | Svelte component, ESM, type declarations | [file-viewer-svelte](https://github.com/flyfish-dev/file-viewer-svelte) | [file-viewer-svelte](https://gitee.com/flyfish-dev/file-viewer-svelte) | none |

The shared core currently declares 23 preview pipelines and 194 file extensions. See the full format guide in this README and the official documentation: https://doc.flyfish.dev/guide/formats
<!-- FILE_VIEWER_PUBLIC_GENERATED:END -->

![Flyfish Viewer demo](docs/_images/demo-main.png)

## Why Use It

- **Pure frontend and serverless.** File parsing and rendering happen in the browser. You do not need Office Server, a LibreOffice daemon, or a document conversion backend.
- **Broad format coverage.** The current release maps 194 extensions across 23 preview pipelines, including Office, PDF, OFD, Typst, archives, email, EDA files, CAD, geospatial data, 3D models, Excalidraw, draw.io, EPUB, UMD, Markdown, images, audio/video, source code, fonts, design assets, and structured data.
- **Lazy loaded renderers.** Heavy PDF, Office, OFD, Typst, archive, email, CAD, geospatial, 3D, ebook, Markdown, HLS, HEIC, data-asset, and code highlighting dependencies are loaded only when the file type needs them.
- **Production-ready operations.** The viewer includes original file download, full rendered printing, rendered HTML export, watermark options, theme options, lifecycle hooks, native event callbacks, and before-operation guards for permission checks.
- **Better document reading.** Word and PDF keep a grey workspace, white paper surface, centered reading, width fitting, navigation, zoom, rotation, and complete print / HTML export paths.
- **Renderer-native zoom controls.** The common toolbar can zoom in, zoom out, and reset through per-format providers for PDF, Word, PPTX, virtual Excel tables, images, CAD, OFD, Typst, Markdown, code, and drawing files, avoiding fragile host-level CSS transforms.
- **Controlled theming.** `options.theme` supports `light`, `dark`, and `system`. Light business UIs can lock the viewer to `light` even when the operating system is in dark mode.
- **PDF toolbar ergonomics.** `toolbar.position` supports `auto`, `top`, and `bottom-right`. In `auto` mode, PDF uses a bottom-right floating operation bar to avoid duplicating the PDF navigation toolbar.
- **Demo and comparison views.** The repository includes the main demo and a standalone `/compare.html` page for side-by-side document comparison.
- **Consistent native wrapper experience.** Core focuses on preview capabilities while Vue 3, Vue 2, React, vanilla JavaScript, jQuery, and Svelte wrappers expose the same option, event, search, zoom, print, and export semantics in each ecosystem.
- **Artifact-first delivery.** This public repository contains minified build artifacts, static demos, documentation output, sample files, Docker deployment assets, and npm tarballs. It does not contain the private source tree.

## Supported Formats

The viewer is organized around preview pipelines rather than one-off file extensions.

| Category | Extensions | Rendering pipeline | Typical use |
| --- | --- | --- | --- |
| Word | `docx`, `docm`, `dotx`, `dotm` | `docx-preview`, read-only page preview, print and HTML export | Modern Word documents and templates |
| Legacy Word | `doc`, `dot` | `msdoc-viewer` with Word-like paper surface and CFB tolerance fixes | Old Word 97-2003 files |
| Compatible documents | `rtf`, `odt` | RTFJS or OpenDocument package parsing with a paper-like reading surface | RTF exports and OpenDocument text documents |
| Excel | `xlsx`, `xltx` | `styled-exceljs` with an optional static Worker plus virtual table rendering, merged cells, styles, auto text color, workbook images, and main-thread fallback | Business spreadsheets and templates |
| Excel-compatible | `xlsm`, `xlsb`, `xls`, `xlt`, `xltm`, `csv`, `ods`, `fods`, `numbers` | Progressive spreadsheet parsing and virtual rendering through the same Worker/fallback path | Legacy spreadsheets and lightweight data preview |
| PowerPoint | `pptx`, `pptm`, `potx`, `potm`, `ppsx`, `ppsm`, `odp` | Open-source `@aiden0z/pptx-renderer` slide preview with lazy loading and windowed slide lists; ODP uses OpenDocument slide text extraction | Presentations, training decks, proposals |
| PDF | `pdf` | `pdfjs-dist`, streaming same-origin loading, Range support, zoom, rotation, page thumbnails, outline tree, width fitting, print, HTML export | Contracts, invoices, official layout documents |
| OFD | `ofd` | Browser-side OFD preview based on `DLTech21/ofd.js` source | Chinese e-invoices, government documents, archives |
| Typst | `typ`, `typst` | Direct Typst source rendering with browser WASM compiler and SVG pages | Technical reports, papers, engineering documents |
| Archives | `zip`, `zipx`, `7z`, `rar`, `tar`, `gz`, `tgz`, `bz2`, `xz`, `zst`, `cab`, `iso`, `jar`, `apk`, `cbz`, `cbr`, and more | Shared core archive renderer with a `libarchive.js` Worker, directory listing, lazy extraction, nested preview, IndexedDB cache, and ZIP/TAR/GZIP fallback | Attachment packages and internal document bundles |
| Email | `eml`, `msg`, `mbox` | `postal-mime` for EML/MBOX, `@kenjiuno/msgreader` for MSG, headers, HTML/text body, attachment preview | Email archives and support tickets |
| EDA | `olb`, `dra` | CFB-based OrCAD / Allegro structure inspection, trees, symbols, footprints, padstack candidates, properties, strings, diagnostics | Component libraries and EDA attachments |
| CAD | `dwg`, `dxf`, `dwf`, `dwfx`, `xps` | `@flyfish-dev/cad-viewer` preview. DWG uses Worker + LibreDWG WASM, DXF uses a JS parser, and DWF/DWFx/XPS use the native `dwf-viewer` path for W2D/W3D/XPS graphics | Engineering drawings and AutoCAD archives |
| Geospatial data | `geojson`, `kml`, `gpx`, `shp` | GeoJSON normalization with `@tmcw/togeojson` and `shpjs`, rendered as an offline SVG map preview | GIS exports, route tracks, map attachment review |
| 3D models | `glb`, `gltf`, `obj`, `stl`, `ply`, `fbx`, `dae`, `3ds`, `3mf`, `amf`, `usd`, `usda`, `usdc`, `usdz`, `kmz`, `pcd`, `wrl`, `vrml`, `xyz`, `vtk`, `vtp`, `step`, `stp`, `iges`, `igs`, `ifc`, `3dm` | Three.js interactive preview, with conversion guidance for heavy CAD/BIM kernels | 3D assets, point clouds, design models |
| Excalidraw | `excalidraw` | Official `@excalidraw/excalidraw` restore and `exportToSvg` read-only rendering | Whiteboard sketches and product diagrams |
| draw.io | `drawio`, `dio` | Official diagrams.net `GraphViewer` | Flowcharts and architecture diagrams |
| EPUB | `epub` | `epubjs` table of contents and scrolling reader | Ebooks and long training materials |
| UMD ebook | `umd` | UMD metadata, chapters, offsets, zlib text blocks | Legacy mobile ebooks |
| Markdown | `md`, `markdown` | Markdown reading surface with theme-aware styles | README files and knowledge base articles |
| Images | `gif`, `jpg`, `jpeg`, `bmp`, `tiff`, `tif`, `png`, `svg`, `webp`, `avif`, `ico`, `heic`, `heif`, `jxl` | Native image preview with HEIC/HEIF conversion loaded only when needed | Image attachments, screenshots, icons, design exports |
| Source and text | `txt`, `json`, `jsonc`, `json5`, `ipynb`, `js`, `mjs`, `cjs`, `css`, `java`, `py`, `html`, `htm`, `jsx`, `ts`, `tsx`, `xml`, `log`, `vue`, `yaml`, `yml`, `toml`, `ini`, `proto`, `hcl`, `tex`, `gv`, `http`, `sh`, `bash`, `sql`, `go`, `rs`, `rb`, `swift`, `kt`, `react`, `php`, `c`, `cpp`, `cc`, `h`, `hpp`, `cs`, `diff` | Lightweight `highlight.js` language-specific highlighting, HTML shown as source | Logs, configs, notebooks, code snippets, API responses |
| Audio | `mp3`, `mpeg`, `wav`, `ogg`, `oga`, `opus`, `m4a`, `aac`, `flac`, `weba`, `midi`, `mid` | Native browser audio player, plus MIDI metadata parsing with `@tonejs/midi` | Recordings, audio attachments, MIDI scores |
| Video | `mp4`, `webm`, `m3u8` | Native browser video player with `hls.js` fallback for HLS streams | Screen recordings, demo videos, HLS previews |
| Fonts, design assets, and data | `ttf`, `otf`, `woff`, `woff2`, `psd`, `ai`, `eps`, `sqlite`, `wasm`, `parquet`, `avro`, `webarchive` | Shared core data renderer with FontFace previews, PSD metadata/layers, PDF-backed AI handoff, SQLite/Parquet/Avro/WASM structural summaries, and configurable SQLite WASM URL | Asset review, local databases, binary package inspection |

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

The React package is a native wrapper. It renders a React container and mounts the complete viewer through its local controller on top of `@file-viewer/core` and the core browser engine.

```bash
npm install @file-viewer/react
```

```tsx
import FileViewer from '@file-viewer/react'

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

Historical package names remain compatible, but new projects should prefer the standard `@file-viewer/*` packages.

## Vanilla JavaScript Integration

```bash
npm install @file-viewer/web
```

```html
<div id="viewer" style="height: 100vh"></div>

<script type="module">
  import { mountViewer } from '@file-viewer/web'

  mountViewer(document.getElementById('viewer'), {
    url: '/files/demo.pdf',
    options: {
      theme: 'light',
      toolbar: { position: 'bottom-right' },
      archive: { cache: true, workerTimeoutMs: 30000 }
    },
    onViewerEvent(event) {
      console.log(event.type, event.payload)
    }
  })
</script>
```

Asset copying is only needed when you want to self-host worker, WASM, and example assets:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

## Core Options

| Option | Description |
| --- | --- |
| `theme` | `light`, `dark`, or `system`. Default is `system`. Use `light` when embedding in a fixed light UI. |
| `toolbar` | `true`, `false`, or an object that controls download, print, HTML export, unified zoom controls, and toolbar position. |
| `toolbar.zoom` | Shows or hides the built-in zoom group. The actual capability is provided by each renderer, so unsupported or interaction-sensitive formats are not force-scaled. |
| `toolbar.position` | `auto`, `top`, or `bottom-right`. Default `auto` floats the operation bar at bottom right for PDF and keeps other formats at top. |
| `watermark` | Text or image watermark configuration. Watermark participates in preview, print, and exported HTML. |
| `archive.workerUrl` | Custom `libarchive.js` Worker URL for special private deployments. By default the viewer tries `vendor/libarchive/worker-bundle.js` under the current base and then falls back to ZIP/TAR/GZIP compatibility mode when possible. |
| `archive.wasmUrl` | Custom libarchive WASM URL used when the static Worker needs to load WASM from a non-adjacent path. |
| `archive.workerTimeoutMs` | Worker initialization, encryption check, and directory-read timeout. Defaults to 30000ms and then falls back to ZIP/TAR/GZIP compatibility mode when possible. |
| `archive.cache` | Enables IndexedDB cache for extracted archive entries. |
| `archive.maxArchiveSize` | Maximum archive size allowed for directory parsing. |
| `archive.maxEntryPreviewSize` | Maximum extracted entry size allowed for online preview. |
| `docx.worker` | Enables the optional DOCX Worker path. If the static Worker cannot be loaded, the renderer falls back to the same `docx-preview` main-thread path. |
| `docx.workerUrl` | Custom DOCX Worker URL. The default candidate is `vendor/docx/docx.worker.js` under the current deployment base. |
| `docx.progressive` | Mounts the generated docx-preview pages in batches so large documents can show first content earlier. |
| `docx.workerTimeout` | DOCX Worker timeout in milliseconds. Defaults to 15000ms. |
| `spreadsheet.worker` | Enables the optional spreadsheet Worker path. If the static Worker cannot be loaded, Excel rendering falls back to the same parser on the main thread. |
| `spreadsheet.workerUrl` | Custom Spreadsheet Worker URL. The default candidate is `vendor/xlsx/sheet.worker.js` under the current deployment base. |
| `pdf.streaming` | PDF URL loading strategy. Same-origin streaming is enabled by default. |
| `pdf.rangeChunkSize` | PDF.js Range request chunk size. |
| `pdf.workerUrl` | Custom PDF.js Worker URL for private, offline, or strict-CSP deployments. Defaults to a CDN worker matching the bundled `pdfjs-dist` version. |
| `typst.compilerWasmUrl` | Custom Typst compiler WASM URL. |
| `typst.rendererWasmUrl` | Custom Typst SVG renderer WASM URL. |
| `hooks` | Vue component lifecycle hooks for load and unload events. |
| `beforeOperation` | Vue component guard before download, print, HTML export, or zoom actions. Return `false` to cancel. |

React and vanilla JavaScript integrations use `onViewerEvent` or `onEvent` to receive lifecycle and operation events. Vue wrappers can also pass function hooks directly through `options`.

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

For native wrapper integrations, install the matching npm package in your application. If you also want to self-host worker, WASM, and sample assets, keep the copied asset directory intact:

```txt
file-viewer/assets/*
file-viewer/flyfish-viewer-assets.json        # generated by file-viewer-copy-assets
file-viewer/vendor/libarchive/worker-bundle.js  # optional unless you want a static Worker path
file-viewer/vendor/libarchive/libarchive.wasm   # keep next to worker-bundle.js when using archive.workerUrl
```

The artifact repository also contains:

| Path | Purpose |
| --- | --- |
| `dist/` | Minified library build artifacts |
| `demo/` | Static production demo, including `index.html` and `compare.html` |
| `wrapper-demo/` | React and vanilla JavaScript integration demo |
| `docs/` | Static documentation site output |
| `example/` | Sample files used by the demo |
| `artifacts/` | npm tarballs and packaged static build archives |
| `README.md` | Default Chinese documentation |
| `README.en.md` | English documentation |
| `LICENSE` | Apache-2.0 license |

## Docker

The project provides a static nginx static image and build scripts for `linux/amd64` and `linux/arm64`. A typical deployment can serve the demo and comparison page directly:

```bash
docker run --rm -p 8080:80 flyfishdev/file-viewer:2.0.0
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

Source access can be opened from the shop page with a small lemonade-level support for the maintainers. This keeps legitimate second development and commercial evaluation straightforward without mixing source delivery into the public artifact repository.

## License and Attribution

Flyfish Viewer is distributed under the Apache-2.0 license. You may use the public artifacts according to that license.

For second development or commercial use, please keep clear attribution to Flyfish Viewer and contribute useful fixes or compatibility improvements back whenever possible. This keeps the preview ecosystem healthier for everyone using the component in real business systems.

# Component Options

<div class="doc-kicker">One Options Contract</div>

<p class="doc-lead">
  Vanilla JS, Vue, React, Svelte, jQuery, and custom core integrations share the same viewer options, renderer assembly model, lifecycle hooks, operation guards, and controller semantics.
</p>

## Minimal Options Shape

Standard component packages stay lightweight. Install a component package for your stack, then assemble concrete file-format capability through `options.preset` or `options.renderers`.

```ts
import officePreset from '@file-viewer/preset-office'

export const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  styleIsolation: 'shadow',
  ui: {
    density: 'compact'
  },
  toolbar: {
    position: 'bottom-right',
    download: true,
    print: true,
    exportHtml: true,
    zoom: true
  },
  watermark: {
    text: 'Internal',
    opacity: 0.14
  },
  search: {
    maxMatches: 1000,
    caseSensitive: false
  },
  archive: {
    cache: true,
    workerTimeoutMs: 30000,
    entryActions: {
      download(entry) {
        return entry.path.startsWith('public/')
      }
    }
  },
  pdf: {
    toolbar: true,
    streaming: 'same-origin'
  }
}
```

`builtinRenderers` remains available for advanced baseline control and historical compatibility, but normal integrations should start with `preset` or `renderers`.

## Common Options

| Option area | Purpose |
| --- | --- |
| `theme` | Viewer theme: `light`, `dark`, or `system`. Default is `system`; pass `light` when embedding in a fixed light business UI. |
| `styleIsolation` | Style isolation mode: `auto`, `shadow`, `scoped`, or `none`. With `auto`, Web Component / Web full / IIFE entries use Shadow DOM by default; Vue, React, Svelte, and jQuery keep historical compatibility. Use `shadow` when host CSS is uncontrolled, and customize with `--file-viewer-*` tokens plus `::part()`. See [Style Isolation And Customization](/en/guide/style-isolation). |
| `ui.density` | UI chrome density: `comfortable` or `compact`. The default `comfortable` keeps existing spacing; `compact` tightens toolbars, archive lists, nested preview headers, badges, small buttons, and search inputs while keeping document content readable. |
| `preset` | Bundler-neutral preset assembly. Pass the default export from `@file-viewer/preset-lite`, `@file-viewer/preset-office`, `@file-viewer/preset-engineering`, or `@file-viewer/preset-all`; compose with `preset: [officePreset, engineeringPreset]`. `presets` is kept only as a compatibility alias for early 2.x drafts. |
| `renderers` / `rendererMode` | Exact renderer or custom renderer assembly. `rendererMode:'replace'` starts from an empty registry, so `preset` / `renderers` define the active capability set; `extend` appends to the current built-in baseline. |
| `builtinRenderers` | Advanced built-in baseline switch: `all`, `lite`, or `none`. Most quick starts do not need it. |
| `toolbar` | Built-in operation bar visibility, position, grouped actions, key-based items, permission gates, and button-specific guards. |
| `watermark` | Text or image watermark source, opacity, spacing, size, rotation, color, and toggle behavior. |
| `search` | Document search, highlighted matches, next / previous navigation, whole-word and case-sensitive behavior. |
| `ai` | Text chunk collection for vectorization, source tracing, source-aware highlighting, and audit workflows. It does not call a cloud model by itself. |
| `archive` | Safe extraction limits, IndexedDB cache behavior, worker timeout, nested preview, and self-hosted libarchive paths. |
| `pdf`, `docx`, `spreadsheet`, `cad`, `typst`, `drawing`, `data` | Renderer-specific asset URLs and behavior knobs. |
| `hooks` | Load start, load complete, unload start, unload complete, errors, and renderer context callbacks. |
| `beforeOperation` | Global pre-action guard for download, print, export HTML, zoom, and custom operations. |

## Preset And Renderer Matrix

Presets are product-shaped capability bundles. Individual renderers are exact, minimal imports for products that only need a few formats.

| Preset | Included renderers | Typical formats | Best fit |
| --- | --- | --- | --- |
| `@file-viewer/preset-lite` | `renderer-text`, `renderer-image`, `renderer-media` | Markdown, code, text, image, audio, video, HLS, HEIC | Lightweight attachments, tickets, chat, mobile-first surfaces |
| `@file-viewer/preset-office` | `renderer-pdf`, `renderer-word`, `renderer-spreadsheet`, `renderer-presentation`, `renderer-ofd` | PDF, DOC/DOCX/DOT, RTF, ODT, XLS/XLSX/ODS, PPT/PPTX, OFD | OA, approvals, knowledge bases, contracts, archive portals |
| `@file-viewer/preset-engineering` | `renderer-cad`, `renderer-3d`, `renderer-drawing`, `renderer-mindmap`, `renderer-geo`, `renderer-typst`, `renderer-archive`, `renderer-data`, `renderer-eda` | DWG/DXF/DWF, 3D, draw.io, Excalidraw, Mermaid, PlantUML, XMind, GeoJSON/KML/GPX/SHP, Typst, archives, PSD/SQLite/Parquet, OLB/DRA/GDS/OASIS | Engineering drawings, R&D attachments, design assets, technical archives |
| `@file-viewer/preset-all` | Every official renderer plus low-cost core browser routes | Full official demo matrix | All-format attachment centers, demos, validation environments |

Every renderer below can be passed through `options.renderers`:

| Renderer package | Export | Pipeline |
| --- | --- | --- |
| `@file-viewer/renderer-pdf` | `pdfRenderer` | PDF and PDF-backed AI files |
| `@file-viewer/renderer-word` | `wordRenderer` | DOCX, DOC, DOT, RTF, ODT, OpenDocument |
| `@file-viewer/renderer-spreadsheet` | `spreadsheetRenderer` | XLSX, XLS, ODS, CSV and spreadsheet-like files |
| `@file-viewer/renderer-presentation` | `presentationRenderer` | PPT, PPTX, PPS, POT; uses `@file-viewer/pptx` on demand |
| `@file-viewer/renderer-ofd` | `ofdRenderer` | OFD |
| `@file-viewer/renderer-cad` | `cadRenderer` | DWG, DXF, DWF, DWFx, XPS |
| `@file-viewer/renderer-3d` | `modelRenderer` | GLB, GLTF, OBJ, STL, PLY, FBX, DAE, USD, STEP, IFC and geometry signatures |
| `@file-viewer/renderer-drawing` | `drawingRenderer` | draw.io, Excalidraw, Mermaid, PlantUML |
| `@file-viewer/renderer-mindmap` | `mindmapRenderer` | XMind |
| `@file-viewer/renderer-geo` | `geoRenderer` | GeoJSON, KML, GPX, SHP |
| `@file-viewer/renderer-typst` | `typstRenderer` | Typst source rendered through local WASM assets |
| `@file-viewer/renderer-archive` | `archiveRenderer` | ZIP, RAR, 7Z, TAR, GZ, ISO, APK, CBZ, CBR and nested previews |
| `@file-viewer/renderer-email` | `emailRenderer` | EML, MSG, MBOX |
| `@file-viewer/renderer-epub` | `ebookRenderer` | EPUB, UMD |
| `@file-viewer/renderer-text` | `textRenderer` | Markdown, code, logs, JSON/YAML, patch, git bundle |
| `@file-viewer/renderer-image` | `imageRenderer` | Images, HEIC / HEIF where supported by the renderer |
| `@file-viewer/renderer-media` | `mediaRenderer` | Audio, video, HLS, MIDI summaries |
| `@file-viewer/renderer-data` | `dataRenderer` | PSD, fonts, SQLite, Parquet, Avro, WASM, WebArchive, AI/EPS summaries |
| `@file-viewer/renderer-eda` | `edaRenderer` | OLB, DRA, GDS, OAS/OASIS |

`@file-viewer/eda-layout`, `@file-viewer/eda-orcad`, `@file-viewer/geometry-engine`, and `@file-viewer/pptx` are reusable engine packages behind renderers. Advanced teams can use them directly, while normal viewer integrations should install the matching renderer or preset.

## Assembly Decisions

| Goal | Recommended setup |
| --- | --- |
| Non-Vite or maximum bundler compatibility | Import a preset and pass `options.preset`. |
| Vite app with less application code | Install a preset, register `@file-viewer/vite-plugin`, and use `fileViewerRenderers({ copyAssets:true })`. |
| One exact format | Install one renderer and pass `options.renderers: [pdfRenderer]`. |
| Office plus engineering documents | Use `preset: [officePreset, engineeringPreset]`. |
| Supported extension but missing renderer | The viewer shows which preset / renderer to install. |
| Truly unknown extension | The viewer shows an unsupported-format state. |

## Renderer-specific Options

| Option | Notes |
| --- | --- |
| `archive.workerUrl` / `archive.wasmUrl` | Self-host libarchive worker / WASM when the default viewer asset location does not match your deployment. |
| `archive.workerTimeoutMs` | Timeout for worker startup, encryption checks, and directory reading; the viewer falls back to ZIP/TAR/GZIP-compatible paths when possible. |
| `archive.cache` | Enables IndexedDB cache for extracted nested files. |
| `archive.maxArchiveSize` / `archive.maxEntryPreviewSize` | Memory and safety limits for archive directory reading and nested preview. |
| `archive.entryActions.download` | Controls the download button shown while previewing a file from inside an archive. Pass `false` to hide it globally, or `(entry) => boolean` to decide by path, extension, size, and other metadata. This only affects nested archive entries; the viewer-level original archive download remains controlled by `toolbar` and operation guards. |
| `docx.worker` | Auto-detects the safest DOCX parsing path by default: HTTP/HTTPS keeps the worker enabled, while Electron `file://`, `about:`, and `data:` documents fall back to the main thread. Explicit `true` / `false` values still take precedence. |
| `docx.workerUrl` / `docx.workerJsZipUrl` | Self-host DOCX worker and JSZip assets. |
| `docx.workerTimeout` | Worker startup timeout. The default is 5000ms so unsupported paths, MIME, CSP, or WebView environments fall back quickly. |
| `docx.progressive` | Lets the renderer yield between batches to improve first content and scroll responsiveness on large documents. |
| `docx.visualPagination` | Optional page-like preview. Default DOCX rendering is continuous flow to avoid breaking complex tables and directories. |
| `spreadsheet.worker` | Spreadsheet worker mode. The default `auto` keeps small files on the main-thread compatibility path and automatically tries the worker once file size reaches `spreadsheet.workerAutoThreshold`; explicit `true` / `false` values still take precedence. |
| `spreadsheet.workerAutoThreshold` / `spreadsheet.workerUrl` | Large-file threshold for `worker: 'auto'` in bytes, default 1MB, plus the self-hosted Excel/XLSX worker URL. |
| `spreadsheet.resizableColumns` | Allows users to drag spreadsheet header edges to inspect truncated text. |
| `presentation.workerUrl` / `presentation.workerType` | Self-host the `@file-viewer/pptx` worker or override its Worker type for strict CSP, legacy WebViews, or custom static asset routing. |
| `pdf.streaming` / `pdf.rangeChunkSize` | Controls URL-based progressive PDF loading and PDF.js range chunk size. |
| `pdf.toolbar` | Shows or hides the PDF renderer's own page / zoom / rotation toolbar. Useful for comparison layouts. |
| `pdf.navigation` / `pdf.defaultNavigationVisible` | Enables the left page / outline navigation pane and initial visibility. |
| `pdf.workerUrl`, `pdf.cMapUrl`, `pdf.wasmUrl`, `pdf.standardFontDataUrl` | Self-host PDF.js worker, CMap, WASM, and standard font assets. The default worker path is probed first and falls back to the packaged PDF.js handler when unavailable. |
| `cad.wasmPath`, `cad.workerUrl`, `cad.dwfWasmUrl` | Self-host LibreDWG and DWF / DWFx / XPS assets. |
| `cad.renderer` | `auto`, `webgl`, or `canvas2d`; default is `auto`. |
| `cad.workerTimeoutMs` | DWG parsing timeout; `0` disables the limit. |
| `typst.compilerWasmUrl`, `typst.rendererWasmUrl`, `typst.fontAssetsUrl` | Self-host Typst compiler / renderer WASM and bundled fonts. |
| `drawing.viewerScriptUrl` | Self-host diagrams.net / draw.io viewer script; the renderer falls back to safe SVG output when the official viewer cannot load. |
| `data.sqlWasmUrl` | Self-host SQLite WASM for `.sqlite` previews. |

## Operation Guard

```ts
const options = {
  async beforeOperation(context) {
    if (context.operation === 'download') {
      return await checkPermission(context.source)
    }
    return true
  },
  toolbar: {
    position: 'bottom-right',
    items: {
      'zoom-reset': false
    },
    permissions: {
      print: canPrint
    }
  }
}
```

Built-in operation keys are `download`, `print`, `export-html`, `zoom-in`, `zoom-out`, and `zoom-reset`. `toolbar.items` only controls the built-in toolbar UI, so teams can replace selected buttons with their own native controls. `toolbar.permissions` is a hard gate: a `false` value blocks both the built-in toolbar and direct controller / ref API calls before custom `beforeOperation` hooks run. Returning `false` from any guard cancels the operation.

Component teardown follows the host framework lifecycle. Vue 3 / Vue 2 component unmount, React unmount, Web Component `disconnectedCallback`, Svelte action `destroy`, and jQuery plugin `destroy` all enter the same controller teardown path: active loading is cancelled, the renderer session is destroyed, rendered DOM is cleared, zoom/search/view-state observers are stopped, and `unload-start` / `unload-complete` fire with `reason: "component-unmount"`. In Element Plus `el-dialog destroy-on-close`, route switches, tab closing, or `v-if` removal, host code does not need to clear the viewer container manually.

When the host only hides the viewer, such as `v-show`, a dialog without `destroy-on-close`, or KeepAlive, the active document remains mounted. Use this when preserving reading position is desired. If the product needs explicit teardown while keeping the surrounding component alive, call `destroy()` on the component ref or controller, then recreate the viewer before previewing again.

## Lifecycle Hooks

```ts
const options = {
  hooks: {
    onLoadStart(context) {
      console.log('loading', context.type, context.filename)
    },
    onLoadComplete(context) {
      console.log('loaded', context.rendererId, context.duration)
    },
    onUnloadStart(context) {
      console.log('unloading', context.reason)
    },
    onUnloadComplete(context) {
      console.log('unloaded', context.filename)
    }
  }
}
```

## Toolbar Customization

Framework packages expose the same operation model with ecosystem-native customization:

| Stack | Customization style |
| --- | --- |
| Vanilla JS | `options.toolbar`, Custom Element properties, `mountViewer(...)`, and controller methods |
| Vue | props, emits, and component refs |
| React | props, callback props, and `ref` handle APIs |
| Svelte | props, events, actions, and bindable references |
| jQuery | plugin options, events, and returned instance methods |

Toolbar buttons should call viewer operations rather than wrapping rendered content with outer CSS transforms. This keeps spreadsheet coordinates, PDF text layers, CAD canvases, and mobile gestures aligned.

The initial zoom label is not assumed to be `100%`. Renderers report the actual scale after first-screen fit, image natural-size loading, PDF / Word layout, container resize, or any internal reflow. Built-in toolbars and `getOperationAvailability()` use the same state to keep `zoomIn`, `zoomOut`, and `zoomReset` accurate. Custom toolbars should sync from `zoom-change` or `getZoomState()` instead of caching their own default percentage.

## View State Sync

`initialViewState`, `view-state-change`, `getViewState()`, and `applyViewState()` are designed for projection systems, remote-control displays, side-by-side comparison, and reading-position restore. Every standard renderer path registers a view-state provider. Renderers without a dedicated provider use the generic DOM provider, which records the renderer id, current zoom, and scroll ratios. PDF adds page, page count, rotation, and navigation state. XMind adds sheet index, panX, panY, and zoom. Geo adds map center, zoom, bearing, and pitch. 3D adds camera position, target, and display options. CAD reports the view snapshot exposed by the underlying CAD viewer.

```ts
let lastState = null

const options = {
  initialViewState: {
    page: 3,
    scale: 1.25,
    scroll: { topRatio: 0.18 }
  }
}

function onEvent(event) {
  if (event.type === 'view-state-change') {
    lastState = event.payload.state
    sendToDisplay(event.payload)
  }
}

await displayViewer.applyViewState(lastState, {
  source: 'api',
  action: 'restore'
})
```

For synchronization, send the full `state` snapshot instead of replaying individual button clicks. PDF page changes, zooming, scrolling, XMind panning, Geo map movement, and 3D camera updates all use the same event shape; the display side only needs to call `applyViewState()`.

PDF default assets are probed from the site root (`/vendor/pdf/...`) so Vue Router, React Router, and other deep routes do not accidentally request `vendor/pdf/pdf.worker.mjs` from the current page path. When the static worker is missing or an app server falls back to HTML, the PDF renderer lazy-loads the packaged PDF.js worker handler as a compatibility fallback. Use absolute `pdf.workerUrl`, `pdf.cMapUrl`, `pdf.wasmUrl`, and `pdf.standardFontDataUrl` when deploying under a sub-path, a dedicated static asset domain, or a strict CSP. PPTX uses the `@file-viewer/pptx` worker on demand; set `presentation.workerUrl` and, when necessary, `presentation.workerType` for self-hosted worker deployments.

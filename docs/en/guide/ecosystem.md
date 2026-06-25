# Ecosystem Packages

<div class="doc-kicker">Native Package Lines</div>

<p class="doc-lead">
  New integrations should prefer the standard <code>@file-viewer/*</code> packages.
  Historical <code>@flyfish-group/*</code> names remain available for existing users.
</p>

## Recommended Packages

Standard component packages are intentionally light. Installing `@file-viewer/vue3`, `@file-viewer/react`, `@file-viewer/web`, `@file-viewer/svelte`, `@file-viewer/jquery`, or a Vue 2 package gives you the native ecosystem component, types, controller APIs, and the core foundation. Real format coverage is assembled by presets or individual renderer packages.

| Strategy | Install | Notes |
| --- | --- | --- |
| Lightest component entry | `npm i @file-viewer/vue3` | Add format capability only after the component shell is wired |
| Lightweight attachments | `npm i @file-viewer/vue3 @file-viewer/preset-lite` | Text, Markdown, code, image, audio, video; pass the preset through `options.preset` |
| Office document platform | `npm i @file-viewer/vue3 @file-viewer/preset-office` | PDF, Word, Excel, PowerPoint, OFD, RTF, OpenDocument; recommended default for document apps |
| Engineering platform | `npm i @file-viewer/vue3 @file-viewer/preset-engineering` | CAD, 3D, drawing, XMind, Geo, Typst, Archive, Data, EDA |
| Full demo capability | `npm i @file-viewer/vue3 @file-viewer/preset-all` | One-step full capability for demos, admin tools, and internal all-format workbenches |
| Full package | `npm i @file-viewer/vue3-full` | Enables `preset-all` by default, no manual `options.preset` needed |
| CDN full trial | `https://cdn.jsdelivr.net/npm/@file-viewer/web-full@latest/dist/flyfish-file-viewer-web-full.iife.js` | No local install, ideal for script-tag validation of the complete matrix |
| Strict custom cut | `npm i @file-viewer/vue3 @file-viewer/renderer-pdf` | Install one renderer and pass it through `options.renderers` |

`options.preset` is the bundler-neutral assembly path. Webpack, Rspack, Rollup, Umi, classic multi-page apps, micro-frontends, and internal component libraries can import a preset explicitly and pass it to the component:

```ts
import officePreset from '@file-viewer/preset-office'

const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace'
}
```

Vite projects can additionally install `@file-viewer/vite-plugin` to remove manual imports. Vite plugins still need to be registered once in `vite.config.ts`; after that, `fileViewerRenderers()` or `fileViewerRenderers({ copyAssets:true })` auto-discovers installed `@file-viewer/preset-*` packages and injects the generated virtual module into Vite HTML entrypoints. Components keep `autoRenderers:true` by default, so Vue, React, Svelte, jQuery, and Vanilla JavaScript / Pure Web receive the matching preview capability automatically. `preset-all` is intentionally complete and therefore heavier; production apps should normally prefer `preset-lite`, `preset-office`, `preset-engineering`, or individual renderers.

```ts
// vite.config.ts
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default {
  plugins: [
    fileViewerRenderers({
      copyAssets: true
      // Installed presets are activated automatically; no hand-written import or renderers prop.
    })
  ]
}
```

| Stack | Standard package | Notes |
| --- | --- | --- |
| Core foundation | `@file-viewer/core` | Framework-neutral contracts, browser engine, renderer registry, events, search, zoom, print, export, and asset manifests |
| Word renderer | `@file-viewer/renderer-word` | DOCX/DOC/RTF/ODT renderer plugin that lazy-loads Word engines outside core |
| Lite renderer preset | `@file-viewer/preset-lite` | Text, Markdown, code, image, audio, and video preview lines |
| Office renderer preset | `@file-viewer/preset-office` | PDF, Word, Excel, PowerPoint, OFD, RTF, and OpenDocument preview lines |
| Engineering renderer preset | `@file-viewer/preset-engineering` | CAD, 3D, drawing, XMind, Geo, Typst, Archive, Data, and EDA preview lines |
| Full renderer preset | `@file-viewer/preset-all` | Registers the full lazy renderer set |
| Vite on-demand plugin | `@file-viewer/vite-plugin` | Generates renderer imports from explicit formats or source hints |
| Web Component / Vanilla JS | `@file-viewer/web` | `<flyfish-file-viewer>`, `mountViewer`, IIFE bundle, and asset copy CLI |
| Web Component / Vanilla JS Full | `@file-viewer/web-full` | Complete-matrix Custom Element, IIFE, and imperative mount for script tags and POCs |
| Vue 3 | `@file-viewer/vue3` | Native Vue 3 plugin and component |
| Vue 3 Full | `@file-viewer/vue3-full` | Complete-matrix Vue 3 package with the same component API |
| Vue 2.7 | `@file-viewer/vue2.7` | Native Vue 2.7 component |
| Vue 2.7 Full | `@file-viewer/vue2.7-full` | Complete-matrix package for modern Vue 2 applications |
| Vue 2.6 | `@file-viewer/vue2.6` | Dedicated Vue 2.6 compatibility line |
| Vue 2.6 Full | `@file-viewer/vue2.6-full` | Complete-matrix package for legacy Vue 2.6 applications |
| React 18/19 | `@file-viewer/react` | Native React component and handle APIs |
| React 18/19 Full | `@file-viewer/react-full` | Complete-matrix React package with the same component and hook APIs |
| React 16.8/17 | `@file-viewer/react-legacy` | Legacy React package with the same viewer semantics |
| React 16.8/17 Full | `@file-viewer/react-legacy-full` | Complete-matrix package for old React applications |
| jQuery | `@file-viewer/jquery` | Traditional admin-system integration |
| jQuery Full | `@file-viewer/jquery-full` | Complete-matrix package for classic admin systems |
| Svelte | `@file-viewer/svelte` | Svelte component and action |
| Svelte Full | `@file-viewer/svelte-full` | Complete-matrix Svelte package with the same component and action APIs |

## Renderer Packages

Heavy renderers are split so applications can install only what they need:

- `@file-viewer/renderer-pdf`
- `@file-viewer/renderer-word`
- `@file-viewer/renderer-ofd`
- `@file-viewer/renderer-presentation`
- `@file-viewer/renderer-cad`
- `@file-viewer/renderer-typst`
- `@file-viewer/renderer-archive`
- `@file-viewer/renderer-email`
- `@file-viewer/renderer-epub`
- `@file-viewer/renderer-text`
- `@file-viewer/renderer-image`
- `@file-viewer/renderer-media`
- `@file-viewer/renderer-mindmap`
- `@file-viewer/renderer-geo`
- `@file-viewer/renderer-drawing`
- `@file-viewer/renderer-3d`
- `@file-viewer/renderer-data`
- `@file-viewer/renderer-eda`

Standard component packages depend on the lightweight core foundation by default.
Install only the renderer packages your product needs, use `@file-viewer/preset-lite` / `@file-viewer/preset-office` / `@file-viewer/preset-engineering` for product-shaped bundles, or pass `@file-viewer/preset-all` when you want the complete official demo capability matrix.
For example, PowerPoint preview is provided by `@file-viewer/renderer-presentation`, which loads the native `@file-viewer/pptx` engine only when a PPTX/PPTM/POTX/POTM/PPSX/PPSM file is opened.

## Vite Auto Assembly

Use the Vite plugin when your app wants a complete developer experience without hand-writing every renderer import. The default setup auto-discovers installed presets; explicit `formats` and `scan:true` are only needed for strict custom cuts or source-hint driven assembly:

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      copyAssets: true,
      chunkStrategy: 'renderer'
    })
  ]
})
```

With `scan: true`, use `preset:'auto'` or `autoPresets:true` when installed presets should remain active while source hints add extra renderers. The scan reads hints such as `fileViewerFormats = ['pdf', 'docx']`, `data-file-viewer-formats="dwg,xmind"`, and upload `accept=".pdf,.xlsx"`.

## 2.1.0 Modular Import Paths

### Minimal import: install exactly the renderer you need

For a PDF-only product:

```bash
npm i @file-viewer/vue3 @file-viewer/renderer-pdf
```

```ts
import { pdfRenderer } from '@file-viewer/renderer-pdf'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer]
}
```

Replace `@file-viewer/vue3` with `@file-viewer/web`, `@file-viewer/react`, `@file-viewer/svelte`, `@file-viewer/jquery`, `@file-viewer/vue2.7`, or `@file-viewer/vue2.6` for other stacks. The `options` contract remains the same.

### Composed import: choose a product-shaped preset

For an Office document platform:

```bash
npm i @file-viewer/vue3 @file-viewer/preset-office
```

```ts
import officePreset from '@file-viewer/preset-office'

const options = {
  rendererMode: 'replace',
  preset: officePreset
}
```

Use `preset-lite` for lightweight attachments, `preset-engineering` for CAD / 3D / Typst / EDA / data assets, and `preset-all` for the full sample matrix or all-format admin workbenches. Add `preset:'auto'` or `autoPresets:true` when you also enable `scan:true`, so installed presets and source hints work together. `copyAssets:true` copies Worker, WASM, PDF fonts, CAD, Typst WASM/fonts, Archive, and Data assets into your deployment directory so private intranet deployments do not depend on public CDNs.

## jQuery

Use `@file-viewer/jquery` when a traditional admin system or legacy page already standardizes on jQuery-style plugins:

```bash
npm install @file-viewer/jquery
```

The package exposes a native jQuery integration over the same core options, events, operation guards, search, zoom, print, export, and renderer presets. It does not embed Vue or React.

## Svelte

Use `@file-viewer/svelte` for Svelte applications:

```bash
npm install @file-viewer/svelte
```

The Svelte package keeps framework-native props and events while delegating renderer work to `@file-viewer/core` and the selected renderer packages.

## Core API

Use `@file-viewer/core` when building a custom host or a new ecosystem package:

```bash
npm install @file-viewer/core
```

Core is pure TypeScript and owns shared contracts, file source normalization, renderer registration, lifecycle events, operation availability, asset manifests, search/zoom/print/export protocols, and utility APIs. UI-specific behavior belongs in the component package for each framework.

## PPTX Engine

PowerPoint rendering is available through `@file-viewer/renderer-presentation`. The lower-level engine is published as `@file-viewer/pptx` for teams that want to build a custom presentation renderer:

```bash
npm install @file-viewer/pptx
```

Most application teams should use the presentation renderer or `preset-office` instead of calling the engine directly.

## Compatibility Names

| Historical package | Prefer now |
| --- | --- |
| `@flyfish-group/file-viewer-web` | `@file-viewer/web` |
| `@flyfish-group/file-viewer3` | `@file-viewer/vue3` |
| `file-viewer3` | `@file-viewer/vue3` |
| `@flyfish-group/file-viewer` | `@file-viewer/vue2.7` |
| `@flyfish-group/file-viewer-react` | `@file-viewer/react` |

Compatibility packages keep old projects working, but new projects get clearer package names, better npm discoverability, and a cleaner upgrade path with the standard names.

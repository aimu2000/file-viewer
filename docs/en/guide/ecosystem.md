# Ecosystem Packages

<div class="doc-kicker">Native Package Lines</div>

<p class="doc-lead">
  New integrations should prefer the standard <code>@file-viewer/*</code> packages.
  Historical <code>@flyfish-group/*</code> names remain available for existing users.
</p>

## Recommended Packages

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
| Vue 3 | `@file-viewer/vue3` | Native Vue 3 plugin and component |
| Vue 2.7 | `@file-viewer/vue2.7` | Native Vue 2.7 component |
| Vue 2.6 | `@file-viewer/vue2.6` | Dedicated Vue 2.6 compatibility line |
| React 18/19 | `@file-viewer/react` | Native React component and handle APIs |
| React 16.8/17 | `@file-viewer/react-legacy` | Legacy React package with the same viewer semantics |
| jQuery | `@file-viewer/jquery` | Traditional admin-system integration |
| Svelte | `@file-viewer/svelte` | Svelte component and action |

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
- `@file-viewer/renderer-ebook`
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

Use the Vite plugin when your app wants a complete developer experience without hand-writing every renderer import:

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      formats: ['pdf', 'docx'],
      scan: true,
      copyAssets: true,
      chunkStrategy: 'renderer'
    })
  ]
})
```

With `scan: true`, the plugin inspects common source folders for hints such as `fileViewerFormats = ['pdf', 'docx']`, `data-file-viewer-formats="dwg,xmind"`, and upload `accept=".pdf,.xlsx"`. It then generates `virtual:file-viewer-renderers`, imports only the matching renderer packages, and keeps worker/WASM assets self-hostable.

## Compatibility Names

| Historical package | Prefer now |
| --- | --- |
| `@flyfish-group/file-viewer-web` | `@file-viewer/web` |
| `@flyfish-group/file-viewer3` | `@file-viewer/vue3` |
| `file-viewer3` | `@file-viewer/vue3` |
| `@flyfish-group/file-viewer` | `@file-viewer/vue2.7` |
| `@flyfish-group/file-viewer-react` | `@file-viewer/react` |

Compatibility packages keep old projects working, but new projects get clearer package names, better npm discoverability, and a cleaner upgrade path with the standard names.

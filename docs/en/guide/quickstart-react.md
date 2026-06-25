# React Integration

<div class="doc-kicker">Native React Component</div>

<p class="doc-lead">
  <code>@file-viewer/react</code> exposes a React component and handle APIs while sharing the same core options and renderer packages as other ecosystems.
</p>

## Install

```bash
npm install @file-viewer/react @file-viewer/preset-office
```

Installing only `@file-viewer/react` gives you the lightest React component and core foundation. PDF, Office, CAD, Typst, archive, and other heavy format capabilities come from presets or renderer packages. The stable path for every bundler is to import a preset or renderer and pass it through `options.preset` / `options.renderers`:

```tsx
import officePreset from '@file-viewer/preset-office'

const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

Vite projects can add the plugin once to avoid manual preset imports. Vite still requires a one-line plugin registration; after that, `fileViewerRenderers({ copyAssets:true })` auto-discovers installed `@file-viewer/preset-*` packages:

```bash
npm install -D @file-viewer/vite-plugin
```

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
})
```

Switch `@file-viewer/preset-office` to `@file-viewer/preset-all` when heavy users need the complete capability set immediately. Non-Vite apps keep passing the preset through `options.preset`; Vite apps keep the same plugin config:

```bash
npm install @file-viewer/react @file-viewer/preset-all
```

Use a full package when you want one package to enable the complete matrix. React 18 / 19 uses `@file-viewer/react-full`; React 16.8 / 17 uses `@file-viewer/react-legacy-full`:

```bash
npm install @file-viewer/react-full
```

```tsx
import FileViewer from '@file-viewer/react-full'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/files/demo.pdf"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' }
        }}
      />
    </div>
  )
}
```

Use `formats`, `renderers`, `scan:true`, `inject:false`, or `chunkStrategy:'renderer'` only when the product needs explicit control. The recommended default remains `fileViewerRenderers({ copyAssets:true })`, with installed presets auto-activated by the plugin.

## Component Usage

```tsx
import { useRef } from 'react'
import FileViewer, { type FileViewerHandle } from '@file-viewer/react'
import officePreset from '@file-viewer/preset-office'

export function Preview() {
  const viewerRef = useRef<FileViewerHandle>(null)

  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        ref={viewerRef}
        url="/files/report.pdf"
        options={{
          preset: officePreset,
          rendererMode: 'replace',
          theme: 'light',
          toolbar: { position: 'bottom-right' },
          search: { enabled: true },
          archive: { cache: true }
        }}
        onViewerEvent={(event) => console.log(event.type)}
      />
    </div>
  )
}
```

## Legacy React

React 16.8 and 17 projects should use:

```bash
npm install @file-viewer/react-legacy
```

The event and options model stays aligned with `@file-viewer/react`.

## Vite And Assets

For production bundles, use `@file-viewer/vite-plugin` or run `npx file-viewer-copy-assets ./public/file-viewer` so worker/WASM assets stay self-hosted.

# Quickstart

<div class="doc-kicker">Get Running Fast</div>

<p class="doc-lead">
  Pick the package that matches your stack, give the viewer container a stable height, and pass a file URL or a real <code>File</code>.
</p>

## Vanilla JavaScript / Web Component

```bash
npm install @file-viewer/web
```

```html
<flyfish-file-viewer
  id="viewer"
  src="/files/demo.pdf"
  filename="demo.pdf"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:720px"
></flyfish-file-viewer>
```

```ts
import { defineFileViewerElement } from '@file-viewer/web'

defineFileViewerElement()
```

## Vue 3

```bash
npm install @file-viewer/vue3
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<template>
  <div style="height: 100vh">
    <file-viewer url="/files/report.docx" />
  </div>
</template>
```

## React

```bash
npm install @file-viewer/react
```

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/files/report.pdf"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' },
          archive: { cache: true }
        }}
      />
    </div>
  )
}
```

React 16.8/17 projects can use `@file-viewer/react-legacy`.

## Authenticated Files

If your app must authenticate before downloading a file, fetch the file in the host app and pass a named `File` to the viewer:

```ts
const blob = await fetch('/api/files/contract', {
  credentials: 'include'
}).then(response => response.blob())

const file = new File([blob], 'contract.pdf', { type: blob.type })
```

Passing a filename with an extension is important because the viewer uses it to pick the renderer.

## Self-host Worker And WASM Assets

Most web apps can install the package and run. For intranet, strict CSP, offline, or custom static-prefix deployments, copy viewer assets into your app:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

The copy command verifies PDF, archive, DOCX, spreadsheet, Draw.io, CAD, Typst, SQLite, Worker, WASM, and vendor assets. Runtime options let you point each renderer to your own static paths.

## Try The Demo Locally

```bash
pnpm install
pnpm dev
```

The main demo opens at the Vite dev server URL. The comparison demo is available at `/compare.html`.

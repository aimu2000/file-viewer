# Vue 2 Integration

<div class="doc-kicker">Vue 2.7 And Vue 2.6</div>

<p class="doc-lead">
  Vue 2 projects can use native component packages without switching to an iframe-only integration.
</p>

## Vue 2.7

```bash
npm install @file-viewer/vue2.7 @file-viewer/preset-office
```

Installing only `@file-viewer/vue2.7` gives you the lightest native Vue 2.7 component. Add presets or renderer packages for concrete PDF, Office, CAD, Typst, archive, and engineering formats. For Webpack, Rspack, Rollup, Umi, and non-Vite applications, pass the capability through `options.preset`:

```ts
import officePreset from '@file-viewer/preset-office'

const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

Vite projects can add the plugin to avoid manual preset imports. Installing the package alone is not enough because Vite plugins must be registered once; after registration the plugin auto-discovers installed presets:

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

```ts
import Vue from 'vue'
import FileViewer from '@file-viewer/vue2.7'

Vue.use(FileViewer)
```

```vue
<template>
  <div class="preview-shell">
    <file-viewer
      url="/files/report.pdf"
      :options="viewerOptions"
      @viewer-event="onViewerEvent"
    />
  </div>
</template>

<script>
import officePreset from '@file-viewer/preset-office'

export default {
  data() {
    return {
      viewerOptions: {
        preset: officePreset,
        rendererMode: 'replace',
        theme: 'light',
        toolbar: { position: 'bottom-right' }
      }
    }
  },
  methods: {
    onViewerEvent(event) {
      console.log(event.type)
    }
  }
}
</script>
```

## Vue 2.6

```bash
npm install @file-viewer/vue2.6 @file-viewer/preset-office
```

Use the same component API as Vue 2.7. Keep your host container at a fixed or viewport-relative height. Switch `@file-viewer/preset-office` to `@file-viewer/preset-all` when heavy users need the full format matrix in one install:

```bash
npm install @file-viewer/vue2.6 @file-viewer/preset-all
```

Full packages are also available when you want the complete matrix by default: use `@file-viewer/vue2.7-full` for Vue 2.7 and `@file-viewer/vue2.6-full` for Vue 2.6.

```bash
npm install @file-viewer/vue2.7-full
```

```ts
import Vue from 'vue'
import FileViewer from '@file-viewer/vue2.7-full'

Vue.use(FileViewer)
```

Use `formats`, `renderers`, `scan:true`, `inject:false`, or `chunkStrategy:'renderer'` only for explicit registry control. Normal projects should keep `fileViewerRenderers({ copyAssets:true })` and let the plugin auto-activate installed presets.

## Historical Package

`@flyfish-group/file-viewer` remains the compatibility line for Vue 2.7. New projects should prefer `@file-viewer/vue2.7` or `@file-viewer/vue2.6`.

# Svelte Integration

<div class="doc-kicker">Native Svelte Component</div>

<p class="doc-lead">
  The Svelte package provides both a native component and an action. Use the component for declarative pages and the action for existing DOM containers.
</p>

## Install

Use the standard package when you want a light entry plus an explicit preset:

```bash
npm install @file-viewer/svelte @file-viewer/preset-office
```

Use the full package when you want the complete matrix by default:

```bash
npm install @file-viewer/svelte-full
```

`@file-viewer/svelte-full` enables `@file-viewer/preset-all` automatically while keeping the same component, action, event, and controller APIs.

## Component Usage

```svelte
<script lang="ts">
  import FileViewer from '@file-viewer/svelte'
  import officePreset from '@file-viewer/preset-office'

  const options = {
    preset: officePreset,
    rendererMode: 'replace',
    theme: 'light',
    toolbar: { position: 'bottom-right' },
    archive: { cache: true }
  }

  function handleViewerEvent(event) {
    console.log(event.detail.type, event.detail.payload)
  }
</script>

<section style="height: 100vh">
  <FileViewer
    url="/files/report.docx"
    {options}
    on:viewerEvent={handleViewerEvent}
  />
</section>
```

The full package only changes the import:

```svelte
<script lang="ts">
  import FileViewer from '@file-viewer/svelte-full'

  const options = {
    theme: 'light',
    toolbar: { position: 'bottom-right' }
  }
</script>

<section style="height: 100vh">
  <FileViewer url="/files/demo.pdf" {options} />
</section>
```

## Action Usage

For pages that do not want a component instance, mount the action on any existing container:

```svelte
<script lang="ts">
  import { fileViewer } from '@file-viewer/svelte'
  import officePreset from '@file-viewer/preset-office'

  const viewerOptions = {
    url: '/files/report.pdf',
    options: {
      preset: officePreset,
      rendererMode: 'replace',
      theme: 'light'
    }
  }
</script>

<div use:fileViewer={viewerOptions} style="height: 720px"></div>
```

## Vite Auto Assembly

SvelteKit / Vite projects can register the plugin so installed presets activate automatically and Worker / WASM / font / vendor assets are copied:

```bash
npm install -D @file-viewer/vite-plugin
```

```ts
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default {
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
}
```

Non-Vite projects can keep using `options.preset` / `options.renderers` explicitly.

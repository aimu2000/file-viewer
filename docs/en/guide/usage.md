# Component Options

<div class="doc-kicker">One Options Contract</div>

<p class="doc-lead">
  Vanilla JS, Vue, React, Svelte, jQuery, and core integrations share the same viewer options wherever the host framework allows it.
</p>

## Common Options

| Option area | Purpose |
| --- | --- |
| `theme` | `light`, `dark`, `auto`, or renderer-specific theme behavior |
| `toolbar` | Position, visibility, floating mode, operation grouping, key-based items, permission gates, and custom action handling |
| `watermark` | Text or image watermark source, opacity, spacing, rotation, and toggle behavior |
| `search` | Document search, highlighted matches, next/previous navigation, and focus handling |
| `zoom` | Unified zoom in, zoom out, reset, fit-to-width, and renderer-specific adapters |
| `print` | Format-aware printing for printable renderers, with dynamic operation availability |
| `archive` | Safe extraction limits, cache behavior, worker timeout, and nested preview |
| `pdf`, `docx`, `spreadsheet`, `cad`, `typst`, `drawing`, `data` | Renderer-specific asset URLs and behavior knobs |
| `beforeOperation` | Pre-action permission check for download, print, export HTML, search, zoom, and custom actions |
| lifecycle hooks | Load start, load complete, unload start, unload complete, errors, and renderer context |

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

## Lifecycle Hooks

```ts
const options = {
  onLoadStart(context) {
    console.log('loading', context.fileType)
  },
  onLoadComplete(context) {
    console.log('loaded', context.rendererId)
  },
  onBeforeUnload(context) {
    console.log('unloading', context.rendererId)
  },
  onUnloadComplete(context) {
    console.log('unloaded')
  }
}
```

## Toolbar Customization

Framework packages expose the same operation model with ecosystem-native customization:

| Stack | Customization style |
| --- | --- |
| Vanilla JS | `options.toolbar`, Custom Element properties, and controller methods |
| Vue | props, emits, slots where available, and component refs |
| React | props, render callbacks where available, and `ref` handle APIs |
| Svelte | props, events, actions, and bindable references |
| jQuery | plugin options, events, and returned instance methods |

Toolbar buttons should call viewer operations rather than wrapping the rendered content with outer CSS transforms. This keeps spreadsheet coordinates, PDF text layers, CAD canvases, and mobile gestures aligned.

PDF default assets are resolved from the site root (`/vendor/pdf/...`) so Vue Router, React Router, and other deep routes do not accidentally request `vendor/pdf/pdf.worker.mjs` from the current page path. Use absolute `pdf.workerUrl`, `pdf.cMapUrl`, `pdf.wasmUrl`, and `pdf.standardFontDataUrl` when deploying under a sub-path or a dedicated static asset domain.

<p align="center">
  <a href="https://file-viewer.app"><img src="docs/public/_media/logo.png" width="112" alt="Flyfish File Viewer logo"></a>
</p>

<h1 align="center">Flyfish File Viewer</h1>

<p align="center"><strong>Browser-native, offline-first file preview components for web applications.</strong></p>

<p align="center">
  Preview PDF, Office, CAD, archives, email, media, ebooks, diagrams, 3D and data files in the browser—without requiring a server-side conversion service.
</p>

<p align="center">
  <a href="https://demo.file-viewer.app/"><strong>Live Demo</strong></a> ·
  <a href="https://doc.file-viewer.app/"><strong>Documentation</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="https://doc.file-viewer.app/guide/formats"><strong>Format Matrix</strong></a> ·
  <a href="https://github.com/flyfish-dev/file-viewer/releases"><strong>GitHub Releases</strong></a>
</p>

<p align="center">
  <strong>English</strong> · <a href="README.zh-CN.md"><strong>简体中文</strong></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@file-viewer/core"><img alt="npm version" src="https://img.shields.io/npm/v/@file-viewer/core?logo=npm&color=cb3837"></a>
  <a href="https://www.npmjs.com/package/@file-viewer/core"><img alt="core total downloads" src="https://img.shields.io/npm/dt/@file-viewer/core?logo=npm&label=core%20downloads"></a>
  <a href="https://github.com/flyfish-dev/file-viewer/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/flyfish-dev/file-viewer?logo=github"></a>
  <a href="https://github.com/flyfish-dev/file-viewer/releases/latest"><img alt="latest release" src="https://img.shields.io/github/v/release/flyfish-dev/file-viewer?logo=github"></a>
  <a href="LICENSE"><img alt="Apache-2.0 license" src="https://img.shields.io/github/license/flyfish-dev/file-viewer"></a>
</p>

<p align="center">
  <a href="https://hub.docker.com/r/flyfishdev/file-viewer"><img alt="Docker pulls" src="https://img.shields.io/docker/pulls/flyfishdev/file-viewer?logo=docker"></a>
  <img alt="206 extension mappings" src="https://img.shields.io/badge/extensions-206-2563eb">
  <img alt="24 rendering pipelines" src="https://img.shields.io/badge/pipelines-24-7c3aed">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-native-3178c6?logo=typescript&logoColor=white">
  <img alt="offline and self-hosted" src="https://img.shields.io/badge/runtime-offline%20%7C%20self--hosted-168f64">
</p>

<p align="center">
  <a href="https://demo.file-viewer.app/"><img src="docs/public/_media/flyfish-viewer-demo-en.gif" width="920" alt="Flyfish File Viewer English demo showing multi-format browser preview"></a>
</p>

## Why File Viewer

- **No mandatory conversion backend.** Files are parsed and rendered in the browser whenever the format allows it.
- **Offline and private-deployment friendly.** Runtime code, workers, WASM and vendor assets can all be hosted inside your network.
- **One component API.** Use the same source, lifecycle, toolbar, search, zoom, print and export concepts across formats.
- **Modular by design.** Start with a light component, add a focused preset, or choose a full package for one-step integration.
- **Lazy heavy pipelines.** PDF, CAD, Typst, archives and other heavy capabilities load by format instead of inflating the first screen.
- **Framework-native packages.** Vanilla/Web Component comes first, with production packages for React, Vue, Svelte and jQuery.

## Quick Start

The full packages are the fastest honest path: they include the complete preset. Use a light package plus a preset when bundle control matters.

### Web Component / Vanilla JS

```bash
npm install @file-viewer/web-full
```

```js
import { mountViewer } from '@file-viewer/web-full'

mountViewer(document.querySelector('#viewer'), {
  url: '/documents/handbook.pdf',
  filename: 'handbook.pdf'
})
```

### React 18 / 19

```bash
npm install @file-viewer/react-full
```

```tsx
import { FileViewer } from '@file-viewer/react-full'

export function Preview() {
  return <FileViewer url="/documents/handbook.pdf" />
}
```

### Vue 3

```bash
npm install @file-viewer/vue3-full
```

```vue
<script setup lang="ts">
import { FileViewer } from '@file-viewer/vue3-full'
</script>

<template>
  <FileViewer url="/documents/handbook.pdf" />
</template>
```

| Ecosystem | Light package | Full package | Guide |
| --- | --- | --- | --- |
| Vanilla JS / Web Component | `@file-viewer/web` | `@file-viewer/web-full` | [Web](https://doc.file-viewer.app/guide/quickstart-web) |
| React 18 / 19 | `@file-viewer/react` | `@file-viewer/react-full` | [React](https://doc.file-viewer.app/guide/quickstart-react) |
| React 16.8 / 17 | `@file-viewer/react-legacy` | `@file-viewer/react-legacy-full` | [React Legacy](https://doc.file-viewer.app/guide/ecosystem#react-legacy) |
| Vue 3 | `@file-viewer/vue3` | `@file-viewer/vue3-full` | [Vue 3](https://doc.file-viewer.app/guide/quickstart-vue3) |
| Vue 2.7 / 2.6 | `@file-viewer/vue2.7` / `@file-viewer/vue2.6` | matching `-full` package | [Vue 2](https://doc.file-viewer.app/guide/quickstart-vue2) |
| Svelte | `@file-viewer/svelte` | `@file-viewer/svelte-full` | [Svelte](https://doc.file-viewer.app/guide/quickstart-svelte) |
| jQuery | `@file-viewer/jquery` | `@file-viewer/jquery-full` | [jQuery](https://doc.file-viewer.app/guide/ecosystem#jquery) |

## Choose the Right Package

| Path | Choose it when | What you provide |
| --- | --- | --- |
| Light component | You need the smallest shell and explicit control | Individual renderers or a preset in `options.preset` |
| `preset-lite` | Text, code, images and lightweight common previews are enough | Component + `@file-viewer/preset-lite` |
| `preset-office` | Your product centers on PDF and Office documents | Component + `@file-viewer/preset-office` |
| `preset-engineering` | CAD, drawing, 3D, EDA or engineering data matters | Component + `@file-viewer/preset-engineering` |
| Vite plugin | You want installed presets detected and offline assets copied automatically | `@file-viewer/vite-plugin` |
| Full package | You value one-step setup more than the smallest dependency graph | A matching `@file-viewer/*-full` package |

```ts
import officePreset from '@file-viewer/preset-office'
import { FileViewer } from '@file-viewer/vue3'

// options.preset accepts one preset or an array of presets.
const options = { preset: officePreset }
```

See [on-demand renderers and presets](https://doc.file-viewer.app/guide/on-demand-renderers) for asset copying, plugin configuration and custom combinations.

## Capability at a Glance

The current matrix maps **206 file extensions** into **24 rendering pipelines**. Major groups include PDF; Word, spreadsheet and presentation files; OFD; DWG/DXF/DWF/DWFX; archives; EML/MSG; Markdown and source code; Draw.io, Excalidraw, Mermaid and PlantUML; PSD and images; audio/video; ebooks; mind maps; 3D/geo/data/EDA formats; and Typst.

The exact implementation and support level varies by format. Use the maintained [format matrix](https://doc.file-viewer.app/guide/formats) as the source of truth rather than inferring support from an extension alone.

## Honest Boundaries

- File Viewer is a **read-only preview toolkit**, not an Office or CAD editor.
- Visual fidelity differs by file structure, embedded fonts, vendor extensions and browser capabilities.
- Heavy formats require local Worker/WASM/vendor assets; offline deployment means hosting those assets yourself, not removing them.
- Very large or encrypted files can require more memory and format-specific configuration.
- A light component does not silently include every renderer. Install a preset, individual renderers, or a full package.

If a documented format fails on a real file, the most useful contribution is a **sanitized sample**, browser/version details and a minimal reproduction.

## Architecture

```text
framework component / Web Component
              │
        @file-viewer/core
              │
     preset or renderer modules
              │
 local workers · WASM · vendor assets
```

`@file-viewer/core` is framework-independent TypeScript. Renderer packages own format pipelines; presets compose them; each ecosystem package implements its native lifecycle without nesting another framework implementation.

<!-- FILE_VIEWER_PUBLIC_GENERATED:START -->
## Open-source Workspace

This repository contains the public source for the demo, documentation, framework-independent core, renderer pipelines, presets, Vite plugin and standard ecosystem components. Release archives and npm tarballs live in [GitHub Releases](https://github.com/flyfish-dev/file-viewer/releases), not in Git history.

```bash
pnpm install --frozen-lockfile
pnpm type-check
pnpm test
pnpm build
pnpm docs:build
pnpm verify:browser-smoke
```

| Area | Location |
| --- | --- |
| Core | [`packages/core`](packages/core) |
| Renderers | [`packages/renderers`](packages/renderers) |
| Presets and Vite plugin | [`packages/presets`](packages/presets) |
| Components | [`packages/components`](packages/components) |
| Demo | [`apps/viewer-demo`](apps/viewer-demo) |
| Documentation | [`docs`](docs) |
<!-- FILE_VIEWER_PUBLIC_GENERATED:END -->

## Documentation and Delivery

- [Quick start](https://doc.file-viewer.app/guide/quickstart)
- [Format matrix](https://doc.file-viewer.app/guide/formats)
- [API and options](https://doc.file-viewer.app/guide/usage)
- [Offline deployment](https://doc.file-viewer.app/guide/distribution)
- [Docker](https://doc.file-viewer.app/guide/docker)
- [Ecosystem packages](https://doc.file-viewer.app/guide/ecosystem)
- [Releases and downloadable archives](https://github.com/flyfish-dev/file-viewer/releases)

For higher-fidelity native document workflows and advanced enterprise requirements, see the [commercial edition](https://file-viewer.app/) or request [priority technical support](https://dev.flyfish.group/shop).

## Contributing

Compatibility reports, deployment feedback, focused fixes and sanitized regression samples are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before opening an issue or pull request.

Apache-2.0 licensed. Community links, Wiki and acknowledgements are available in the [documentation](https://doc.file-viewer.app/) and repository sidebar.

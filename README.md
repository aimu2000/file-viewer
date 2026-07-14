<p align="center">
  <a href="https://file-viewer.app"><img src="docs/public/_media/logo.png" width="112" alt="Flyfish File Viewer logo"></a>
</p>

<h1 align="center">Flyfish File Viewer</h1>

<p align="center"><strong>Open-source, browser-native file viewer for private and internal web apps.</strong></p>

<p align="center">
  <strong>206 extensions across 24 preview pipelines.</strong> Preview Office, PDF/OFD, CAD, archives, email, diagrams, 3D, media and data in the browser—without server-side conversion.
</p>

<p align="center">
  <strong>English</strong> · <a href="README.zh-CN.md"><strong>简体中文</strong></a>
</p>

<p align="center">
  <a href="https://demo.file-viewer.app/"><strong>Live Demo</strong></a> ·
  <a href="https://doc.file-viewer.app/"><strong>Documentation</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="examples"><strong>Runnable Examples</strong></a> ·
  <a href="https://doc.file-viewer.app/guide/formats"><strong>Format Matrix</strong></a> ·
  <a href="https://github.com/flyfish-dev/file-viewer/releases"><strong>GitHub Releases</strong></a> ·
  <a href="https://github.com/sponsors/wybaby168"><strong>GitHub Sponsors</strong></a>
</p>

<p align="center">
  <a href="https://github.com/flyfish-dev/file-viewer/actions/workflows/public-ci.yml"><img alt="Public CI" src="https://github.com/flyfish-dev/file-viewer/actions/workflows/public-ci.yml/badge.svg?branch=main"></a>
  <a href="https://www.npmjs.com/package/@file-viewer/core"><img alt="npm version" src="https://img.shields.io/npm/v/@file-viewer/core?logo=npm&color=cb3837"></a>
  <a href="https://www.npmjs.com/package/@file-viewer/core"><img alt="core total downloads" src="https://img.shields.io/npm/dt/@file-viewer/core?logo=npm&label=core%20downloads"></a>
  <a href="https://github.com/flyfish-dev/file-viewer"><img alt="GitHub stars" src="https://img.shields.io/github/stars/flyfish-dev/file-viewer?style=flat&logo=github&logoColor=white&label=stars&color=2563eb"></a>
  <a href="https://github.com/sponsors/wybaby168"><img alt="GitHub Sponsors" src="https://img.shields.io/badge/GitHub-Sponsor-ea4aaa?logo=githubsponsors&logoColor=white"></a>
  <a href="https://github.com/flyfish-dev/file-viewer/releases/latest"><img alt="latest release" src="https://img.shields.io/github/v/release/flyfish-dev/file-viewer?logo=github"></a>
  <a href="LICENSE"><img alt="Apache-2.0 license" src="https://img.shields.io/github/license/flyfish-dev/file-viewer"></a>
</p>

<p align="center">
  <a href="https://hub.docker.com/r/flyfishdev/file-viewer"><img alt="Docker pulls" src="https://img.shields.io/docker/pulls/flyfishdev/file-viewer?logo=docker"></a>
  <a href="https://doc.file-viewer.app/guide/formats"><img alt="206 supported file extensions" src="https://img.shields.io/badge/file%20extensions-206-2563eb"></a>
  <a href="https://doc.file-viewer.app/guide/formats"><img alt="24 rendering pipelines" src="https://img.shields.io/badge/preview%20pipelines-24-7c3aed"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-native-3178c6?logo=typescript&logoColor=white">
  <img alt="offline and self-hosted" src="https://img.shields.io/badge/runtime-offline%20%7C%20self--hosted-168f64">
</p>

<p align="center">
  <a href="https://demo.file-viewer.app/"><img src="docs/public/_media/flyfish-viewer-demo-en.gif" width="920" alt="Flyfish File Viewer English demo showing multi-format browser preview"></a>
</p>

## Choose By Scenario

**206 extensions across 24 preview pipelines** means you can start with the file problem you have today instead of assembling a different viewer for every attachment type.

| Your product needs to preview | Formats you can look for immediately | Fastest path |
| --- | --- | --- |
| Contracts, reports and OA/CRM attachments | PDF/OFD, DOCX/DOC, XLSX/XLS, PPTX, RTF and OpenDocument | [Try the live demo](https://demo.file-viewer.app/) · [`preset-office`](https://doc.file-viewer.app/guide/on-demand-renderers) |
| Engineering drawings, models and chip/design assets | DWG, DXF, DWF/DWFX, STEP/IFC/3D, OLB/DRA and GDS/OASIS | [`preset-engineering`](https://doc.file-viewer.app/guide/on-demand-renderers) · [check fidelity](https://doc.file-viewer.app/guide/format-fidelity) |
| Archives whose contents must remain private | ZIP, RAR, 7Z, TAR, ISO and 20+ related formats, with nested file preview | [Archive coverage](https://doc.file-viewer.app/guide/formats) · [offline deployment](https://doc.file-viewer.app/guide/distribution) |
| Email, support-ticket and knowledge-base attachments | EML, MSG, MBOX, EPUB, Markdown, source code, diff/patch and Git bundle | [Full format matrix](https://doc.file-viewer.app/guide/formats) · [full packages](#quick-start) |
| Diagrams, design files and structured data | Draw.io, Excalidraw, Mermaid, PlantUML, XMind, PSD, SQLite, Parquet and more | [Full format matrix](https://doc.file-viewer.app/guide/formats) · [`preset-all`](#choose-the-right-package) |
| Intranet or air-gapped deployment | Self-hosted JavaScript, Worker, WASM, fonts and vendor assets | [Offline guide](https://doc.file-viewer.app/guide/distribution) · [Docker](https://doc.file-viewer.app/guide/docker) |

Looking for one exact suffix? Search the maintained [206-extension format matrix](https://doc.file-viewer.app/guide/formats), which records the renderer, support level and deployment requirements for each pipeline.

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
| Asset-copy CLI | [`packages/tools/copy-assets`](packages/tools/copy-assets) |
| Runnable examples | [`examples`](examples) |
| Demo | [`apps/viewer-demo`](apps/viewer-demo) |
| Documentation | [`docs`](docs) |
<!-- FILE_VIEWER_PUBLIC_GENERATED:END -->

## Documentation and Delivery

- [Quick start](https://doc.file-viewer.app/guide/quickstart)
- [Format matrix](https://doc.file-viewer.app/guide/formats)
- [API and options](https://doc.file-viewer.app/guide/usage)
- [Offline deployment](https://doc.file-viewer.app/guide/distribution)
- [Asset-copy CLI](packages/tools/copy-assets): `npx --yes file-viewer-copy-assets ./public/file-viewer`
- [Docker](https://doc.file-viewer.app/guide/docker)
- [Ecosystem packages](https://doc.file-viewer.app/guide/ecosystem)
- [Releases and downloadable archives](https://github.com/flyfish-dev/file-viewer/releases)

## Support the Project

File Viewer remains Apache-2.0 open source. Sponsorship helps fund rendering compatibility, documentation, examples, offline assets, and long-term maintenance.

- [GitHub Sponsors](https://github.com/sponsors/wybaby168): one-time or recurring support through the primary maintainer's approved Sponsors profile.
- [WeChat / Alipay](https://dev.flyfish.group/sponsor?source=github): a convenient one-time option for domestic supporters.
- [Enterprise support](https://dev.flyfish.group/shop): private deployment, custom compatibility work, or requirements with committed response expectations.

Sponsorship does not change access to open-source features and does not include a service-level agreement unless a published tier explicitly says otherwise. For higher-fidelity native document workflows, see the [commercial edition](https://file-viewer.app/).

## Contributing

Compatibility reports, deployment feedback, focused fixes and sanitized regression samples are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before opening an issue or pull request.

Apache-2.0 licensed. Community links, Wiki and acknowledgements are available in the [documentation](https://doc.file-viewer.app/) and repository sidebar.

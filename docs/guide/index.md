# Docs Home

<div class="doc-kicker">Start From The Right Door</div>

<p class="doc-lead">
  Flyfish Viewer is an offline-first frontend file preview system for web applications.
  It is designed for attachment centers, workflow tools, knowledge bases, support portals, and self-hosted intranet products that need broad file coverage without running a document conversion backend.
  The current format matrix covers 206 file extensions across 24 preview pipelines.
</p>

## What To Read First

| Goal | Page |
| --- | --- |
| Run the viewer in a project | [Quickstart](/guide/quickstart) |
| Pick the right npm package | [Ecosystem packages](/guide/ecosystem) |
| Embed the official demo without npm packages | [Quickstart: Zero-dependency integration](/guide/quickstart#zero-dependency-integration-official-demo-iframe) |
| Choose minimal imports or composed presets | [2.1.0 modular import paths](/guide/ecosystem#_2-1-0-modular-import-paths) |
| Keep host CSS from leaking into the viewer | [Style isolation and customization](/guide/style-isolation) |
| Check format coverage | [Supported formats](/guide/formats) |
| Understand npm, GitHub, releases, and self-hosted assets | [Distribution](/guide/distribution) |

## Main Links

- Live demo: [demo.file-viewer.app](https://demo.file-viewer.app)
- iframe demo entry: [demo.file-viewer.app/iframe.html?url=/example/en/calibre-demo.docx](https://demo.file-viewer.app/iframe.html?url=/example/en/calibre-demo.docx)
- Document comparison demo: [demo.file-viewer.app/compare.html](https://demo.file-viewer.app/compare.html)
- GitHub repository: [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer)
- npm scope: [`@file-viewer`](https://www.npmjs.com/search?q=%40file-viewer)
- GitHub Sponsors: [github.com/sponsors/wybaby168](https://github.com/sponsors/wybaby168)
- WeChat / Alipay: [dev.flyfish.group/sponsor?source=github](https://dev.flyfish.group/sponsor?source=github)
- Enterprise support: [dev.flyfish.group/shop](https://dev.flyfish.group/shop)

## Positioning

Flyfish Viewer is not trying to replace specialist editors. It gives business products a practical, embedded preview layer for common and uncommon attachments: documents, spreadsheets, slides, PDFs, archives, email, diagrams, CAD drawings, 3D assets, code, logs, media, and data files.

The project keeps a pure TypeScript core under `@file-viewer/core`, split renderer packages for heavier formats, native component packages for Web Components, Vue, React, jQuery, and Svelte, and product-shaped presets for common capability sets.

The 2.1.0 architecture is modular by default: use minimal renderer imports when you need one exact format, or choose `preset-lite`, `preset-office`, `preset-engineering`, or `preset-all` when your product needs a composed capability set. In Vite projects, `@file-viewer/vite-plugin` auto-discovers installed presets and injects the capability layer, so most teams do not hand-write renderer imports.

For pages with uncontrolled global CSS, use the Web Component / IIFE default Shadow DOM isolation or pass `options.styleIsolation:'shadow'` from framework packages. Theme customization should use `--file-viewer-*` tokens and stable `::part()` surfaces.

For heavy users that need everything immediately:

```bash
npm install @file-viewer/vue3 @file-viewer/preset-all
npm install -D @file-viewer/vite-plugin # optional for Vite
```

```ts
fileViewerRenderers({ copyAssets: true })
```

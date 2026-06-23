# Distribution

<div class="doc-kicker">npm, GitHub, Releases, Self-hosting</div>

<p class="doc-lead">
  Flyfish Viewer is distributed through standard npm packages, public GitHub repositories, release downloads, and self-hostable worker/WASM assets.
</p>

## npm Registry

Common installs:

```bash
npm install @file-viewer/web
npm install @file-viewer/vue3
npm install @file-viewer/react
npm install @file-viewer/core
npm install @file-viewer/renderer-word
npm install @file-viewer/renderer-presentation
npm install @file-viewer/preset-lite
npm install @file-viewer/preset-office
npm install @file-viewer/preset-engineering
npm install @file-viewer/preset-all
# Optional engine-only package when you build a custom presentation renderer.
npm install @file-viewer/pptx
```

Registry links:

- [`@file-viewer/core`](https://www.npmjs.com/package/@file-viewer/core)
- [`@file-viewer/web`](https://www.npmjs.com/package/@file-viewer/web)
- [`@file-viewer/vue3`](https://www.npmjs.com/package/@file-viewer/vue3)
- [`@file-viewer/react`](https://www.npmjs.com/package/@file-viewer/react)
- [`@file-viewer/svelte`](https://www.npmjs.com/package/@file-viewer/svelte)
- [`@file-viewer/renderer-word`](https://www.npmjs.com/package/@file-viewer/renderer-word)
- [`@file-viewer/renderer-presentation`](https://www.npmjs.com/package/@file-viewer/renderer-presentation)
- [`@file-viewer/pptx`](https://www.npmjs.com/package/@file-viewer/pptx)
- [`@file-viewer/preset-lite`](https://www.npmjs.com/package/@file-viewer/preset-lite)
- [`@file-viewer/preset-office`](https://www.npmjs.com/package/@file-viewer/preset-office)
- [`@file-viewer/preset-engineering`](https://www.npmjs.com/package/@file-viewer/preset-engineering)
- [`@file-viewer/preset-all`](https://www.npmjs.com/package/@file-viewer/preset-all)
- [`@file-viewer/vite-plugin`](https://www.npmjs.com/package/@file-viewer/vite-plugin)

The package metadata points to the public repositories, documentation, issue trackers, Apache-2.0 license, and sponsorship URL.
`@file-viewer/core` stays lightweight and does not install Word or native PPTX engines directly.
Use `@file-viewer/preset-lite`, `@file-viewer/preset-office`, or `@file-viewer/preset-engineering` for product-shaped bundles; use individual renderer packages for the smallest custom install, or `@file-viewer/preset-all` when you want the same full renderer matrix as the official demo.
`@file-viewer/pptx` is the standalone engine package for custom renderer work.

## GitHub

Main repository:

- [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer)

Suggested discovery topics for the main repository:

```txt
file-viewer, document-viewer, document-preview, file-preview, office-viewer,
pdf-viewer, docx, pptx, xlsx, cad-viewer, drawio, excalidraw, web-component,
vue, react, svelte, typescript, wasm, offline-first, self-hosted
```

When you are ready to update the repository topics:

```bash
gh repo edit flyfish-dev/file-viewer \
  --remove-topic cad \
  --remove-topic office \
  --remove-topic jquery \
  --remove-topic ofd \
  --add-topic document-preview \
  --add-topic file-preview \
  --add-topic web-component \
  --add-topic self-hosted
```

GitHub currently allows up to 20 repository topics, so treat this list as the main SEO surface.

## Release Downloads

GitHub Releases can carry:

- static demo builds
- docs builds
- npm tarballs for offline installs
- component demo builds
- source bundles
- demo GIF or MP4 assets for posts and README embeds

For offline or intranet package installs, download the tarballs and install them through a private registry or direct local paths.

## Self-hosted Runtime Assets

Copy browser runtime assets into your app:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

This copies and verifies worker, WASM, PDF, CAD, Typst, SQLite, archive, Office, Draw.io, and other renderer assets. Runtime options can point each renderer to those self-hosted URLs.

## Sponsorship

Flyfish Viewer remains Apache-2.0 open source. Sponsorship helps fund compatibility work, private deployment support, and priority issue handling:

- [dev.flyfish.group/shop](https://dev.flyfish.group/shop)

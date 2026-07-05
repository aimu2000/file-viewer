# Distribution

<div class="doc-kicker">npm, GitHub, Releases, Self-hosting</div>

<p class="doc-lead">
  Flyfish Viewer is distributed through standard npm packages, public GitHub repositories, release downloads, and self-hostable worker/WASM assets.
</p>

## npm Registry

Common installs:

```bash
npm install @file-viewer/vue3 @file-viewer/preset-office
# Heavy users / all-format attachment centers:
npm install @file-viewer/vue3 @file-viewer/preset-all
# Replace @file-viewer/vue3 with @file-viewer/web / react / vue2.7 / vue2.6 / jquery / svelte for other stacks.
```

Pass the preset through `options.preset` in Webpack, Rspack, Rollup, Umi, classic multi-page apps, or internal component libraries. Vite projects can additionally install and register the plugin:

```bash
npm install -D @file-viewer/vite-plugin
```

Recommended Vite setup:

```ts
fileViewerRenderers({
  copyAssets: true
})
```

After registration, the plugin auto-discovers installed `@file-viewer/preset-*` packages and injects the capability layer. Use single renderer packages plus `formats` only for strict custom cuts.

Common customization boundaries:

| Option | Purpose |
| --- | --- |
| `copyAssets:true` | Copies matched Worker, WASM, font, PDF/CAD/Typst/Archive/Data, and other static assets; recommended for production and intranet deployments |
| `formats` / `renderers` | Generates exact renderer imports when you do not use a preset, or when a preset needs a few extra formats |
| `scan:true` | Reads source hints such as `fileViewerFormats`, `data-file-viewer-formats`, and upload `accept` attributes |
| `preset:'auto'` / `autoPresets:true` | Keeps installed preset auto-activation enabled while `scan:true` is active |
| `inject:false` | Disables auto injection so application code can import `virtual:file-viewer-renderers` and pass `options.renderers` manually |

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

The package metadata points to the public repositories, documentation, issue trackers, Apache-2.0 license, and npm donation URL: [dev.flyfish.group/donate?source=npm](https://dev.flyfish.group/donate?source=npm).
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
The public GitHub repository keeps source, small release metadata, and lightweight package output in git. Full demo, component demo, docs, and sample-file builds should live in GitHub Releases or Cloudflare Pages deployments instead of expanded top-level directories, so a normal clone stays practical. Use `pnpm release:public -- --expanded-assets` only for one-off delivery or mirror troubleshooting that truly needs expanded static assets.

## Official Demo iframe Artifact

When a customer asks for the official demo build output for iframe integration, use the GitHub Release asset `file-viewer-v2-*-official-demo-iframe.tar.gz`. It does not require installing npm packages in the host application. Extract the whole archive to one static directory and keep `assets/`, `vendor/`, `wasm/`, and `example/` together.

`/iframe.html` is the recommended chrome-free entry, and clean-URL static hosts can also use `/iframe`. `/index.html` keeps the original full demo and remains compatible with the same `url`, `from`, `name`, and `postMessage(Blob)` protocol.

URL-based iframe:

```html
<iframe
  src="/file-viewer/iframe.html?url=/files/demo.docx"
  style="width:100%;height:720px;border:0"
  allow="fullscreen"
></iframe>
```

Blob handoff from the parent page:

```html
<iframe
  id="viewer"
  src="/file-viewer/iframe.html?from=https%3A%2F%2Fapp.example.com&name=contract.docx"
></iframe>
<script>
  const file = await fetch('/api/files/contract.docx').then(response => response.blob())
  document.querySelector('#viewer').contentWindow.postMessage(file, 'https://static.example.com')
</script>
```

`from` must match the parent origin. The demo accepts only a `Blob` from that origin and renders it as the provided `name`. The archive also includes `iframe-example.html`, `README.iframe.md`, and `iframe-manifest.json`; `pnpm release:demo-iframe:pack` and `pnpm verify:demo-iframe-artifact` make this artifact part of the standard release flow.

## Self-hosted Runtime Assets

Copy browser runtime assets into your app:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

This copies and verifies worker, WASM, PDF, CAD, Typst WASM/fonts, SQLite, archive, Office, Draw.io, and other renderer assets. Runtime options can point each renderer to those self-hosted URLs.

Vue full packages use `/file-viewer/` as their default static prefix. When those copied assets are published there, `@file-viewer/vue3-full`, `@file-viewer/vue2.7-full`, and `@file-viewer/vue2.6-full` automatically point to `/file-viewer/vendor/libarchive/worker-bundle.js`, `/file-viewer/vendor/libarchive/libarchive.wasm`, PDF.js, DOCX, PPTX, CAD, Typst, Draw.io, SQLite, and related assets. If you deploy under a different prefix, call `setDefaultFullAssetBaseUrl('/your-prefix/')` during startup, or keep using explicit `options.archive.*`, `options.pdf.*`, `options.typst.*`, and other asset URL overrides.

For Cloudflare Pages, edge compression is enabled according to the visitor `Accept-Encoding` header. `scripts/deploy-cloudflare-pages.mjs` also Brotli-compresses oversized WASM files before Direct Upload and writes `Content-Encoding: br`, `Vary: Accept-Encoding`, `Content-Type: application/wasm`, and long-term cache headers into `_headers`. This keeps large assets such as the Typst compiler WASM deployable under the original `.wasm` URL. After deployment, verify the live headers with:

```bash
pnpm verify:cloudflare-compression
```

## Sponsorship

Flyfish Viewer remains Apache-2.0 open source. Sponsorship helps fund compatibility work, private deployment support, and priority issue handling:

- [dev.flyfish.group/sponsor?source=github](https://dev.flyfish.group/sponsor?source=github)

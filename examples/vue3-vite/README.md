# Vue 3 + Vite + full package

A one-step Vue 3 starter using `@file-viewer/vue3-full`. It enables the complete preset and all 206 maintained extension mappings while keeping heavy renderers lazy by format.

```bash
pnpm install
pnpm dev
```

From the repository root:

```bash
pnpm --dir examples/vue3-vite dev
```

The Vite plugin copies the complete local runtime asset set for private and offline deployment. `setDefaultFullAssetBaseUrl('/')` aligns the full package with the plugin's root-relative `vendor/` and `wasm/` output. For a smaller dependency graph, replace the full package with `@file-viewer/vue3` plus `preset-lite`, `preset-office`, or `preset-engineering`.

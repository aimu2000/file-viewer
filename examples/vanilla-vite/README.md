# Vanilla JS + Web Component + Vite

A framework-free starter using the lightweight Web Component and `preset-lite`. It previews text, code, Markdown, images, audio, and video while keeping the initial dependency set compact.

```bash
pnpm install
pnpm dev
```

From the repository root:

```bash
pnpm --dir examples/vanilla-vite dev
```

`@file-viewer/vite-plugin` copies runtime assets into the build automatically. To cover another format family, replace `preset-lite` with `preset-office`, `preset-engineering`, or `preset-all` in both `package.json` and `vite.config.ts`, then pass the same preset through `viewer.options`.

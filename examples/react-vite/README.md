# React 18/19 + Vite + Office preset

A production-shaped React starter for PDF/OFD, Word, spreadsheet, and presentation files. The component is React-native; renderer capability comes from the modular Office preset.

```bash
pnpm install
pnpm dev
```

From the repository root:

```bash
pnpm --dir examples/react-vite dev
```

The starter passes `officePreset` through `options.preset` and uses `@file-viewer/vite-plugin` to copy Worker, WASM, font, and vendor assets into the production build. Replace the bundled PDF or choose a local Office file to test your integration.

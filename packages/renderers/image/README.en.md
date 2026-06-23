# @file-viewer/renderer-image

Standalone image renderer package for Flyfish File Viewer. It handles browser-side preview, lightbox viewing, and unified zoom for `png`, `jpg`, `webp`, `avif`, `gif`, `svg`, `tiff`, `ico`, `heic`, `heif`, `jxl`, and related image files.

## Usage

```ts
import { imageRenderer } from '@file-viewer/renderer-image'

const options = {
  builtinRenderers: 'none',
  renderers: [imageRenderer],
}
```

Or compose it through the full preset:

```ts
import { allRenderers } from '@file-viewer/preset-all'

const options = {
  builtinRenderers: 'none',
  renderers: allRenderers,
}
```

## Features

- Common image formats use native browser decoding without extra runtime work.
- HEIC / HEIF dynamically imports `heic2any` only when those formats are opened.
- Includes lightbox viewing, a unified zoom provider, theme-aware background, and unmount cleanup.

## Migration Note

`@file-viewer/core` still keeps lightweight native image preview for browser-supported PNG / JPEG / SVG / WebP formats, but it no longer installs `heic2any` by default. Install this package explicitly, or use `@file-viewer/preset-all`, when HEIC / HEIF conversion or the full standalone image renderer is required.

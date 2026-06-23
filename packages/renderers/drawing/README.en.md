# @file-viewer/renderer-drawing

Standalone Draw.io, Excalidraw, Mermaid, and PlantUML renderer for Flyfish File Viewer.

## Highlights

- Uses the bundled diagrams.net offline viewer for `drawio` / `dio` files.
- Uses Excalidraw's official `restore` and `exportToSvg` APIs, with a `roughjs` SVG fallback.
- Lazy-loads the official `mermaid` renderer for `mermaid` / `mmd` files and outputs theme-aware SVG.
- Keeps `plantuml` / `puml` files fully offline by default with an SVG source preview; configure `options.drawing.plantumlServerUrl` for full PlantUML SVG rendering through a self-hosted endpoint. When that endpoint is unavailable, the renderer still falls back to the offline preview instead of a blank view or broken image.
- Mermaid and PlantUML previews use `@panzoom/panzoom` for drag panning, Ctrl/Command wheel zoom, and common toolbar zoom sync.
- Supports unified zoom, print, HTML export, and `options.drawing` self-hosted asset configuration.
- Ships as an independent renderer package for applications that only need drawing preview.
- `@file-viewer/core` no longer bundles the drawing renderer and no longer depends directly on `@excalidraw/excalidraw`, `mermaid`, `plantuml-encoder`, `@panzoom/panzoom`, or `roughjs`.

## Usage

```ts
import { createFileViewerCore, createFileViewerRendererRegistry } from '@file-viewer/core';
import { drawingRenderer } from '@file-viewer/renderer-drawing';

const registry = createFileViewerRendererRegistry({
  renderers: [drawingRenderer],
});

const viewer = createFileViewerCore({
  target: document.querySelector('#viewer')!,
  rendererRegistry: registry,
});
```

See the [official on-demand renderer guide](https://doc.file-viewer.app/guide/on-demand-renderers) for production setup.

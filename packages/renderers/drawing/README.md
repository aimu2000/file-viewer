# @file-viewer/renderer-drawing

Flyfish File Viewer 的独立绘图渲染器，覆盖 `drawio`、`dio`、`excalidraw`、`mermaid`、`mmd`、`plantuml` 和 `puml`。

## 特性

- `drawio` / `dio` 默认使用随 viewer assets 分发的 diagrams.net offline viewer。
- `excalidraw` 使用官方 `restore` 与 `exportToSvg`，失败时回退到 `roughjs` 只读 SVG。
- `mermaid` / `mmd` 按需加载官方 `mermaid`，输出主题适配 SVG。
- `plantuml` / `puml` 默认保持离线 SVG 源码预览；需要完整 PlantUML 渲染时，可通过 `options.drawing.plantumlServerUrl` 指向自托管 SVG 端点，端点不可用时仍会回落到离线预览，避免白屏或 broken image。
- Mermaid / PlantUML 预览使用 `@panzoom/panzoom` 提供拖拽平移、Ctrl/Command 滚轮缩放和统一工具栏缩放联动。
- 支持统一缩放、打印、HTML 导出和 `options.drawing` 自托管资源配置。
- 独立安装、独立发布，适合只需要绘图预览的业务按需装配。
- `@file-viewer/core` 已不再内置 drawing renderer，也不再直接依赖 `@excalidraw/excalidraw`、`mermaid`、`plantuml-encoder`、`@panzoom/panzoom` 或 `roughjs`。

## 使用

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

完整按需加载方案见 [官方文档](https://doc.file-viewer.app/guide/on-demand-renderers)。

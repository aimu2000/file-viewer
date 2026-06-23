# @file-viewer/renderer-pdf

Flyfish File Viewer 的独立 PDF renderer 包，基于 PDF.js，提供 PDF 页面渲染、导航、目录、搜索、缩放、打印和 HTML 导出能力。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { pdfRenderer } from '@file-viewer/renderer-pdf'

const options = {
  rendererMode: 'replace',
  renderers: pdfRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer],
}
```

## 离线资源

PDF 预览依赖 PDF.js worker、cMaps、WASM 和 standard fonts。资源路径沿用 `@file-viewer/core` 的统一 options：

```ts
const options = {
  renderers: pdfRenderer,
  pdf: {
    workerUrl: '/vendor/pdf/pdf.worker.mjs',
    cMapUrl: '/vendor/pdf/cmaps/',
    wasmUrl: '/vendor/pdf/wasm/',
    standardFontDataUrl: '/vendor/pdf/standard_fonts/',
  },
}
```

## 迁移说明

PDF 渲染已经从 `@file-viewer/core` 移入本包，`pdfjs-dist` 只由 `@file-viewer/renderer-pdf` 声明。只安装 core 或标准组件包时不会再拉取 PDF.js；需要 PDF 预览时请显式装配本 renderer，或使用 `@file-viewer/preset-all`。

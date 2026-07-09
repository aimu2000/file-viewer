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

默认未显式配置时，渲染器会基于当前文档 `baseURI` 探测 `vendor/pdf/pdf.worker.mjs`，因此 Vite/UMI 等项目部署在 `/workspace/` 这类子路径时会请求 `/workspace/vendor/pdf/pdf.worker.mjs`，不会强制落到站点根路径。如果客户项目没有执行 `file-viewer-copy-assets`、没有使用 `@file-viewer/vite-plugin`，或者本地临时服务器把该路径回退成 HTML，PDF renderer 会自动懒加载包内 PDF.js worker handler 作为兼容兜底，避免 `Setting up fake worker failed` 直接中断预览。需要最佳性能、完整 cMap/standard fonts 或严格离线部署时，仍建议复制 viewer assets 并配置真实静态地址；`wasmUrl` 保留给提供 WASM 资产的 PDF.js 构建兼容使用。

## 迁移说明

PDF 渲染已经从 `@file-viewer/core` 移入本包，`pdfjs-dist` 只由 `@file-viewer/renderer-pdf` 声明。只安装 core 或标准组件包时不会再拉取 PDF.js；需要 PDF 预览时请显式装配本 renderer，或使用 `@file-viewer/preset-all`。

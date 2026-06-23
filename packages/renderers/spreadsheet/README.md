# @file-viewer/renderer-spreadsheet

Flyfish File Viewer 的独立表格 renderer 包。它基于 `styled-exceljs` 与 `e-virt-table` 提供 XLSX、XLSM、XLSB、XLS、CSV、ODS、FODS、Numbers 等表格文件的浏览器端预览，并通过 File Viewer 统一的 asset manifest 解析可选 Worker 路径，适合企业内网和离线部署。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { spreadsheetRenderer } from '@file-viewer/renderer-spreadsheet'

const options = {
  rendererMode: 'replace',
  renderers: spreadsheetRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
import { pdfRenderer } from '@file-viewer/renderer-pdf'
import { spreadsheetRenderer } from '@file-viewer/renderer-spreadsheet'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer, spreadsheetRenderer],
}
```

## 能力边界

- 支持 `.xlsx`、`.xltx`、`.xlsm`、`.xlsb`、`.xls`、`.xlt`、`.xltm`、`.csv`、`.ods`、`.fods`、`.numbers`。
- 默认主线程解析，避免本地服务器、手机 WebView、MIME 或 CSP 导致 Worker 卡住。
- 可以通过 `options.spreadsheet.worker: true` 与 `options.spreadsheet.workerUrl` 显式启用静态 Worker。
- 支持多 sheet、横向滚动标签栏、合并单元格、列宽/行高、边框、填充、对齐、文本颜色、图片覆盖层、统一缩放 provider 和可选表头拖拽调整列宽。
- 表格使用虚拟渲染，适合交互预览；完整打印按钮通常由上层能力判断隐藏，避免只打印当前视口。

## 离线资产

默认可选 Worker 路径为：

- `vendor/xlsx/sheet.worker.js`

私有化部署时可以通过 `options.spreadsheet.workerUrl` 覆盖。官方 Vite 插件和 Demo worker 构建脚本会从本包的 worker 入口生成该文件。

## 迁移说明

表格预览已经从 `@file-viewer/core` 中彻底移出，core 只保留资产 manifest、类型和兼容错误提示，不再默认安装 `styled-exceljs`、`e-virt-table` 或 `tinycolor2`。完整表格能力请安装本包并传入 `renderers`，或直接使用 `@file-viewer/preset-all`。

# Flyfish Viewer

纯前端多格式文件预览组件，支持 Word、Excel、PPT、PDF、OFD、CAD、Markdown、图片、代码/文本和视频等常见附件场景。

- 在线 Demo: [viewer.flyfish.dev](https://viewer.flyfish.dev)
- npm: [@flyfish-group/file-viewer3](https://www.npmjs.com/package/@flyfish-group/file-viewer3)
- 源码自助开通: [dev.flyfish.group/shop](https://dev.flyfish.group/shop)
- 当前版本: `1.0.6`

## 这个仓库包含什么

这是 Flyfish Viewer 的公开成品仓库，面向下载和直接接入，不包含源码目录。

| 路径 | 内容 |
| --- | --- |
| `dist/` | 混淆压缩后的 Vue 3 组件库产物和类型声明 |
| `demo/` | 可独立部署的在线预览器静态站点 |
| `docs/` | VitePress 文档静态站点 |
| `example/` | 完整样例文件列表，覆盖当前已注册格式 |
| `artifacts/` | 可下载 tarball，包括 npm 包、Demo、文档和库产物 |
| `LICENSE` | Apache-2.0 许可证 |

## 直接安装

```bash
pnpm add @flyfish-group/file-viewer3
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<template>
  <div style="height: 100vh">
    <file-viewer url="https://example.com/demo.pdf" />
  </div>
</template>
```

## 使用本仓库成品

如果你不想走 npm，可以下载 `artifacts/flyfish-group-file-viewer3-1.0.6.tgz`:

```bash
pnpm add ./artifacts/flyfish-group-file-viewer3-1.0.6.tgz
```

如果你要独立部署预览器，可以把 `demo/` 目录直接发布到任意静态资源服务。iframe 集成示例:

```html
<iframe
  src="https://viewer.flyfish.dev?url=https%3A%2F%2Fexample.com%2Fdemo.pdf"
  style="width: 100%; height: 100%; border: 0"
></iframe>
```

## 支持格式

当前内置 59 个扩展名映射，覆盖 11 条预览链路:

- Word: `doc`、`docx`
- Excel: `xlsx`、`xlsm`、`xlsb`、`xls`、`csv`、`ods`、`fods`、`numbers`
- PowerPoint: `pptx`
- PDF: `pdf`，支持缩放工具栏、页码状态和可显隐导航窗格
- OFD: `ofd`，基于 `DLTech21/ofd.js` 纯 JS 链路
- CAD: `dxf`，`dwg` 作为转换提示入口
- Markdown: `md`、`markdown`
- 图片: `gif`、`jpg`、`jpeg`、`bmp`、`tiff`、`tif`、`png`、`svg`、`webp`
- 代码/文本: `txt`、`json`、`js`、`mjs`、`cjs`、`css`、`java`、`py`、`html`、`htm`、`jsx`、`ts`、`tsx`、`xml`、`log`、`vue`、`yaml`、`yml`、`ini`、`sh`、`bash`、`sql`、`go`、`rs`、`php`、`c`、`cpp`、`cc`、`h`、`hpp`、`cs`、`diff`
- 视频: `mp4`

## 源码和二开

本仓库只提供可直接使用的成品。如果你需要源码、二开包或商业自助开通，请前往 [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)，付费 4.99 后自助开通。

## 授权与贡献

项目使用 `Apache-2.0` 许可证。二开或商用时，请保留许可证、版权和来源说明，并注明项目来源为 Flyfish Viewer / `@flyfish-group/file-viewer3`。

如果你修复了通用问题或增强了通用能力，欢迎通过 issue / PR 一起贡献回来。

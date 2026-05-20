# Flyfish Viewer

纯前端多格式文件预览组件，支持 Word、Excel、PPT、PDF、OFD、CAD、Excalidraw、draw.io、EPUB、UMD、Markdown、图片、音频、代码/文本和视频等常见附件场景。

这个仓库是 Flyfish Viewer 的公开成品仓库，负责提供可直接下载和接入的构建产物；官方文档和组件主页请访问 [doc.flyfish.dev](https://doc.flyfish.dev)。

- 官方文档/组件主页: [doc.flyfish.dev](https://doc.flyfish.dev)
- 在线 Demo: [viewer.flyfish.dev](https://viewer.flyfish.dev)
- npm(Vue3): [@flyfish-group/file-viewer3](https://www.npmjs.com/package/@flyfish-group/file-viewer3)
- npm(Vue2.7): [@flyfish-group/file-viewer](https://www.npmjs.com/package/@flyfish-group/file-viewer)
- 公开成品仓库: [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer)
- 源码自助开通: [dev.flyfish.group/shop](https://dev.flyfish.group/shop)
- 当前版本: `1.0.9`

## 为什么值得接入

- **纯前端 Serverless。** 文档解析和渲染主要在浏览器完成，不依赖后端 Office 转码服务，适合静态部署、私有化部署和多系统复用。
- **格式覆盖完整。** 当前内置 74 个扩展名映射，覆盖 Office、PDF、OFD、CAD、Excalidraw、draw.io、EPUB、UMD、Markdown、代码/文本、图片、音频和视频。
- **按需异步加载。** OFD、CAD、绘图、PDF、Office、EPUB、UMD、Markdown、音频和代码高亮能力按需加载，重型解析器不会拖慢其他格式首屏。
- **阅读体验更像产品。** PDF 支持缩放、页码状态、导航窗格和宽度自适应；Word 视图保留灰色页面底与白色纸张。
- **Demo 更适合验收。** 示例文件按文档、表格、图纸、代码、图片等类型分组展示，点击样例即可打开并自动收起选择器。
- **接入方式灵活。** Vue 3 / Vue 2.7 项目均可安装 npm 包直接使用，也可以独立部署 `demo/` 后通过 iframe 嵌入任意系统。
- **成品交付友好。** 仓库内提供混淆压缩库产物、Demo 静态站点、文档静态站点、样例文件和可下载 tarball。

## 这个仓库包含什么

本仓库面向下载和直接接入，不包含源码目录。

| 路径 | 内容 |
| --- | --- |
| `dist/` | 混淆压缩后的 Vue 3 组件库产物和类型声明 |
| `demo/` | 可独立部署的在线预览器静态站点 |
| `docs/` | 官方文档站的 VitePress 静态构建产物 |
| `example/` | 完整样例文件列表，覆盖当前已注册格式 |
| `artifacts/` | 可下载 tarball，包括 npm 包、Demo、文档和库产物 |
| `LICENSE` | Apache-2.0 许可证 |

## 直接安装

Vue3 项目使用:

```bash
pnpm add @flyfish-group/file-viewer3
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

Vue2.7 项目使用:

```bash
pnpm add @flyfish-group/file-viewer
```

```ts
import Vue from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer'

Vue.use(FileViewer)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

```vue
<template>
  <div style="height: 100vh">
    <file-viewer url="https://example.com/demo.pdf" />
  </div>
</template>
```

## 使用本仓库成品

如果你不想走 npm，可以下载 `artifacts/flyfish-group-file-viewer3-1.0.9.tgz`:

```bash
pnpm add ./artifacts/flyfish-group-file-viewer3-1.0.9.tgz
```

如果你要独立部署预览器，可以把 `demo/` 目录直接发布到任意静态资源服务。iframe 集成示例:

```html
<iframe
  src="https://viewer.flyfish.dev?url=https%3A%2F%2Fexample.com%2Fdemo.pdf"
  style="width: 100%; height: 100%; border: 0"
></iframe>
```

更完整的组件参数、iframe 二进制推送、格式说明和部署说明，请查看 [官方文档](https://doc.flyfish.dev)。

## 支持格式

当前内置 74 个扩展名映射，覆盖 15 条预览链路:

- Word: `doc`、`docx`
- Excel: `xlsx`、`xlsm`、`xlsb`、`xls`、`csv`、`ods`、`fods`、`numbers`
- PowerPoint: `pptx`
- PDF: `pdf`，支持缩放工具栏、页码状态、可显隐导航窗格和宽度自适应
- OFD: `ofd`，基于 `DLTech21/ofd.js` 源码链路预览
- CAD: `dxf`，`dwg` 作为转换提示入口
- Excalidraw: `excalidraw`，基于官方 `@excalidraw/excalidraw` 预览
- draw.io: `drawio`、`dio`，基于 diagrams.net GraphViewer 预览
- 电子书: `epub`、`umd`
- Markdown: `md`、`markdown`
- 图片: `gif`、`jpg`、`jpeg`、`bmp`、`tiff`、`tif`、`png`、`svg`、`webp`
- 代码/文本: `txt`、`json`、`js`、`mjs`、`cjs`、`css`、`java`、`py`、`html`、`htm`、`jsx`、`ts`、`tsx`、`xml`、`log`、`vue`、`yaml`、`yml`、`ini`、`sh`、`bash`、`sql`、`go`、`rs`、`php`、`c`、`cpp`、`cc`、`h`、`hpp`、`cs`、`diff`
- 音频: `mp3`、`mpeg`、`wav`、`ogg`、`oga`、`opus`、`m4a`、`aac`、`flac`、`weba`
- 视频: `mp4`

## 源码和二开

本仓库只提供可直接使用的成品。如果你需要源码、二开包或商业自助开通，请前往 [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)，付费 4.99 后自助开通。

## 授权与贡献

项目使用 `Apache-2.0` 许可证。二开或商用时，请保留许可证、版权和来源说明，并注明项目来源为 Flyfish Viewer / `@flyfish-group/file-viewer3` / `@flyfish-group/file-viewer`。

如果你修复了通用问题或增强了通用能力，欢迎通过 issue / PR 一起贡献回来。

# Flyfish Viewer

[简体中文](README.md) | [English](README.en.md)

把 Word、Excel、PPT、PDF、Typst、压缩包、邮件、音视频、地理数据、字体、设计资产和结构化数据稳稳带进浏览器里。

`@file-viewer/core` 提供底层预览能力、格式矩阵、生命周期事件和操作 API；Vue3、Vue2、React、纯 Web、jQuery、Svelte 等 wrapper 只负责各自生态的原生组件体验、类型出口和交互封装。新项目建议优先使用 `@file-viewer/*` 标准包名，`@flyfish-group/*` 历史包名继续同步维护。

它不依赖后端转码服务，适合接入 OA、知识库、附件中心、流程系统和需要离线能力的业务场景。这个项目的目标很直接: 让文档预览不再像临时拼出来的功能，而是像一个可以放心交付、能独立演示、能持续维护的产品模块。

- npm(Vue3 标准包): [@file-viewer/vue3](https://www.npmjs.com/package/@file-viewer/vue3)
- npm(Vue3 兼容包): [@flyfish-group/file-viewer3](https://www.npmjs.com/package/@flyfish-group/file-viewer3)
- npm(Vue2): [@flyfish-group/file-viewer](https://www.npmjs.com/package/@flyfish-group/file-viewer)
- npm(React): [@flyfish-group/file-viewer-react](https://www.npmjs.com/package/@flyfish-group/file-viewer-react)
- npm(纯 JS): [@flyfish-group/file-viewer-web](https://www.npmjs.com/package/@flyfish-group/file-viewer-web)
- 官方文档: [doc.flyfish.dev](https://doc.flyfish.dev)
- 在线 Demo: [viewer.flyfish.dev](https://viewer.flyfish.dev)
- 文档比对 Demo: [viewer.flyfish.dev/compare.html](https://viewer.flyfish.dev/compare.html)
- Release 下载: [github.com/flyfish-dev/file-viewer/releases](https://github.com/flyfish-dev/file-viewer/releases)
- Docker 镜像发布目标: `flyfishdev/file-viewer:2.0.0`
- 公开成品仓库(GitHub): [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer)
- 公开成品仓库(Gitee): [gitee.com/flyfish-dev/file-viewer](https://gitee.com/flyfish-dev/file-viewer)
- 源码自助开通: [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)

## 当前发布版本

| 技术栈 | npm 包 | 最新版本 | 推荐分支 | 说明 |
| --- | --- | --- | --- | --- |
| Core | `@file-viewer/core` | `2.0.0` | `main` | 框架无关的格式矩阵、预览能力、事件和操作 API |
| Vue3 | `@file-viewer/vue3` / `@flyfish-group/file-viewer3` | `2.0.0` | `v3` | Vue3 原生组件包，代码已迁移到 `packages/wrappers/vue3` 独立包线 |
| Vue2.7 | `@file-viewer/vue2.7` / `@flyfish-group/file-viewer` | `2.0.0` | `v2` | Vue2 原生组件包，格式能力与 Vue3 保持一致 |
| React 17 / 18 / 19 | `@file-viewer/react` / `@flyfish-group/file-viewer-react` | `2.0.0` | wrapper 子工程 | React 原生组件，复用共享 core native engine |
| 纯 JS | `@file-viewer/web` / `@flyfish-group/file-viewer-web` | `2.0.0` | wrapper 子工程 | `mountViewer(container, options)` 原生 DOM 挂载和资源工具 |

如果你在内网、离线环境，或者 npm 发布权限还没有完成配置，也可以直接使用公开成品仓库 `artifacts/` 里的 tarball。离线安装 React 包时请先安装同版本 web 包:

```bash
npm install ./artifacts/flyfish-group-file-viewer3-2.0.0.tgz
npm install ./artifacts/file-viewer-core-2.0.0.tgz
npm install ./artifacts/file-viewer-vue3-2.0.0.tgz
npm install ./artifacts/flyfish-group-file-viewer-2.0.0.tgz
npm install ./artifacts/flyfish-group-file-viewer-web-2.0.0.tgz
npm install ./artifacts/flyfish-group-file-viewer-react-2.0.0.tgz
```

Core、Vue3、Vue2、React、React legacy、纯 JS、jQuery、Svelte 和历史兼容 tarball 都会随公开成品仓库一起生成。`file-viewer3` 非 scoped 兼容包仍会同步发布到 npm，但它和 `@flyfish-group/file-viewer3` 包体重复，公开成品仓库不再重复存储该 tarball。React / 纯 JS 包推荐用 `npm install` 获得完整依赖体验；如需自托管 Worker、WASM 和示例资源，可运行 `pnpm exec file-viewer-copy-assets ./public/file-viewer`。

GitHub Release 会同步提供完整下载项:

| 文件 | 用途 |
| --- | --- |
| `file-viewer-v2-*-demo.tar.gz` | 主 Demo 静态站，解压后即可体验主预览和 `/compare.html` 文档比对 |
| `file-viewer-v2-*-wrapper-demo.tar.gz` | React / 纯 JS 原生 wrapper 演示站 |
| `file-viewer-v2-*-lib-dist.tar.gz` | Vue3 组件库构建产物，适合离线检查 dist 内容 |
| `file-viewer-v2-*-docs.tar.gz` | 文档站静态产物 |
| `file-viewer-core-*.tgz` | `@file-viewer/core` 纯 TypeScript 底座本地 npm 安装包 |
| `file-viewer-vue3-*.tgz` | Vue3 标准包名本地 npm 安装包 |
| `file-viewer-vue2.7-*.tgz` | Vue2.7 标准 wrapper 本地 npm 安装包 |
| `file-viewer-vue2.6-*.tgz` | Vue2.6 标准 wrapper 本地 npm 安装包 |
| `file-viewer-react-*.tgz` | React 18/19 标准 wrapper 本地 npm 安装包 |
| `file-viewer-react-legacy-*.tgz` | React 16.8/17 标准 wrapper 本地 npm 安装包 |
| `file-viewer-web-*.tgz` | 纯 Web 标准 wrapper，本地安装后可复制 Worker/WASM viewer assets |
| `file-viewer-jquery-*.tgz` | jQuery 标准 wrapper 本地 npm 安装包 |
| `file-viewer-svelte-*.tgz` | Svelte 标准 wrapper 本地 npm 安装包 |
| `flyfish-group-file-viewer3-*.tgz` | Vue3 本地 npm 安装包 |
| `flyfish-group-file-viewer-*.tgz` | Vue2.7 本地 npm 安装包 |
| `flyfish-group-file-viewer-web-*.tgz` | 纯 JS 历史兼容包，提供 `mountViewer` 原生挂载和资源复制工具 |
| `flyfish-group-file-viewer-react-*.tgz` | React 历史兼容包，提供原生 React 组件入口 |

`file-viewer3` 非 scoped 历史兼容包仍会走 npm 发布链路；公开成品仓库下载区使用 `flyfish-group-file-viewer3-*.tgz` 作为 Vue3 兼容 tarball，避免重复存储相同包体。

<!-- FILE_VIEWER_PUBLIC_GENERATED:START -->
## 标准生态包与公开仓库

下面内容由 `ecosystem/wrappers.json` 和 `packages/core/src/formats.ts` 自动生成。公开成品仓库同步 README 时会携带同一份索引，确保用户可以从任意入口找到标准 npm 包、历史兼容包和公开 wrapper 仓库。

核心底座包: `@file-viewer/core`。core 源码只在私有 Gitea 仓库维护；公开 GitHub/Gitee 只发布 wrapper 源码、压缩构建产物、Demo、文档站、示例文件和 tarball。

| 框架 | 标准 npm 包 | 入口格式 | GitHub | Gitee | 兼容历史包 |
| --- | --- | --- | --- | --- | --- |
| Vue 3 | `@file-viewer/vue3` | ESM, 类型声明 | [file-viewer-vue3](https://github.com/flyfish-dev/file-viewer-vue3) | [file-viewer-vue3](https://gitee.com/flyfish-dev/file-viewer-vue3) | `@flyfish-group/file-viewer3`, `file-viewer3` |
| Vue 2.7 | `@file-viewer/vue2.7` | ESM, 类型声明 | [file-viewer-vue2.7](https://github.com/flyfish-dev/file-viewer-vue2.7) | [file-viewer-vue2.7](https://gitee.com/flyfish-dev/file-viewer-vue2.7) | `@flyfish-group/file-viewer` |
| Vue 2.6 | `@file-viewer/vue2.6` | ESM, 类型声明 | [file-viewer-vue2.6](https://github.com/flyfish-dev/file-viewer-vue2.6) | [file-viewer-vue2.6](https://gitee.com/flyfish-dev/file-viewer-vue2.6) | 无 |
| React 18/19 | `@file-viewer/react` | ESM, 类型声明 | [file-viewer-react](https://github.com/flyfish-dev/file-viewer-react) | [file-viewer-react](https://gitee.com/flyfish-dev/file-viewer-react) | `@flyfish-group/file-viewer-react` |
| React 16.8/17 | `@file-viewer/react-legacy` | ESM, 类型声明 | [file-viewer-react-legacy](https://github.com/flyfish-dev/file-viewer-react-legacy) | [file-viewer-react-legacy](https://gitee.com/flyfish-dev/file-viewer-react-legacy) | 无 |
| Pure Web | `@file-viewer/web` | ESM, 类型声明, script 标签 IIFE, Worker/WASM viewer 资源, 复制静态资源 CLI | [file-viewer-web](https://github.com/flyfish-dev/file-viewer-web) | [file-viewer-web](https://gitee.com/flyfish-dev/file-viewer-web) | `@flyfish-group/file-viewer-web` |
| jQuery | `@file-viewer/jquery` | ESM, 类型声明 | [file-viewer-jquery](https://github.com/flyfish-dev/file-viewer-jquery) | [file-viewer-jquery](https://gitee.com/flyfish-dev/file-viewer-jquery) | 无 |
| Svelte | `@file-viewer/svelte` | Svelte 组件, ESM, 类型声明 | [file-viewer-svelte](https://github.com/flyfish-dev/file-viewer-svelte) | [file-viewer-svelte](https://gitee.com/flyfish-dev/file-viewer-svelte) | 无 |

共享 core 当前声明 23 条预览链路、194 个扩展名。完整格式说明见本文“支持格式”和官方文档: https://doc.flyfish.dev/guide/formats
<!-- FILE_VIEWER_PUBLIC_GENERATED:END -->

![Flyfish Viewer demo](docs/_images/demo-main.png)

## 为什么值得接入

- **纯前端 Serverless。** 文档解析和展示全部在浏览器内完成，部署简单，不依赖 Office 服务端、LibreOffice 守护进程或额外转码链路。
- **格式覆盖完整。** 当前内置 194 个扩展名映射，覆盖 Word、Excel、PowerPoint、PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、图片、音频、视频、代码/文本、字体、设计资产和结构化数据，能覆盖绝大多数业务附件场景。
- **按需异步加载。** PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、绘图、Office、EPUB、UMD、Markdown、代码高亮、HLS、HEIC、字体/数据资产渲染器都按需加载，重型解析依赖不会进入其他格式的首屏路径。
- **预览器操作完整。** 内置下载原文件、打印完整渲染结果、导出渲染后 HTML、水印开关、水印 options、主题 options、搜索高亮、上一个 / 下一个命中、行级定位和 AI 友好文本切片；PDF 使用 PDF.js 原生搜索，Word / Markdown / 代码等文本类格式使用通用 DOM 搜索，避免污染 PDF 文本层、canvas 等特殊渲染结构；`theme` 支持 `light`、`dark`、`system`，默认跟随系统，浅色业务 UI 可显式锁定 `light`；打印按钮会按当前格式和渲染链路动态显隐，Word / PDF 使用专属完整页导出适配器，不依赖当前视口，适合合同、归档和审批类场景。
- **集成控制更完整。** 提供加载/卸载生命周期钩子、原生事件回调和按钮前置校验机制，下载、打印、导出前可以接入权限验证、审计确认或业务二次弹窗。
- **阅读体验更像产品。** `.doc`、`.docx`、PDF 都保留灰色工作台、白色纸张、居中阅读和自适应缩放；DOCX 支持可选静态 Web Worker 承载 `docx-preview` 的解析和 HTML 构建，并把同一份 docx-preview HTML 按页面渐进挂载，主线程只负责挂载、缩放和打印适配；PDF 兼容旋转页和页面 / 目录导航，Excel 会尽量还原图片和自动文本色，避免“内容能打开但不好读”的落差。
- **明暗主题有边界。** Demo 外壳、Markdown 和代码预览会适配系统暗色模式；PDF、Word、Excel 等带原始版式的内容保持独立纸张或表格背景，避免全局主题污染文档。
- **Demo 更适合验收。** 示例文件按文档、表格、图纸、代码、图片等类型分组展示，点击样例即可打开并自动收起选择器。
- **独立文档比对入口。** 生产 Demo 额外提供 `/compare.html`，左右并排预览两份文档，支持示例、URL、本地上传、交换、重置、同步滚动、聚焦文档搜索、行级定位和 PDF 工具栏隐藏，不污染主预览入口。
- **各框架体验一致。** core 聚焦底层预览能力，Vue3、Vue2、React、纯 Web、jQuery 和 Svelte wrapper 各自提供原生接入体验，并共享同一套 options、事件、搜索、缩放、打印和导出语义。
- **Docker 一键部署。** 提供 nginx 静态镜像、`Dockerfile` 和 buildx 发布脚本，发布镜像覆盖 `linux/amd64` 与 `linux/arm64`。
- **适合成品交付。** 公开成品仓库、混淆压缩产物、npm tarball、静态部署产物和各生态 wrapper 都一起维护，便于下载、验收和二次接入。

## 支持格式

当前版本内置 194 个扩展名映射，覆盖 23 条预览链路。

| 类别 | 扩展名 | 当前表现 | 适合场景 |
| --- | --- | --- | --- |
| Word | `docx`、`docm`、`dotx`、`dotm` | `docx-preview` + 可选静态 Worker，保留文档结构和版式；模板/宏格式按只读预览处理 | 新生成的 Word 文档、正式文档、Word 模板 |
| Word | `doc`、`dot` | `msdoc-viewer` + Word 风格页面容器，增强 CFB 容错和表格布局 | 历史 `.doc` 老文档、Word 97-2003 模板 |
| 兼容文档 | `rtf`、`odt` | `rtf.js` / ODF `content.xml` 兼容预览 | RTF 富文本、OpenDocument 文本文档 |
| Excel | `xlsx`、`xltx` | `styled-exceljs` + 可选静态 Worker + 虚拟滚动，支持尺寸、合并、常见样式、自动文本色和 workbook drawing 图片；Worker 不可用时回退主线程解析；打印按钮按能力隐藏，避免只打印当前视口 | 需要保留表格结构和样式的业务、Excel 模板 |
| Excel 兼容格式 | `xlsm`、`xlsb`、`xls`、`xlt`、`xltm`、`csv`、`ods`、`fods`、`numbers` | 统一解析，按格式可用信息渐进还原样式；同样遵循虚拟表格打印边界 | 老表格、轻量数据查看 |
| PowerPoint | `pptx`、`pptm`、`potx`、`potm`、`ppsx`、`ppsm`、`odp` | 基于开源 `@aiden0z/pptx-renderer` 浏览幻灯片内容，使用懒加载和窗口化列表优化首屏；ODP 走 OpenDocument 幻灯片文本预览 | 汇报材料、课件、方案、演示模板 |
| PDF | `pdf` | 基于 `pdfjs-dist` 预览，同源 URL 默认渐进读取；服务端支持 Range 时自动分片加载，支持缩放工具栏、旋转页、页侧边栏/目录树侧边栏切换、宽度自适应、完整打印和导出 HTML | 合同、票据、版式成品 |
| OFD | `ofd` | 基于 `DLTech21/ofd.js` 仓库源码在线预览国产版式文档，避开 npm dist 授权 wasm 分支 | 电子发票、公文、归档材料 |
| Typst | `typ`、`typst` | 直接读取 Typst 源文件，按需加载 `@myriaddreamin/typst.ts` 浏览器 WASM 编译器并按页 SVG 渲染；支持完整预览、打印和导出 HTML | 技术报告、论文草稿、工程文档模板 |
| 压缩包 | `zip`、`zipx`、`7z`、`rar`、`tar`、`gz`、`gzip`、`tgz`、`bz2`、`bzip2`、`tbz`、`tbz2`、`xz`、`txz`、`lzma`、`zst`、`tzst`、`cab`、`ar`、`cpio`、`iso`、`xar`、`lha`、`lzh`、`jar`、`war`、`ear`、`apk`、`cbz`、`cbr` | core 共享 archive renderer，基于 `libarchive.js` WASM Worker 读取目录，点击后按需解压内部文件并复用统一预览器，支持 IndexedDB 缓存和体积上限 | 归档附件、批量交付包、压缩包内文档快速查看 |
| 邮件 | `eml`、`msg`、`mbox` | EML/MBOX 使用 `postal-mime`，MSG 使用 `@kenjiuno/msgreader`，支持头信息、HTML/文本正文、附件下载与附件预览 | 邮件归档、工单邮件、客户来信附件 |
| EDA | `olb`、`dra` | 使用 `cfb` 解析 OrCAD/Allegro 常见 CFB 容器，展示结构树、元件/封装/Padstack 候选、属性、诊断和可读字符串；退化时提供安全二进制索引 | 元件库、封装图纸、EDA 附件初筛 |
| CAD | `dwg`、`dxf`、`dwf`、`dwfx`、`xps` | 基于 `@flyfish-dev/cad-viewer` 预览图纸；DWG 通过 Worker + LibreDWG WASM 解析，DXF 使用 JS parser，DWF/DWFx/XPS 使用 native `dwf-viewer` 渲染 W2D/W3D/XPS 图形 | 工程图纸、二维 CAD 附件、AutoCAD 归档文件 |
| 3D 模型 | `glb`、`gltf`、`obj`、`stl`、`ply`、`fbx`、`dae`、`3ds`、`3mf`、`amf`、`usd`、`usda`、`usdc`、`usdz`、`kmz`、`pcd`、`wrl`、`vrml`、`xyz`、`vtk`、`vtp`、`step`、`stp`、`iges`、`igs`、`ifc`、`3dm` | 基于 Three.js 交互预览；工程 CAD/BIM 格式会给出不内置几何内核的原因和转换建议 | 设计模型、点云、三维资产、工程模型 |
| 地理数据 | `geojson`、`kml`、`gpx`、`shp` | `@tmcw/togeojson` / `shpjs` 转 GeoJSON 后离线 SVG 预览 | 地理附件、轨迹、边界和轻量 GIS 数据 |
| Excalidraw | `excalidraw` | 基于官方 `@excalidraw/excalidraw` 的 `restore` + `exportToSvg` 输出只读预览 | 白板草图、流程草稿、产品沟通图 |
| draw.io | `drawio`、`dio` | 基于官方 diagrams.net `GraphViewer` 预览 mxGraphModel / mxfile | 流程图、架构图、业务泳道图 |
| 电子书 | `epub` | 基于 `epubjs` 解析目录和章节资源，使用兼容性更好的滚动阅读 | 电子书、培训手册、长篇阅读材料 |
| 电子书 | `umd` | 按 UMD 移动电子书结构解析元数据、目录和 zlib 压缩正文 | 旧移动电子书、历史小说附件 |
| Markdown | `md`、`markdown` | Markdown 阅读样式，支持明暗主题阅读面 | README、知识文档、说明文档 |
| 图片 | `gif`、`jpg`、`jpeg`、`bmp`、`tiff`、`tif`、`png`、`svg`、`webp`、`avif`、`ico`、`heic`、`heif`、`jxl` | 原生图片浏览；HEIC/HEIF 命中时按需使用 `heic2any` 转换 | 图片附件、设计稿、Logo、移动端照片 |
| 代码/文本 | `txt`、`json`、`jsonc`、`json5`、`ipynb`、`yaml`、`yml`、`toml`、`ini`、`proto`、`hcl`、`tex`、`gv`、`http`、`js`、`mjs`、`cjs`、`jsx`、`ts`、`tsx`、`vue`、`react`、`css`、`html`、`htm`、`xml`、`log`、`java`、`py`、`go`、`rs`、`rb`、`swift`、`kt`、`php`、`c`、`cpp`、`cc`、`h`、`hpp`、`cs`、`sh`、`bash`、`sql`、`diff` | 使用 `highlight.js` 轻量高亮，HTML 按源码展示 | 日志、配置、代码片段、接口响应 |
| 音频 | `mp3`、`mpeg`、`wav`、`ogg`、`oga`、`opus`、`m4a`、`aac`、`flac`、`weba`、`midi`、`mid` | 浏览器原生音频播放；MIDI 使用 `@tonejs/midi` 展示轨道结构 | 录音、播客、语音附件、音效素材、MIDI 文件 |
| 视频 | `mp4`、`webm`、`m3u8` | 浏览器原生视频播放；HLS 清单按需加载 `hls.js` | 演示视频、录屏、HLS 流 |
| 字体/设计/数据 | `ttf`、`otf`、`woff`、`woff2`、`psd`、`ai`、`eps`、`sqlite`、`wasm`、`parquet`、`avro`、`webarchive` | core 共享 data renderer，基于 FontFace、`ag-psd`、`sql.js`、`hyparquet`、`avsc`、WebAssembly Module 和安全摘要；SQLite WASM 支持私有化配置 | 字体、设计资产、数据库、列式数据和 Web 归档 |

## 接入路线

### 1. Vue 3 组件集成

适合已经在 Vue 3 项目里开发，希望最短路径完成接入的团队。Vue3 wrapper 直接使用共享 core 能力，并承担 Vue 生态内的插件安装、组件 props、ref API 和类型出口。

```bash
pnpm add @flyfish-group/file-viewer3
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer3'

createApp(App).use(FileViewer).mount('#app')
```

Vue3 入口会把样式一起带到安装器里，所以这里不需要再额外引入 `dist/file-viewer3.css`。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const url = ref('https://example.com/demo.pdf')
</script>

<template>
  <div style="height: 100vh">
    <file-viewer :url="url" />
  </div>
</template>
```

### 2. Vue 2 组件集成

适合仍在 Vue2.7 技术栈上，希望直接以内嵌组件方式完成接入的团队。Vue2 入口也会自动带上样式，不需要再额外 import CSS。

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
    <file-viewer :url="url" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: 'https://example.com/demo.pdf'
    }
  }
}
</script>
```

### 3. React / 纯 Web 子工程

React 与纯 Web 标准包都走 native controller，直接在业务页面挂载完整预览器。

```bash
npm install @file-viewer/react@2.0.0
npm install @file-viewer/web@2.0.0
```

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="https://example.com/demo.docx"
      />
    </div>
  )
}
```

`@file-viewer/react` 支持 React 17 / 18 / 19，内部使用本包本地 controller 调用 `@file-viewer/core` 与 core browser engine，不依赖纯 Web wrapper。鉴权文件仍建议由宿主系统先下载成 `Blob`，再用 `file` + `name` 交给预览器。资源复制命令仍保留，用于 worker/WASM 和示例资源的自托管分发；标准 wrapper 接入不需要额外的静态页面地址。

本仓库内置了一个wrapper 演示应用，覆盖 React 组件、纯 Web helper、jQuery 和 Svelte 入口。调试时直接运行:

```bash
pnpm dev:wrappers
```

打开本地地址即可验证 React 组件和纯 JS `mountViewer` 的 native 预览效果。验证静态部署产物时运行:

```bash
pnpm build:wrapper-demo
pnpm --filter @flyfish-group/file-viewer-demo preview
```

确认无误后，`apps/wrapper-demo/dist` 可以作为普通静态目录部署；其中包含主 Demo、文档比对入口和示例文件。

### 4. Docker 一键部署

适合内网、私有云、客户现场或希望直接运行完整 Demo 的场景。镜像发布后可直接运行:

```bash
docker run -d \
  --name flyfish-viewer \
  --restart unless-stopped \
  -p 8080:80 \
  flyfishdev/file-viewer:2.0.0
```

访问:

- 主预览: `http://localhost:8080/`
- 文档比对: `http://localhost:8080/compare.html`

源码仓库内也提供 `Dockerfile`，本地构建运行:

```bash
pnpm docker:build
docker run --rm -p 8080:80 flyfishdev/file-viewer:2.0.0
```

## 使用说明

- 组件支持两条主要输入路径: `url?: string` 与 `file?: File`
- 独立文档比对页位于 `/compare.html`，可通过 `?left=/example/test.doc&right=/example/word.docx` 预置左右文件；它支持同步滚动、当前聚焦文档的浮层搜索、高亮命中、上一个 / 下一个、行级定位和 PDF 工具栏隐藏，但只做视觉并排预览，不做语义 diff，完整说明见 [Demo 文档](docs/guide/demo.md#文档比对页)
- 当 `file` 和 `url` 同时存在时，会优先渲染 `file`
- 如果业务侧拿到的是 `Blob` 或 `ArrayBuffer`，推荐先包装成带扩展名的 `File`
- 预览器会填满父容器，请为父容器提供稳定高度
- 使用 `url` 预览时，目标资源需要允许浏览器访问；跨域场景下需要正确配置 CORS
- 如果下载地址本身没有明确扩展名，建议先在业务侧取回文件，再包装成 `File`
- PPTX 渲染器会尽量还原常见组合图形、旋转/翻转、主题背景、图片裁剪和 EMF 矢量图片；复杂 Office 特效仍建议用真实业务文件做回归
- OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、绘图、EPUB、UMD、PDF、Office、Markdown、音视频、HLS、HEIC、字体/数据资产和代码高亮渲染器都按需异步加载，只有命中格式时才拉取对应代码块；Typst compiler / renderer WASM 可通过 `options.typst.compilerWasmUrl`、`options.typst.rendererWasmUrl` 指向自托管地址，默认仅在打开 `.typ` / `.typst` 时加载
- `options.archive` 一般只需要配置 `cache`、`workerTimeoutMs` 和体积上限；预览器会先尝试当前部署 base 下的 `vendor/libarchive/worker-bundle.js`。手机 WebView、本地临时服务器、MIME 或 CSP 导致 Worker 初始化超时时，会继续降级到 ZIP/TAR/GZIP 兼容模式，避免压缩包一直停在 loading。只有静态目录、CDN 路径或 WASM 位置特殊时，才需要显式传 `archive.workerUrl` / `archive.wasmUrl`
- `options.theme` 支持 `light`、`dark`、`system`，默认继续跟随系统；`options.docx.worker` 默认开启，会优先尝试 `options.docx.workerUrl` 或当前部署 base 下的 `vendor/docx/docx.worker.js`，让 DOCX 在 Worker 内用 `docx-preview` 构建 HTML；`options.spreadsheet.workerUrl` 可覆盖 Excel/XLSX 静态 Worker，默认路径是 `vendor/xlsx/sheet.worker.js`，Worker 不可用时会自动回退主线程解析；`options.pdf.workerUrl` 可覆盖 PDF.js Worker，适合内网、离线或 CSP 较严的私有化部署；`options.docx.progressive` 默认开启，把 docx-preview 页面按批次挂载以便先看到内容；CSP、低版本浏览器或静态 worker 路径不可用时可设为 `worker: false` 或依赖自动兜底回退原生主线程渲染；`options.watermark` 支持文字或图片水印；`options.toolbar` 可控制下载原文件、打印完整渲染结果、导出 HTML、统一缩放按钮和操作栏位置，`toolbar.zoom` 可单独控制缩放按钮显示，`toolbar.position` 支持 `auto`、`top`、`bottom-right`，PDF 默认悬浮到右下角以避开自身导航栏；统一缩放通过渲染器内部 provider 适配 PDF、Word、PPTX、Excel 虚拟表格、图片、CAD、OFD、Typst、Markdown、代码和绘图等链路，避免业务侧外层 CSS 缩放造成表格坐标或 canvas 交互偏移；`options.pdf.toolbar` 可隐藏 PDF 自身页码缩放工具栏；`options.search` 可控制搜索高亮、整词/大小写和命中数量；`options.ai` 可开启文本切片结构，返回行号、页码、锚点和 label 等溯源字段，便于业务侧做向量化、召回、AI 摘要、高亮回填和来源定位；`options.hooks` 可接收加载/卸载生命周期；`options.beforeOperation` 可在下载、打印、导出和缩放前做权限校验；打印按钮会结合当前文件类型、渲染完成状态和导出适配器动态显隐，Word / PDF 会生成完整页面，Excel 等虚拟表格会隐藏打印按钮，避免只打印当前视口或第一页

```ts
const blob = await response.blob()
const file = new File([blob], 'contract.pdf', { type: blob.type })
```

## 本地开发

下面的命令适用于源码开通后的完整项目。公开 GitHub / Gitee 成品仓库不包含源码目录，普通用户建议直接通过 npm、`dist/` 或 `artifacts/` 里的 tarball 使用。

```bash
pnpm install
pnpm dev
```

常用脚本:

- `pnpm build`: 构建示例站点
- `pnpm build:vue3`: 构建 Vue3 标准 wrapper 包产物
- `pnpm docs:dev`: 启动 VitePress 文档站
- `pnpm docs:build`: 构建文档站
- `pnpm type-check`: 执行 TypeScript 类型检查
- `pnpm dev:wrappers`: 启动 React + 纯 JS wrapper Demo
- `pnpm build:wrapper-demo`: 构建 wrapper Demo
- `pnpm docker:build`: 构建本机架构 Docker 镜像
- `pnpm docker:publish`: 推送 Docker Hub `linux/amd64` / `linux/arm64` 多架构镜像；可通过 `DOCKER_IMAGE` 替换命名空间
- `pnpm release:ecosystem:list`: 列出当前完整生态 npm 发布目标
- `pnpm release:ecosystem:pack`: 构建并打包 core、标准 wrapper 和历史兼容 npm tarball

## 打包发布

Vue3 和 Vue2 发包时分别在对应分支执行同一套发布链路:

| 包 | 分支 | npm 名称 |
| --- | --- | --- |
| Vue3 | `v3` | `@flyfish-group/file-viewer3` |
| Vue2.7 | `v2` | `@flyfish-group/file-viewer` |
| Core | `v3` | `@file-viewer/core` |
| React | 当前仓库子工程 | `@file-viewer/react` / `@flyfish-group/file-viewer-react` |
| 纯 JS | 当前仓库子工程 | `@file-viewer/web` / `@flyfish-group/file-viewer-web` |
| 其他 wrapper | 当前仓库子工程 | `@file-viewer/vue2.7` / `@file-viewer/vue2.6` / `@file-viewer/react-legacy` / `@file-viewer/jquery` / `@file-viewer/svelte` |

建议在发布前执行下面这组命令:

```bash
pnpm type-check
pnpm build
pnpm build:vue3
pnpm obfuscate
pnpm docs:build
pnpm release:ecosystem:pack
```

其中:

- `dist/` 是主 Demo 和根部署产物；执行 `pnpm obfuscate` 后会对其中的 `.js` / `.mjs` 进行压缩混淆
- `pnpm build` 会生成可独立部署的 Demo 静态站点产物
- `docs/.vitepress/dist/` 是文档站静态产物
- `npm pack` 会生成可直接发布或分发的 npm 包 tarball

如果只是准备 npm 包，可以直接执行:

```bash
pnpm release:ecosystem:pack
```

完整生态包发布前执行:

```bash
pnpm type-check:wrappers
pnpm build:wrapper-demo
pnpm release:ecosystem:list
pnpm release:ecosystem:pack
pnpm release:ecosystem:publish:dry-run
pnpm release:ecosystem:publish
```

发布到 npm:

```bash
npm publish --dry-run --access public
npm publish --access public
```

如果 npm 账号启用了 MFA，请使用交互式终端完成浏览器确认后再等待发布结果。

公开 GitHub / Gitee 成品仓库只提交可直接使用的构建产物、Demo、文档站、示例文件和 npm tarball，不提交当前源码目录。为避免 Gitee 因历史二进制膨胀超过 1GB，同步 Gitee 时会使用最新完整成品快照的干净历史，而不是把多轮构建产物历史全部带过去。需要源码、二开包或商业自助开通的用户，可以前往 [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)，请我们喝杯柠檬水后按页面提示自助开通。

## 文档导航

- [文档导览](https://doc.flyfish.dev/guide/)
- [快速开始](https://doc.flyfish.dev/guide/quickstart)
- [Demo 说明](https://doc.flyfish.dev/guide/demo)
- [组件用法](https://doc.flyfish.dev/guide/usage)
- [支持格式](https://doc.flyfish.dev/guide/formats)
- [本地开发与打包](https://doc.flyfish.dev/guide/development)
- [Docker 部署](https://doc.flyfish.dev/guide/docker)

## 开源说明

本项目使用 `Apache-2.0` 许可证。

二开或商用时，请按许可证要求保留版权、许可证和来源说明，并注明项目来源为 Flyfish Viewer / `@flyfish-group/file-viewer3` 或 `@flyfish-group/file-viewer`。如果你基于本项目修复了通用问题或增强了通用能力，也欢迎通过 issue / PR 一起贡献回来，让这套预览能力继续变得更稳。

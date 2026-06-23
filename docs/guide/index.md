# 文档导览

<div class="doc-kicker">Start From The Right Door</div>

<p class="doc-lead">
  Flyfish Viewer 官方文档同时承担组件主页、接入手册和开源分发说明。
  文档围绕真实交付路径组织: 先确认支持格式和 Demo 表现，再选择 Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery 或 Svelte 原生接入，最后了解安装、私有化部署和开源分发。
</p>

<div class="doc-link-row">
  <a href="https://doc.file-viewer.app" target="_blank" rel="noreferrer">官方文档</a>
  <a href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">在线 Demo</a>
  <a href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub 开源总仓库</a>
  <a href="https://gitee.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">Gitee 开源总仓库</a>
  <a href="/guide/quickstart">快速开始</a>
  <a href="/guide/ecosystem">生态接入</a>
  <a href="/guide/formats">支持格式</a>
  <a href="/guide/format-fidelity">格式完整度</a>
  <a href="/guide/on-demand-renderers">按需渲染架构</a>
  <a href="/guide/usage">组件用法</a>
  <a href="/guide/distribution">发布分发</a>
</div>

## 优秀之处

<div class="doc-grid">
  <div class="doc-card">
    <h3>纯前端 Serverless</h3>
    <p>主要解析和渲染工作在浏览器完成，减少后端转码服务、临时文件和任务队列带来的维护成本。</p>
  </div>
  <div class="doc-card">
    <h3>覆盖真实附件场景</h3>
    <p>内置 206 个扩展名映射和 24 条预览链路，覆盖 Office、PDF、OFD、Typst、XMind 脑图、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、Excalidraw、draw.io、Mermaid、PlantUML、EPUB、UMD、Markdown、代码/文本、Git patch/bundle、图片、音视频、字体、PSD 图层资产和结构化数据。</p>
  </div>
  <div class="doc-card">
    <h3>按需加载更轻</h3>
    <p>OFD、Typst、XMind、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、绘图、PDF、Office、Markdown、HLS、HEIC、字体/数据资产和代码高亮链路按格式异步加载，避免所有解析器一次性进入首屏。</p>
  </div>
  <div class="doc-card">
    <h3>阅读体验更完整</h3>
    <p>Word 保留白色纸张和灰色页面底，PDF 支持缩放、导航窗格和宽度自适应，打开后默认就是可读状态。</p>
  </div>
</div>

## 推荐阅读顺序

<div class="doc-grid">
  <div class="doc-card">
    <h3>先看 Demo</h3>
    <p>在线 Demo 和私有化 Demo 都提供按文件类型分组的样例文件盒子，点击样例即可打开并自动收起选择器，适合快速验收全部格式。</p>
  </div>
  <div class="doc-card">
    <h3>确认格式边界</h3>
    <p>支持格式页列出当前注册的 206 个扩展名、24 条渲染链路和真实业务里的适用边界。</p>
  </div>
  <div class="doc-card">
    <h3>选择接入方式</h3>
    <p>Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery 和 Svelte 都有独立标准包；各包只依赖 core 和自身生态依赖，适合私有化部署和多系统复用。</p>
  </div>
  <div class="doc-card">
    <h3>准备发布分发</h3>
    <p>开源分发说明了 npm 包、私有化 Worker/WASM viewer assets、文档静态产物和开源总仓库之间的交付关系。</p>
  </div>
</div>

## 当前重点能力

- Word 视图保留灰色阅读底和白色文档面，`.docx` 会按当前可用宽度自适应缩放，并默认使用真实浏览器 DOM 连续流式渲染以保护目录、制表符、长表格和复杂样式；确实需要页式效果时可按需开启视觉分页。
- PPTX 视图已切换到独立开源的 `@file-viewer/pptx` 原生引擎，增强组合图形坐标映射、旋转/翻转、主题背景、图片裁剪和 EMF 矢量图预览，更适合回看真实汇报模板。
- PDF 视图支持宽度自适应、缩放工具栏、页码状态和可显隐导航窗格；Word / PDF 打印使用专属完整页适配器，其他格式按能力动态显隐打印按钮。
- OFD 使用 `DLTech21/ofd.js` 的浏览器端解析和渲染能力，并保持按需异步加载。
- 压缩包使用 `libarchive.js` Worker 读取目录，点击内部文件后按需解压、缓存并继续复用统一预览器。
- EML / MSG / MBOX 邮件支持头信息、HTML/文本正文、附件下载和附件继续预览。
- OLB / DRA / GDSII / OASIS 由 `@file-viewer/renderer-eda` 独立承接；GDSII 可生成 SVG / WebGL 快速版图，OASIS 文本夹具可生成 SVG，真实二进制 OASIS / Cadence 高保真几何保留独立 WASM 内核路线。
- CAD 使用 `@flyfish-dev/cad-viewer`，支持 DWG / DXF / DWF / DWFx / XPS；DWG 通过 Worker + LibreDWG WASM 按需解析，DWF/DWFx/XPS 通过 native renderer 渲染，避免阻塞主线程。
- 地理数据支持 GeoJSON、KML、GPX 和 SHP，按需转为 GeoJSON 后用离线 SVG 地图预览边界、轨迹和点位。
- 3D 模型走 `@file-viewer/renderer-3d` + Three.js loaders，支持 GLTF/GLB、OBJ、STL、PLY、FBX、DAE、3DS、3MF、AMF、USD/USDZ、KMZ、PCD、VRML/WRL、XYZ、VTK/VTP 等常见浏览器渲染格式。
- Excalidraw 使用官方 `@excalidraw/excalidraw` 导出 SVG，draw.io 默认走随 viewer assets 分发的官方 diagrams.net 离线 viewer，Mermaid 走官方 `mermaid` SVG 渲染，PlantUML 默认离线源码预览，也可配置自托管 SVG 服务；这些绘图链路都支持拖拽平移和统一缩放。
- EPUB 使用 `epubjs` 提供目录和滚动阅读，UMD 作为电子书格式解析目录和压缩正文，音频使用浏览器原生播放器打开，MIDI 会展示轨道和时长信息，HLS 视频按需加载 `hls.js`。
- 代码和文本由 `@file-viewer/renderer-text` 使用 `highlight.js` 轻量高亮，覆盖 JSONC、JSON5、Notebook、TOML、Proto、HCL、TeX、Graphviz、HTTP、Ruby、Swift、Kotlin 等常见工程文本；patch 会进入左右比对视图，git bundle 会展示 refs、历史记录、文件树和可读文件内容；HTML 会按源码展示。
- 字体、PSD、AI/EPS、SQLite、WASM、Parquet、Avro 和 WebArchive 走 `@file-viewer/renderer-data` 独立资产/数据预览链路，优先展示结构摘要、字体样张、图层或数据预览，不执行不可信内容。
- 独立文档比对入口 `/compare.html` 支持两侧示例、URL、本地上传、交换、重置、同步滚动、聚焦文档浮层搜索和行级定位，适合上线前核对两份附件的视觉差异。

## 常用入口

| 你要做什么 | 推荐页面 |
| --- | --- |
| 想最快跑起来 | [快速开始](/guide/quickstart) |
| 想确认所有格式 | [支持格式](/guide/formats) |
| 想确认复杂格式能否完整预览 | [格式完整度](/guide/format-fidelity) |
| 想降低安装依赖和首屏体积 | [按需渲染架构](/guide/on-demand-renderers) |
| 想看示例文件和回归建议 | [Demo 说明](/guide/demo) |
| 想并排比对两份文件 | [Demo 说明: 文档比对页](/guide/demo#文档比对页) |
| 想在非框架页面中接入 | [纯 JS / Pure Web 集成](/guide/quickstart-web) |
| 想在 Vue 3 中接入 | [Vue3 集成](/guide/quickstart-vue3) |
| 想在 Vue2.7 中接入 | [Vue2 集成](/guide/quickstart-vue2) |
| 想在 React 中接入 | [React 集成](/guide/quickstart-react) |
| 想在 Svelte 中接入 | [Svelte 集成](/guide/ecosystem#svelte) |
| 想在 jQuery 老后台中接入 | [jQuery 集成](/guide/ecosystem#jquery) |
| 想基于 core 自研组件 | [Core 自定义接入](/guide/ecosystem#core) |
| 想单独使用 PPTX 渲染引擎 | [PPTX 引擎接入](/guide/ecosystem#pptx) |
| 想了解统一 options 和事件 | [组件用法](/guide/usage) |
| 想了解参数和事件 | [组件用法](/guide/usage) |
| 想下载源码、release 或了解支持 | [发布与开源分发](/guide/distribution) |

<div class="doc-note">
  如果你只是想快速判断项目是否适合业务，建议先打开 <a href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">demo.file-viewer.app</a> 或运行仓库内置 Demo，再用自己的真实附件补一轮回归。Vanilla JS / Pure Web、React、jQuery 和 Svelte 组件会在业务页面中原生挂载，不依赖官网 Demo。
</div>

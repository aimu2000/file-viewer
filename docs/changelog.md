# 更新日志

这份日志记录的是当前仓库主线中，对外最值得说明的能力演进。

## 当前主线

### `v2.0.0` 架构重构与全生态 2.x 起始版本

- 全线 npm 包、workspace 依赖、Docker 镜像和开源 release 包从 `2.0.0` 重新起步，用大版本号明确标识 core / component 架构重构带来的兼容边界变化
- `@file-viewer/core` 继续保持纯 TypeScript、框架无关的底层能力包；Vue3、Vue2.7、Vue2.6、React、React Legacy、Pure Web、jQuery、Svelte 等标准组件包只依赖 core，各自提供原生集成体验
- 清理旧独立页面实现和历史过渡口径，对外文档统一强调原生组件与纯 Web API 是核心集成路径
- 开源总仓库产物命名切换为 `file-viewer-v2-*`，同时发布 2.x npm tarball、Demo、Component Demo、文档站静态产物和库 dist 包，避免继续暴露旧 `file-viewer-v3-*` 产物线
- 文档、README、分发说明、Docker 部署说明和生态验收清单同步刷新到 2.x 版本口径，后续新增能力都在 2.x 线上连续演进

### 当前主线 统一缩放工具栏

- `options.toolbar.zoom` 新增统一缩放按钮显示控制，默认开启；按钮是否真正展示仍由当前渲染链路的内部缩放 provider 决定，避免对虚拟表格、canvas、PDF 文本层和 CAD 交互做宿主级 CSS 强缩放
- 组件 ref 新增 `zoomIn()`、`zoomOut()`、`resetZoom()` 和 `getZoomState()`，外部自定义工具栏可以通过标准 API 控制缩放；`operation-availability-change` 同步返回 `zoom`、`zoomIn`、`zoomOut` 和 `zoomReset`，`zoom-change` 回传最终比例文本
- PDF、DOCX、PPTX、Excel 虚拟表格、图片、CAD、OFD、Typst、Markdown、代码和 Excalidraw / draw.io 绘图链路接入渲染器内部缩放逻辑；缩放操作同样进入 `options.beforeOperation` / `toolbar.beforeOperation` 前置校验

### `v1.0.26` Vue3 npm 入口类型声明修复版本

- 修复 `@flyfish-group/file-viewer3@1.0.25` 在发布前被 Demo 构建覆盖 `dist` 后，npm 包缺少 `dist/src/package/index.d.ts`，导致 TypeScript 项目出现 `TS2307: Cannot find module '@flyfish-group/file-viewer3' or its corresponding type declarations` 的问题
- Vue3 标准组件包 使用包内 `prepublishOnly` 发布前保护，根包只保留 monorepo 编排脚本，阻止 Demo HTML 产物误进入组件库 npm 包
- 非 scoped 包 `file-viewer3` 同步发布 `1.0.26`，继续作为 `@flyfish-group/file-viewer3` 的兼容 alias 使用；开源总仓库只保留一份 scoped v3 tarball，避免重复占用存储
- 支持格式矩阵补齐到 194 个扩展名、23 条预览链路，新增 RTF/ODT/ODP、MBOX、GeoJSON/KML/GPX/SHP、AVIF/ICO/HEIC/HEIF/JXL、WEBM/M3U8、MIDI、JSONC/JSON5/IPYNB/TOML/Proto/HCL/TeX/Graphviz/HTTP/Ruby/Swift/Kotlin/React 片段，以及字体、PSD、AI/EPS、SQLite、WASM、Parquet、Avro、WebArchive 等资产/数据预览入口

### `v1.0.25` 移动端压缩包与表格体验修复版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.25`、Vue2 包 `@flyfish-group/file-viewer@1.0.25`、React 包 `@flyfish-group/file-viewer-react@1.0.25` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.25` 继续保持连续版本
- 压缩包预览迁移为 core 共享 archive renderer，并保留 Worker 探测、初始化超时、静态 Worker/WASM 路径和 ZIP/TAR/GZIP 兼容模式；手机 WebView、本地临时服务器、MIME 或 CSP 导致 `libarchive.js` Worker 卡住时，会自动降级，避免一直停留在 loading
- `options.archive` 新增 `wasmUrl` 和 `workerTimeoutMs` 说明；普通私有化部署不再需要写死 `workerUrl`，只有静态目录或 CDN 路径特殊时才需要显式指定
- 移动端 Excel / XLS 预览把工作表名称移到表格上方的横向可滚动标签栏，当前工作表自动滚入可见区域，解决手机上 sheet 名称藏在底部角落、需要技巧才能看到的问题
- README、文档站、React / 纯 JS 接入文档、开源 release 包和 workspace 依赖同步刷新到 `1.0.25`

### 当前主线 Demo 富样式公开样例升级

- DOCX 渲染链路下沉到 `@file-viewer/core`，移除 Vue3 本地 Word vendor 入口；所有标准组件包 共享同一套 `docx-preview` 页面渲染、渐进挂载、缩放 provider、打印和 HTML 导出适配器
- DOCX Worker 新增 `options.docx.workerUrl` 与 `options.docx.workerTimeout` 兜底，默认尝试当前部署 base 下的 `vendor/docx/docx.worker.js`，静态资源不可用、CSP/MIME 不兼容或超时后会自动回到同一套 `docx-preview` 原生主线程渲染，避免线上预览永久停留在 loading
- CAD 渲染器保持在 `@flyfish-dev/cad-viewer` 0.6.4，支持 DWG / DXF / DWF / DWFx / XPS 统一预览；DWG 默认通过独立 Worker 加载 LibreDWG WASM，DWF/DWFx/XPS 使用 native renderer 渲染 W2D/W3D/XPS 图形
- 构建脚本会复制 `libredwg-web.js`、`libredwg-web.wasm`、`dwfv-render.wasm`、`dwg-worker.js` 和 worker 依赖 chunk 到 viewer assets 的 `wasm/cad/`
- Demo 补充 Apache Tika `blocks_and_tables.dwf` 与 Autodesk 官方 Viewer 教程的 `House.dwfx`、`RobotArm1.dwfx` 样例，用于分别验证 DWF、DWFx/XPS、W2D/W3D native renderer 和大图纸按需加载体验
- 入口组件在挂载重型渲染器前先释放浏览器绘制帧，确保 Loading 先显示，减少用户误以为页面无响应
- `word.docx` 保持 Basel Convention 公开中文正式文档，覆盖长正文、标题层级、表格、图示、白色纸张和完整打印回归，避免默认 Demo 使用临时生成或过度病态的样例文件
- `ppt.pptx` 替换为 `hcp4715/R4Psy` 的 CC-BY-4.0 中文课程课件，覆盖多页幻灯片、主题背景、图片资源、组合元素和富文本排版
- `archive.zip` 与 `archive.tar.gz` 内部 DOCX 同步更新为当前公开中文 Word 样例，压缩包内继续预览时也能验证真实文档效果
- 示例来源表、Demo 文档和公开样例 README 同步刷新，避免继续把 Word / PPT 误写成临时生成的 Demo 文件

### 当前主线 文档比对、搜索定位和 AI 友好结构增强

- 文档比对页同步滚动改为绑定真实预览滚动容器，并按 scroll ratio 同步左右滚动位置，PDF 内部滚动层、Word 外层滚动层和文本预览都走同一套逻辑
- 文档比对页搜索改为当前聚焦文档的浮层交互，配合成熟图标按钮提供关键词搜索、高亮命中、上一个 / 下一个；避免顶部工具区拥挤，也避免左右两侧同时滚动导致视线丢失
- 文档比对页继续提供行级定位；搜索、定位和文本切片结果会返回行号、页码和锚点上下文，便于业务侧做审计与溯源
- 新增 `options.pdf.toolbar`，可在左右比对等紧凑场景隐藏 PDF 自身页码、缩放、旋转工具栏，避免 PDF 比其他格式多一条顶部导航导致正文错位
- 新增 `options.search`、`searchDocument()`、`clearDocumentSearch()`、`nextSearchResult()`、`previousSearchResult()`、`getSearchState()` 等通用搜索 API；PDF 等特殊渲染器可注册原生搜索提供器，避免通用 DOM 高亮污染文本层或 canvas
- 新增 `collectDocumentAnchors()`、`scrollToLine()`、`scrollToAnchor()` 和 `getDocumentTextChunks()`，预览器只提供锚点、文本切片和溯源上下文，不绑定具体 AI 服务，业务侧可基于它做向量化、召回、高亮和来源定位
- 主 Demo 和文档比对 Demo 的搜索浮层统一改用成熟图标按钮，公开文档同步补充文档比对页、搜索定位、PDF 工具栏隐藏、AI 友好结构和溯源定位说明

### `v1.0.24` CAD native renderer 与构建产物同步版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.24`、Vue2 包 `@flyfish-group/file-viewer@1.0.24`、React 包 `@flyfish-group/file-viewer-react@1.0.24` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.24` 继续保持连续版本
- CAD 渲染器升级到 `@flyfish-dev/cad-viewer@0.6.2`，DWG / DXF / DWF / DWFx / XPS 统一走成熟 CAD viewer；DWF/DWFx/XPS 使用 `dwf-viewer@0.6.4` native renderer 解析 W2D/W3D/XPS 图形
- 构建脚本新增复制 `dwfv-render.wasm`，与 `libredwg-web.js`、`libredwg-web.wasm`、`dwg-worker.js` 和 worker 依赖 chunk 一起进入 `wasm/cad/`，私有化部署可通过 `options.cad.dwfWasmUrl` 覆盖路径
- 压缩包和邮件附件的嵌套预览同步识别 `dwf`、`dwfx`、`xps`，避免主入口支持 CAD 五类格式而附件链路覆盖不足
- Demo 图纸分组补充 Apache Tika `blocks_and_tables.dwf` 以及 Autodesk 官方 Viewer 教程的 `House.dwfx`、`RobotArm1.dwfx` 样例，便于验证 DWF、DWFx/XPS、多页结构、W2D/W3D 图形、视图适配和按需加载体验
- README、文档站、React / 纯 JS README、入口缓存策略、开源 release 包和 workspace 依赖同步刷新到 `1.0.24`

### `v1.0.22` PPTX 兼容性修复与连续发布版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.22`、Vue2 包 `@flyfish-group/file-viewer@1.0.22`、React 包 `@flyfish-group/file-viewer-react@1.0.22` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.22` 继续保持连续版本
- 修复部分客户 PPTX 无法打开的问题，兼容缺少 `docProps/app.xml` 的演示文稿，默认按现代 Office 版本降级解析
- PPTX OpenXML 关系解析改为通用路径解析，支持 relationship 单对象 / 数组 / 缺失三种形态，并按 `presentation.xml` 真实 slide 顺序渲染
- 增强 slide / layout / master / theme / diagram 关系读取容错，缺失可选部件时降级渲染当前页内容，不再因空指针导致整份 PPTX 白屏
- README、文档站、React / 纯 JS README、入口缓存策略、开源 release 包和 workspace 依赖同步刷新到 `1.0.22`

### `v1.0.21` Docker Hub 仓库与格式边界校准版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.21`、Vue2 包 `@flyfish-group/file-viewer@1.0.21`、React 包 `@flyfish-group/file-viewer-react@1.0.21` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.21` 继续保持连续版本
- 清理 `.wps`、`.wpt`、`.et`、`.ett`、`.dps`、`.dpt` 等当前没有开箱即用浏览器渲染方案的 WPS 原生格式说明，避免用户误以为这些格式已经完整支持
- Office 模板和宏格式继续按实际可渲染链路保留，包括 `dot`、`dotx`、`dotm`、`docm`、`xlt`、`xltx`、`xltm`、`pptm`、`potx`、`potm`、`ppsx`、`ppsm`
- 新增 Docker Hub 仓库创建脚本，支持用 Docker Hub API 创建 `flyfishdev/file-viewer` 公开仓库，并在异常时输出更明确的安全诊断信息
- 文档站补全文档比对页使用说明，明确 `/compare.html`、`left` / `right` 预置参数、内置示例、URL、本地上传、同步滚动、私有化部署路径和视觉比对边界
- 开源总仓库新增 Gitee 镜像 `gitee.com/flyfish-dev/file-viewer`，GitHub / Gitee 同步交付混淆构建产物、Demo、文档静态产物、示例文件和 tarball
- Demo 输出校验继续覆盖 `compare.html`、主入口资源、viewer 资源目录和示例资源，避免上线缺少独立比对入口
- 文档站新增 Cloudflare Pages Direct Upload 脚本和 `docs/public/_headers` 缓存策略，`doc.flyfish.dev` 可切换到 `flyfish-file-viewer-docs.pages.dev` 以改善国内访问速度
- 新增 `options.theme`，支持 `light`、`dark`、`system`；显式主题优先于浏览器 `prefers-color-scheme`，固定浅色业务 UI 可以传 `light` 避免 Markdown、代码、Typst 等预览区域被系统暗色模式带偏
- 新增 `toolbar.position`，支持 `auto`、`top`、`bottom-right`；默认 `auto` 下 PDF 通用下载/打印/HTML 操作栏会悬浮到右下角，避免和 PDF 页码、缩放、目录导航栏形成双顶部导航
- 升级 Vue、Vite、PDF.js、Axios、Marked、React 适配层等第三方依赖到当前 npm latest；`docx-preview` 已确认 npm latest 仍为 `0.3.7`，同步刷新 DOCX 构建 chunk
- DOCX 渲染关闭生产调试告警，兼容 Word 写入的 `autoSpaceDN` / `autoSpaceDE` 等段落属性，避免控制台被 `DOCX: Unknown document element` warning 刷屏
- README、文档站、React / 纯 JS README、入口缓存策略和 workspace 依赖同步刷新到 `1.0.21`

### `v1.0.20` Typst 直读源文件与边缘部署优化版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.20`、Vue2 包 `@flyfish-group/file-viewer@1.0.20`、React 包 `@flyfish-group/file-viewer-react@1.0.20` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.20` 统一推进到连续版本
- Typst 严格直读 `.typ` / `.typst` 源文件并以轻量代码视图展示，禁止依赖 sidecar 或预编译 PDF，保证用户上传源码后即可直接查看
- PDF 远端 URL 加载链路新增渐进读取策略: 同源 PDF 默认直接交给 PDF.js 通过 URL 读取，服务端支持 Range 时自动分片加载，避免先整包下载 Blob 后才开始建页；跨域 URL 默认保持旧的兼容下载链路
- 新增 `options.pdf.streaming`、`options.pdf.rangeChunkSize` 和 `options.pdf.withCredentials`，可按业务文件服务能力控制 PDF 渐进读取、Range 分片大小和凭据策略
- 下载按钮支持 URL 源文件回退，流式 PDF 没有预下载 buffer 时也可以触发原始文件下载
- 新增 Cloudflare Pages Direct Upload 部署脚本、`wrangler.toml` 和 `_headers` 缓存策略，便于将 Demo 切到 Cloudflare 边缘网络并保持 `viewer.flyfish.dev` 域名不变
- 新增独立文档比对入口 `/compare.html`，支持左右并排预览、示例选择、URL、本地上传和同步滚动，不污染主预览入口
- 新增 Dockerfile、nginx 静态运行配置和 buildx 发布脚本，发布镜像覆盖 `linux/amd64` 与 `linux/arm64`，用于一键部署 Demo 与比对页
- 新增 Office 模板兼容入口，覆盖 `dot`、`dotx`、`dotm`、`docm`、`xlt`、`xltx`、`xltm`、`pptm`、`potx`、`potm`、`ppsx`、`ppsm`

### `v1.0.19` 页面尺寸感知打印与入口组件瘦身版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.19`、Vue2 包 `@flyfish-group/file-viewer@1.0.19`、React 包 `@flyfish-group/file-viewer-react@1.0.19` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.19` 统一推进到连续版本
- PDF 打印会按真实页面 CSS 尺寸生成完整高保真页图，并通过 `@page size` 固定输出纸张大小，避免导航窗格、视口宽度或缩放状态导致页面被挤压、裁切或只打印当前页
- DOCX / DOC 打印保留白色纸张和文档页尺寸，导出窗口只包含主体页面，避免把 Demo 外壳、工具栏、滚动容器或预览缩放带入打印结果
- 新增 `printStyle` 渲染适配器能力，PDF、DOCX、DOC 等有真实页面尺寸的格式可以按文件自身尺寸输出打印样式，后续格式可复用同一机制
- 将下载、打印、导出 HTML 的实现从 `FileViewer.vue` 抽离到 `useViewerExport` 和导出模板 helper，入口组件回归预览状态、生命周期和操作可用性的单一职责
- 补充打印页尺寸与导出模板单测，并同步刷新文档站、README、Demo 示例版本、开源 release 包和 npm 版本说明到 `1.0.19`

### `v1.0.18` 公开 issue 修复与真实 PDF 示例版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.18`、Vue2 包 `@flyfish-group/file-viewer@1.0.18`、React 包 `@flyfish-group/file-viewer-react@1.0.18` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.18` 统一推进到连续版本
- 修复 GitHub issue #13: PDF 旋转页与导航配置兼容性增强，新增 `options.pdf.navigation` 和 `options.pdf.defaultNavigationVisible`，继续保持页侧边栏 / 树形目录侧边栏切换
- 修复 GitHub issue #9 与 #8: Excel 自动文本色更可靠，支持 workbook drawing 图片渲染，并按渲染链路隐藏不可靠的打印 / 导出入口
- 修复 GitHub issue #4: `.doc` 表格布局和单元格可读性增强，老 Word 文档在白色纸张容器里更接近实际阅读效果
- 修复 GitHub issue #1: `.doc` 的 `msdoc-viewer` CFB 局部 sector 容错改为包管理器无关的 `scripts/patch-msdoc-viewer.mjs`，npm / pnpm / yarn 安装后都可在构建前自动应用
- Demo PDF 替换为项目方提供的 13 页《PDF沉浸式翻译技术说明》，用于验证长文档阅读、缩放、页导航、树形目录、完整打印和 HTML 导出
- 文档站、README、集成说明、示例来源、开源 release 包和 npm 版本说明同步刷新到 `1.0.18`

### `v1.0.17` 打印能力矩阵与完整页打印版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.17`、Vue2 包 `@flyfish-group/file-viewer@1.0.17`、React 包 `@flyfish-group/file-viewer-react@1.0.17` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.17` 统一推进到连续版本
- PDF 导航窗格继续完善“页面 / 目录”切换，目录模式支持树形层级、展开折叠和定位跳转，便于用户在长文档中快速预览
- Word、DOC 和 PDF 预览统一增强打印 / HTML 导出，专属导出适配器会移除预览缩放、滚动容器和 Demo 全局布局样式，避免只打印一页或页面被截断
- 新增打印能力动态判断，表格、压缩包、邮件、EPUB、音视频、3D 等不适合直接打印的渲染链路会自动隐藏打印按钮，避免用户进入错误打印流程
- 优化 Demo 暗色模式和 Markdown 阅读面，Markdown / 代码跟随系统主题，PDF / Word / Excel 等原始版式内容保持独立显示；同时替换更丰富的 DOCX / PDF / Markdown 示例并同步压缩包样例
- 新增文档加载、卸载生命周期钩子，以及下载、打印、导出 HTML 的按钮前置校验钩子，历史适配层同步透出事件和操作能力变化
- 文档站、README、集成说明、分发说明和开源 release 包说明同步刷新到 `1.0.17`

### `v1.0.15` 预览交互、打印与集成钩子增强版本

- PDF 导航窗格新增“页面 / 目录”切换，目录模式会读取 PDF 大纲并以可展开树形结构跳转，页面模式继续保留页侧边栏
- 增强 Word 和通用文档打印导出，`.docx` / `.doc` 会使用专属导出适配器清理预览缩放、绝对定位和滚动容器，避免只打印一页或页面被截断
- 新增 `options.hooks` 生命周期钩子，覆盖文档开始加载、加载完成、开始卸载和卸载完成，并提供文件类型、文件名、来源、URL、大小、版本和耗时上下文
- 新增 `options.beforeOperation` 与 toolbar 级前置操作钩子，下载、打印、导出 HTML 前都可以返回 `false` 取消，便于接入权限校验、审计确认和业务二次弹窗
- React / 纯 JS 适配层新增 viewer 事件监听入口，基线预览器会向宿主同步生命周期和操作事件
- 文档、README 和四条 npm 包线版本说明同步刷新到 `1.0.15`

### `v1.0.14` 最新发布与文档站同步版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.14`、Vue2 包 `@flyfish-group/file-viewer@1.0.14`、React 包 `@flyfish-group/file-viewer-react@1.0.14` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.14` 统一抬升到最新版本
- 文档站首页、快速开始、分发说明、支持格式页和 README 中的安装示例同步刷新到 `1.0.14`
- 开源总仓库、Demo 静态产物和文档站静态产物重新构建，方便直接下载和验收
- 继续保持 Vue3 / Vue2 / React / 纯 JS 的集成路径、按需异步加载、示例分组和 PDF / OFD / 压缩包 / 邮件 / CAD / 绘图 / 电子书预览链路一致

### `v1.0.12` 完整格式、分发仓库与 npm 同步版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.12`、Vue2 包 `@flyfish-group/file-viewer@1.0.12`、React 包 `@flyfish-group/file-viewer-react@1.0.12` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.12` 统一对齐到 npm `latest`
- 新增压缩包预览，基于 `libarchive.js` Worker 支持 ZIP、7z、RAR、TAR、GZIP、BZIP2、XZ、CAB、ISO、JAR、APK、CBZ/CBR 等入口，内部文件按需解压、IndexedDB 缓存并继续调用统一预览器
- 新增 EML / MSG 邮件预览，支持头信息、HTML/文本正文、附件下载和附件继续在线预览
- 增强 OLB / DRA 结构预览，基于 `cfb` 解析常见 EDA 复合文档容器，并提供结构树、元件/封装/Padstack 候选、属性、诊断、二进制退化和可读字符串索引
- 预览器新增 `options.watermark`、`options.toolbar` 和 `options.archive`，支持文字/图片水印、下载原文件、完整打印、导出渲染后 HTML、压缩包 worker 和体积限制配置
- 修复 PDF 打印和导出 HTML 的完整性，PDF 会通过专属导出适配器逐页生成全部页面，不再依赖当前滚动视口、当前页或已渲染 canvas，避免只打印当前页或内容被截断
- DWG 入口从单纯提示转换为尽力展示: 误命名 DXF 会直接按 DXF 解析，真实 DWG 会尝试提取内嵌 PNG/JPEG/BMP 预览图，并说明无法完整解析几何的原因
- 新增 Three.js 3D 模型预览器，支持 `glb`、`gltf`、`obj`、`stl`、`ply`、`fbx`、`dae`、`3ds`、`3mf`、`amf`、`usd`、`usda`、`usdc`、`usdz`、`kmz`、`pcd`、`wrl`、`vrml`、`xyz`、`vtk`、`vtp`；`step`、`stp`、`iges`、`igs`、`ifc`、`3dm` 会给出转换原因和建议
- Demo 新增 GLTF / OBJ / STL / PLY / STEP 3D 样例，以及 ZIP、TAR.GZ、EML、MSG、OLB、DRA 样例，支持格式矩阵更新到 135 个扩展名、19 条预览链路
- 文档站全局导航、首页、格式矩阵、分发说明、快速开始和 npm README 均刷新到 `1.0.12`
- 开源总仓库已升级为一站式主入口，保留可运行源码、Demo 静态站、文档静态站、样例文件和 release tarball
- React / 纯 JS 文档继续推荐 `npm install` 零步骤安装，并补充 pnpm 10 拦截 `postinstall` 时的 `pnpm approve-builds` / `pnpm exec file-viewer-copy-assets` 处理方式

### `v1.0.9` 媒体、绘图与电子书预览增强版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.9` 和 Vue2 包 `@flyfish-group/file-viewer@1.0.9` 同步发布到 npm `latest`
- 新增 React 包 `@flyfish-group/file-viewer-react@1.0.9` 和纯 JS 包 `@flyfish-group/file-viewer-web@1.0.9`，复用 Vue3 基线资源
- 新增原生 组件 Demo，覆盖 React 组件和纯 JS helper 两种入口，构建后可直接作为私有化静态站点部署
- 增强 PPTX 渲染，补齐组合图形坐标映射、旋转/翻转、主题背景、图片裁剪和 EMF 转 SVG 预览
- 新增 `.epub` 预览，使用 `epubjs` 按需解析 EPUB 包、目录和滚动阅读，并避开部分浏览器超宽分页白板问题
- 新增 `.umd` 电子书预览，按 UMD 文件结构解析元数据、章节目录和 zlib 压缩正文
- 新增 `.mp3`、`.mpeg`、`.wav`、`.ogg`、`.oga`、`.opus`、`.m4a`、`.aac`、`.flac`、`.weba` 音频入口，使用浏览器原生播放器
- 新增 `.excalidraw` 预览，使用官方 `@excalidraw/excalidraw` 的 `exportToSvg` 能力按需生成只读 SVG
- 新增 `.drawio` / `.dio` 预览，使用官方 diagrams.net `GraphViewer` 处理 mxGraphModel / mxfile
- 补充 Demo 示例文件、格式矩阵、FAQ 和接入说明

### `v1.0.8` 文档视觉与预览稳定性版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.8` 和 Vue2 包 `@flyfish-group/file-viewer@1.0.8` 同步发布到 npm `latest`
- 修复 PDF worker 生命周期，快速切换 PDF / OFD / PDF 时不再触发 worker 销毁告警
- 稳定 OFD 渲染状态，避免反复闪动“正在解析 OFD”
- 刷新文档站截图、主题配色和集成示例页视觉

### `v1.0.7` PDF 自适应修复版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.7` 和 Vue2 包 `@flyfish-group/file-viewer@1.0.7` 同步发布到 npm `latest`
- 修复 PDF.js 5 下 canvas 布局尺寸被 DPR backing store 干扰的问题，避免 PDF 页面被裁切或显示不完整
- 修复 PDF 默认宽度适配计算，导航窗格开启时也能按当前视口宽度给出可读缩放比例
- 同步刷新线上 Demo、文档说明和开源总仓库产物

### `v1.0.6` 开源分发版本

- Vue3 包 `@flyfish-group/file-viewer3@1.0.6` 和 Vue2 包 `@flyfish-group/file-viewer@1.0.6` 均已发布到 npm `latest`
- 新增 PDF 缩放工具栏、页码状态和可显隐页面导航窗格
- 补齐 OFD、CAD、代码高亮与完整示例文件盒子
- 示例文件选择器支持分组折叠，默认展开第一个分组，并保持同一时间只展开一个分组
- 增加 `pnpm obfuscate` 与 `pnpm release:ecosystem:pack`，库产物支持压缩混淆后分发
- README、文档站和开源总仓库说明同步补充 npm、GitHub、私有聚合仓、优先支持、授权与贡献说明
- npm tarball 只包含 `README.md`、`LICENSE` 和混淆压缩后的 `dist/`

### 文档站与交付说明完善

- 重写 README 与 VitePress 文档结构
- 增加 Demo 说明、本地开发与打包说明
- 补充截图、接入建议与发布前检查清单

### `.doc` 渲染能力升级

- 使用 `msdoc-viewer` 替换旧的 `.doc` 解析方案
- 将 `.doc` 内容渲染在 Word 风格页面容器中
- 增加灰色工作台、白色纸张与页面居中展示效果

### 示例与工程体验

- 提供更清晰的本地 Demo 入口说明
- 支持将预览器独立部署并通过静态入口集成
- 本地构建、文档站构建与 npm 打包链路持续收敛

## 历史版本

### `v1.0.3`

- 修复与优化 PDF 字体、缩放和 Excel 样式相关问题

### 更早版本

- 优化 PPTX 加载性能
- 补强 Word 与 Excel 的基础预览能力
- 持续完善 TypeScript 与 Vue 3 版本实现

<div class="doc-note">
  npm 包版本请以 `package.json` 和实际发布记录为准；本页更偏向说明“这个仓库当前已经演进到了哪里”。
</div>

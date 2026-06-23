# Flyfish Viewer

[简体中文](README.md) | [English](README.en.md)

把 Word、Excel、PPT、PDF、Typst、XMind 脑图、压缩包、邮件、音视频、地理数据、工程图纸、字体、设计资产和结构化数据稳稳带进浏览器里。

`@file-viewer/core` 提供底层预览能力、格式矩阵、生命周期事件和操作 API；`@file-viewer/pptx` 等独立渲染引擎包负责可单独演进的重型格式能力；Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery、Svelte 等标准组件包只负责各自生态的原生组件体验、类型出口和交互封装。新项目建议优先使用 `@file-viewer/*` 标准包名，`@flyfish-group/*` 历史包名继续同步维护。

它不依赖后端转码服务，适合接入 OA、知识库、附件中心、流程系统和需要离线能力的业务场景。这个项目的目标很直接: 让文档预览不再像临时拼出来的功能，而是像一个可以放心交付、能独立演示、能持续维护的产品模块。

接入主张很简单: **一个组件，一行代码，快速集成**。先选择对应技术栈的标准组件包，再用同一套 options、事件、搜索、缩放、打印、导出和水印能力完成业务接入。

- 标准 npm 包: `@file-viewer/core`、`@file-viewer/pptx`、`@file-viewer/renderer-word`、`@file-viewer/renderer-presentation`、`@file-viewer/renderer-drawing`、`@file-viewer/renderer-3d`、`@file-viewer/renderer-data`、`@file-viewer/renderer-eda`、`@file-viewer/preset-lite`、`@file-viewer/preset-office`、`@file-viewer/preset-engineering`、`@file-viewer/preset-all`、`@file-viewer/vite-plugin`、`@file-viewer/web`、`@file-viewer/vue3`、`@file-viewer/vue2.7`、`@file-viewer/vue2.6`、`@file-viewer/react`、`@file-viewer/react-legacy`、`@file-viewer/jquery`、`@file-viewer/svelte`
- 历史兼容 npm 包: `@flyfish-group/file-viewer3`、`file-viewer3`、`@flyfish-group/file-viewer`、`@flyfish-group/file-viewer-react`、`@flyfish-group/file-viewer-web`
- 官方网站: [file-viewer.app](https://file-viewer.app)
- 官方文档: [doc.file-viewer.app](https://doc.file-viewer.app)
- 生态接入指南: [doc.file-viewer.app/guide/ecosystem](https://doc.file-viewer.app/guide/ecosystem)
- 在线 Demo: [demo.file-viewer.app](https://demo.file-viewer.app)
- 文档比对 Demo: [demo.file-viewer.app/compare.html](https://demo.file-viewer.app/compare.html)
- Release 下载: [github.com/flyfish-dev/file-viewer/releases](https://github.com/flyfish-dev/file-viewer/releases)
- Docker 镜像发布目标: `flyfishdev/file-viewer:latest`
- 开源总仓库(GitHub): [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer)
- 开源总仓库(Gitee): [gitee.com/flyfish-dev/file-viewer](https://gitee.com/flyfish-dev/file-viewer)
- 打赏与优先支持: [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)

## Demo

![Flyfish Viewer 演示: Word、PDF、PPTX 与文档比对](docs/public/_media/flyfish-viewer-demo.gif)

## 为什么值得接入

- **纯前端 Serverless。** 文档解析和展示全部在浏览器内完成，部署简单，不依赖 Office 服务端、LibreOffice 守护进程或额外转码链路。
- **格式覆盖完整。** 当前内置 206 个扩展名映射，覆盖 Word、Excel、PowerPoint、PDF、OFD、Typst、XMind 脑图、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、Excalidraw、draw.io、Mermaid、PlantUML、EPUB、UMD、Markdown、图片、音频、视频、代码/文本、Git patch/bundle、字体、PSD 图层资产和结构化数据，能覆盖绝大多数业务附件场景。
- **按需异步加载。** PDF、OFD、Typst、XMind、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、绘图、Office、EPUB、UMD、Markdown、代码高亮、HLS、HEIC、字体/数据资产渲染器都按需加载，重型解析依赖不会进入其他格式的首屏路径。
- **预览器操作完整。** 内置下载原文件、打印完整渲染结果、导出渲染后 HTML、水印开关、水印 options、主题 options、搜索高亮、上一个 / 下一个命中、行级定位和 AI 友好文本切片；PDF 使用 PDF.js 原生搜索，Word / Markdown / 代码等文本类格式使用通用 DOM 搜索，避免污染 PDF 文本层、canvas 等特殊渲染结构；`theme` 支持 `light`、`dark`、`system`，默认跟随系统，浅色业务 UI 可显式锁定 `light`；打印按钮会按当前格式和渲染链路动态显隐，Word / PDF 使用专属完整页导出适配器，不依赖当前视口，适合合同、归档和审批类场景。
- **集成控制更完整。** 提供加载/卸载生命周期钩子、原生事件回调和按钮前置校验机制，下载、打印、导出前可以接入权限验证、审计确认或业务二次弹窗。
- **阅读体验更像产品。** `.doc`、`.docx`、PDF 都保留灰色工作台、白色阅读面、居中阅读和自适应缩放；DOCX 由 `@file-viewer/renderer-word` 按需加载自研 `@file-viewer/docx`，默认走 Worker 解析、连续流式阅读和异步分批渲染，优先保证复杂目录、长表格、制表符、页眉页脚、字段和样式继承稳定；PDF 兼容旋转页和页面 / 目录导航，Excel 会尽量还原图片、自动文本色和可滚动的多 sheet 标签，避免“内容能打开但不好读”的落差。
- **明暗主题有边界。** Demo 外壳、Markdown 和代码预览会适配系统暗色模式；PDF、Word、Excel 等带原始版式的内容保持独立纸张或表格背景，避免全局主题污染文档。
- **Demo 更适合验收。** 示例文件按文档、表格、图纸、脑图与绘图、邮件与 EDA、代码、图片和数据资产等类型分组展示，点击样例即可打开并自动收起选择器。
- **独立文档比对入口。** 生产 Demo 额外提供 `/compare.html`，左右并排预览两份文档，支持示例、URL、本地上传、交换、重置、同步滚动、聚焦文档搜索、行级定位和 PDF 工具栏隐藏，不污染主预览入口。
- **各框架体验一致。** core 聚焦底层预览能力，Vanilla JS / Pure Web、Vue3、Vue2、React、jQuery 和 Svelte 标准组件包各自提供原生接入体验，并共享同一套 options、事件、搜索、缩放、打印和导出语义。
- **Docker 一键部署。** 提供 nginx 静态镜像、`Dockerfile` 和 buildx 发布脚本，发布镜像覆盖 `linux/amd64` 与 `linux/arm64`。
- **适合开源分发和二次接入。** 开源总仓库同时维护 core、独立渲染引擎包、标准组件包、兼容包、主 Demo 源码、文档源码、混淆压缩产物、npm tarball、静态部署产物和 release 下载物，便于下载、运行、验收和二次接入；私有 Gitea 作为完整聚合仓、自动化发布链路和优先技术支持入口继续提供价值。

## 支持格式

当前版本内置 206 个扩展名映射，覆盖 24 条预览链路。

| 类别           | 扩展名                                                                                                                                                                                                                                                                                                                         | 当前表现                                                                                                                                                                                                            | 适合场景                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Word           | `docx`、`docm`、`dotx`、`dotm`                                                                                                                                                                                                                                                                                                 | `@file-viewer/renderer-word` + 自研 `@file-viewer/docx`，Worker 解析、连续流式阅读、目录字段缓存和异步分批渲染；模板/宏格式按只读预览处理                                                                            | 新生成的 Word 文档、正式文档、Word 模板     |
| Word           | `doc`、`dot`                                                                                                                                                                                                                                                                                                                   | `@file-viewer/renderer-word` + `msdoc-viewer`，使用 Word 风格页面容器，增强 CFB 容错和表格布局                                                                                                                       | 历史 `.doc` 老文档、Word 97-2003 模板       |
| 兼容文档       | `rtf`、`odt`                                                                                                                                                                                                                                                                                                                   | `@file-viewer/renderer-word` + `rtf.js` / ODF `content.xml` 兼容预览                                                                                                                                                 | RTF 富文本、OpenDocument 文本文档           |
| Excel          | `xlsx`、`xltx`                                                                                                                                                                                                                                                                                                                 | `@file-viewer/renderer-spreadsheet` + `styled-exceljs` + 虚拟滚动，支持尺寸、合并、常见样式、自动文本色、workbook drawing 图片和可选表头拖拽调整列宽；默认主线程解析，静态 Worker 需显式开启；打印按钮按能力隐藏，避免只打印当前视口 | 需要保留表格结构和样式的业务、Excel 模板    |
| Excel 兼容格式 | `xlsm`、`xlsb`、`xls`、`xlt`、`xltm`、`csv`、`ods`、`fods`、`numbers`                                                                                                                                                                                                                                                          | 统一解析，按格式可用信息渐进还原样式；同样遵循虚拟表格打印边界                                                                                                                                                      | 老表格、轻量数据查看                        |
| PowerPoint     | `pptx`、`pptm`、`potx`、`potm`、`ppsx`、`ppsm`、`odp`                                                                                                                                                                                                                                                                          | 基于独立开源 `@file-viewer/pptx` 原生引擎浏览幻灯片内容，Worker 渐进解析并按页输出；ODP 走 OpenDocument 幻灯片文本预览                                                                                              | 汇报材料、课件、方案、演示模板              |
| PDF            | `pdf`                                                                                                                                                                                                                                                                                                                          | 基于 `pdfjs-dist` 预览，同源 URL 默认渐进读取；服务端支持 Range 时自动分片加载，支持缩放工具栏、旋转页、页侧边栏/目录树侧边栏切换、宽度自适应、完整打印和导出 HTML                                                  | 合同、票据、版式成品                        |
| OFD            | `ofd`                                                                                                                                                                                                                                                                                                                          | 基于 `DLTech21/ofd.js` 仓库源码在线预览国产版式文档，避开 npm dist 授权 wasm 分支                                                                                                                                   | 电子发票、公文、归档材料                    |
| Typst          | `typ`、`typst`                                                                                                                                                                                                                                                                                                                 | 直接读取 Typst 源文件，按需加载 `@myriaddreamin/typst.ts` 浏览器 WASM 编译器并按页 SVG 渲染；支持完整预览、打印和导出 HTML                                                                                          | 技术报告、论文草稿、工程文档模板            |
| 压缩包         | `zip`、`zipx`、`7z`、`rar`、`tar`、`gz`、`gzip`、`tgz`、`bz2`、`bzip2`、`tbz`、`tbz2`、`xz`、`txz`、`lzma`、`zst`、`tzst`、`cab`、`ar`、`cpio`、`iso`、`xar`、`lha`、`lzh`、`jar`、`war`、`ear`、`apk`、`cbz`、`cbr`                                                                                                           | `@file-viewer/renderer-archive` 基于 `libarchive.js` WASM Worker 读取目录，点击后按需解压内部文件并复用统一预览器，支持 IndexedDB 缓存、ZIP/TAR/GZIP fallback 和体积上限                                            | 归档附件、批量交付包、压缩包内文档快速查看  |
| 邮件           | `eml`、`msg`、`mbox`                                                                                                                                                                                                                                                                                                           | `@file-viewer/renderer-email` 独立承接邮件链路；EML/MBOX 使用 `postal-mime`，MSG 使用 `@kenjiuno/msgreader`，支持头信息、HTML/文本正文、附件下载与附件预览                                                          | 邮件归档、工单邮件、客户来信附件            |
| EDA            | `olb`、`dra`、`gds`、`oas`、`oasis`                                                                                                                                                                                                                                                                                            | `@file-viewer/renderer-eda` 独立承接；使用 `cfb` 解析 OrCAD/Allegro 常见 CFB 容器；标准 GDSII 会读取 structure、boundary、path、text、reference，小图输出 SVG，大元素集自动切到 WebGL canvas；OAS/OASIS 可读文本版图夹具会输出 SVG 预览，真实 SEMI 二进制 OASIS 先做安全结构索引、可读字符串、实体候选和诊断，不虚标专业电气/几何校核 | 元件库、封装图纸、芯片版图附件初筛          |
| CAD            | `dwg`、`dxf`、`dwf`、`dwfx`、`xps`                                                                                                                                                                                                                                                                                             | 基于 `@flyfish-dev/cad-viewer` 预览图纸；DWG 通过 Worker + LibreDWG WASM 解析，DXF 使用 JS parser，DWF/DWFx/XPS 使用 native `dwf-viewer` 渲染 W2D/W3D/XPS 图形                                                      | 工程图纸、二维 CAD 附件、AutoCAD 归档文件   |
| 3D 模型        | `glb`、`gltf`、`obj`、`stl`、`ply`、`fbx`、`dae`、`3ds`、`3mf`、`amf`、`usd`、`usda`、`usdc`、`usdz`、`kmz`、`pcd`、`wrl`、`vrml`、`xyz`、`vtk`、`vtp`、`step`、`stp`、`iges`、`igs`、`ifc`、`3dm`                                                                                                                             | `@file-viewer/renderer-3d` 基于 Three.js loaders 交互预览；工程 CAD/BIM 格式会给出不内置几何内核的原因和转换建议                                                                                                    | 设计模型、点云、三维资产、工程模型          |
| 地理数据       | `geojson`、`kml`、`gpx`、`shp`                                                                                                                                                                                                                                                                                                 | `@file-viewer/renderer-geo` 独立承接；`@tmcw/togeojson` / `shpjs` 转 GeoJSON 后离线 SVG 预览                                                                                                                        | 地理附件、轨迹、边界和轻量 GIS 数据         |
| XMind 脑图     | `xmind`                                                                                                                                                                                                                                                                                                                        | 基于 `@ljheee/xmind-parser` 解析 XMind 8 XML 与 XMind 2020+ JSON 包结构，离线渲染多 sheet 脑图、节点、标签、备注、链接、标记、图片和目录树，使用 `@panzoom/panzoom` 提供成熟的拖拽平移、移动端双指缩放、滚轮锚点缩放、键盘平移、统一 toolbar 状态同步、适配画布、搜索、打印、HTML 导出和缩放 | 脑图、项目规划、知识结构、会议纪要          |
| Excalidraw     | `excalidraw`                                                                                                                                                                                                                                                                                                                   | 基于官方 `@excalidraw/excalidraw` 的 `restore` + `exportToSvg` 输出只读预览                                                                                                                                         | 白板草图、流程草稿、产品沟通图              |
| draw.io        | `drawio`、`dio`                                                                                                                                                                                                                                                                                                                | 基于官方 diagrams.net `GraphViewer` 预览 mxGraphModel / mxfile                                                                                                                                                      | 流程图、架构图、业务泳道图                  |
| Mermaid        | `mermaid`、`mmd`                                                                                                                                                                                                                                                                                                               | `@file-viewer/renderer-drawing` 按需加载官方 `mermaid`，输出主题适配 SVG，并通过 `@panzoom/panzoom` 支持拖动、缩放、重置和统一工具栏联动                                                                             | 架构图、流程图、状态图、序列图              |
| PlantUML       | `plantuml`、`puml`                                                                                                                                                                                                                                                                                                             | 使用 `plantuml-encoder` 生成渲染 payload，支持配置自托管 PlantUML SVG 服务；预览层同样支持拖动、缩放和主题容器适配                                                                                                  | UML 时序图、组件图、部署图                  |
| 电子书         | `epub`                                                                                                                                                                                                                                                                                                                         | `@file-viewer/renderer-ebook` 基于 `epubjs` 解析目录和章节资源，使用兼容性更好的滚动阅读                                                                                                                            | 电子书、培训手册、长篇阅读材料              |
| 电子书         | `umd`                                                                                                                                                                                                                                                                                                                          | 按 UMD 移动电子书结构解析元数据、目录和 zlib 压缩正文                                                                                                                                                               | 旧移动电子书、历史小说附件                  |
| Markdown       | `md`、`markdown`                                                                                                                                                                                                                                                                                                               | `@file-viewer/renderer-text` 提供 Markdown 阅读样式，支持明暗主题阅读面                                                                                                                                             | README、知识文档、说明文档                  |
| 图片           | `gif`、`jpg`、`jpeg`、`bmp`、`tiff`、`tif`、`png`、`svg`、`webp`、`avif`、`ico`、`heic`、`heif`、`jxl`                                                                                                                                                                                                                         | 原生图片浏览；HEIC/HEIF 命中时按需使用 `heic2any` 转换                                                                                                                                                              | 图片附件、设计稿、Logo、移动端照片          |
| 代码/文本      | `txt`、`json`、`jsonc`、`json5`、`ipynb`、`yaml`、`yml`、`toml`、`ini`、`proto`、`hcl`、`tex`、`gv`、`http`、`js`、`mjs`、`cjs`、`jsx`、`ts`、`tsx`、`vue`、`react`、`css`、`html`、`htm`、`xml`、`log`、`java`、`py`、`go`、`rs`、`rb`、`swift`、`kt`、`php`、`c`、`cpp`、`cc`、`h`、`hpp`、`cs`、`sh`、`bash`、`sql`、`diff`、`patch`、`bundle`、`bdl` | `@file-viewer/renderer-text` 使用 `highlight.js` 轻量高亮；patch 按需加载 `diff2html` 做左右比对，git bundle 解析 refs、历史记录、文件树和可读 blob 内容                                          | 日志、配置、代码片段、接口响应、代码评审    |
| 音频           | `mp3`、`mpeg`、`wav`、`ogg`、`oga`、`opus`、`m4a`、`aac`、`flac`、`weba`、`midi`、`mid`                                                                                                                                                                                                                                        | `@file-viewer/renderer-media` 使用浏览器原生音频播放；MIDI 命中时按需加载 `@tonejs/midi` 展示轨道结构                                                                                                               | 录音、播客、语音附件、音效素材、MIDI 文件   |
| 视频           | `mp4`、`webm`、`m3u8`                                                                                                                                                                                                                                                                                                          | `@file-viewer/renderer-media` 使用浏览器原生视频播放；HLS 清单必要时按需加载 `hls.js`                                                                                                                               | 演示视频、录屏、HLS 流                      |
| 字体/设计/数据 | `ttf`、`otf`、`woff`、`woff2`、`psd`、`ai`、`eps`、`sqlite`、`wasm`、`parquet`、`avro`、`webarchive`                                                                                                                                                                                                                           | `@file-viewer/renderer-data` 独立承接，基于 FontFace、`ag-psd`、`sql.js`、`hyparquet`、`avsc`、WebAssembly Module 和安全摘要；PSD 支持图层选择显隐、重绘和统一缩放；SQLite WASM 支持私有化配置                  | 字体、设计资产、数据库、列式数据和 Web 归档 |

## 效果截图

| 主 Demo / 多格式预览                                                                             | 文档预览 / Office 与 PDF 阅读面                                                       | Vanilla JS / script 标签接入                                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| <img src="docs/_images/demo-main.png" width="360" alt="Flyfish Viewer 主 Demo 多格式预览效果" /> | <img src="docs/_images/demo-doc.png" width="360" alt="Flyfish Viewer 文档预览效果" /> | <img src="docs/_images/demo-iframe.png" width="360" alt="Flyfish Viewer 纯 Web 接入预览效果" /> |

## 当前 npm 生态

当前版本以 npm registry 的 `latest` dist-tag 为准，共维护 38 个 npm 发布目标: 33 个标准组件/核心/renderer/preset/工程插件包 + 5 个历史兼容 alias。新项目建议优先使用 `@file-viewer/*` 标准包名；旧项目继续使用 `@flyfish-group/*` 或 `file-viewer3` 时也会拿到同版本能力。

| 场景                                | 推荐 npm 包                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 历史兼容包                                                                                                                                               | 版本策略 | 说明                                                                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core 底座                           | [`@file-viewer/core`](https://www.npmjs.com/package/@file-viewer/core)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 无                                                                                                                                                       | `latest` | 框架无关的格式矩阵、预览能力、资源加载、生命周期事件、搜索、缩放、打印、导出和操作 API                                                                                  |
| PPTX 原生引擎                       | [`@file-viewer/pptx`](https://www.npmjs.com/package/@file-viewer/pptx)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 无                                                                                                                                                       | `latest` | 从 Flyfish 历史稳定实现拆出的独立 PPTX 渲染引擎，Worker 渐进解析，由 `@file-viewer/renderer-presentation` 按需加载                                                     |
| Word renderer                       | [`@file-viewer/renderer-word`](https://www.npmjs.com/package/@file-viewer/renderer-word)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 无                                                                                                                                                       | `latest` | 标准 renderer 插件，承接 DOCX/DOC/DOT/RTF/ODT 链路，内部按需加载 `@file-viewer/docx`、`msdoc-viewer` 和 `rtf.js`，core-only 安装不再拉取 Word 重依赖                  |
| 演示文稿 renderer                   | [`@file-viewer/renderer-presentation`](https://www.npmjs.com/package/@file-viewer/renderer-presentation)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 无                                                                                                                                                       | `latest` | 标准 renderer 插件，基于 `@file-viewer/pptx` 提供 PPTX/PPTM/POTX/POTM/PPSX/PPSM 按需预览、缩放、打印和导出                                                             |
| 绘图 renderer                       | [`@file-viewer/renderer-drawing`](https://www.npmjs.com/package/@file-viewer/renderer-drawing)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 无                                                                                                                                                       | `latest` | 标准 renderer 插件，提供 Draw.io / diagrams.net 离线 viewer、Excalidraw 官方 SVG 导出、Mermaid 官方 SVG 渲染、PlantUML SVG 服务接入、Panzoom 拖拽缩放、打印和 HTML 导出 |
| 3D 模型 renderer                    | [`@file-viewer/renderer-3d`](https://www.npmjs.com/package/@file-viewer/renderer-3d)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 无                                                                                                                                                       | `latest` | 标准 renderer 插件，基于 Three.js loaders 提供 GLTF/GLB、OBJ、STL、PLY、FBX、DAE、3DS、3MF、USD/USDZ、点云和 VTK 等按需 WebGL 预览                                    |
| 数据资产 renderer                   | [`@file-viewer/renderer-data`](https://www.npmjs.com/package/@file-viewer/renderer-data)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 无                                                                                                                                                       | `latest` | 标准 renderer 插件，基于 `ag-psd`、`sql.js`、`hyparquet`、`avsc`、FontFace 和 WebAssembly Module 提供 PSD、SQLite、Parquet、Avro、字体、WASM、AI/EPS、WebArchive 预览 |
| EDA renderer                        | [`@file-viewer/renderer-eda`](https://www.npmjs.com/package/@file-viewer/renderer-eda)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 无                                                                                                                                                       | `latest` | 标准 renderer 插件，提供 OLB、DRA、GDSII、OASIS 结构预览，标准 GDSII 可生成 SVG/WebGL 版图预览，OASIS 文本夹具可生成 SVG，真实二进制 OASIS 保持结构诊断边界                  |
| 轻量 renderer preset                | [`@file-viewer/preset-lite`](https://www.npmjs.com/package/@file-viewer/preset-lite)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 无                                                                                                                                                       | `latest` | 一次装配文本、Markdown、代码、图片、音频和视频预览，适合常见轻附件场景                                                                                                |
| Office renderer preset              | [`@file-viewer/preset-office`](https://www.npmjs.com/package/@file-viewer/preset-office)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 无                                                                                                                                                       | `latest` | 一次装配 PDF、Word、Excel、PowerPoint、OFD、RTF 和 OpenDocument 文档链路                                                                                             |
| 工程 renderer preset                | [`@file-viewer/preset-engineering`](https://www.npmjs.com/package/@file-viewer/preset-engineering)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 无                                                                                                                                                       | `latest` | 一次装配 CAD、3D、绘图、XMind、Geo、Typst、Archive、Data 和 EDA 工程附件链路                                                                                          |
| 全量 renderer preset                | [`@file-viewer/preset-all`](https://www.npmjs.com/package/@file-viewer/preset-all)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 无                                                                                                                                                       | `latest` | 一次装配 Word、PDF、OFD、PPTX、CAD、Draw.io/Excalidraw/Mermaid/PlantUML、Typst、XMind、压缩包、邮件、电子书、代码/Markdown/Patch/Git Bundle、图片、音视频和 core 其余完整格式能力 |
| Vite 按需装配插件                   | [`@file-viewer/vite-plugin`](https://www.npmjs.com/package/@file-viewer/vite-plugin)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 无                                                                                                                                                       | `latest` | 按 `formats` 或源码 hint 自动生成 `virtual:file-viewer-renderers`，只 import 命中的 renderer 包；扩展映射对照 core 完整格式矩阵验证，并提供 renderer chunk 分组和 PDF/OFD/CAD/Drawing/Typst/Archive/Data 离线资产路线 |
| 独立 renderer 包                    | [`@file-viewer/renderer-word`](https://www.npmjs.com/package/@file-viewer/renderer-word)、[`@file-viewer/renderer-pdf`](https://www.npmjs.com/package/@file-viewer/renderer-pdf)、[`@file-viewer/renderer-ofd`](https://www.npmjs.com/package/@file-viewer/renderer-ofd)、[`@file-viewer/renderer-presentation`](https://www.npmjs.com/package/@file-viewer/renderer-presentation)、[`@file-viewer/renderer-cad`](https://www.npmjs.com/package/@file-viewer/renderer-cad)、[`@file-viewer/renderer-drawing`](https://www.npmjs.com/package/@file-viewer/renderer-drawing)、[`@file-viewer/renderer-3d`](https://www.npmjs.com/package/@file-viewer/renderer-3d)、[`@file-viewer/renderer-data`](https://www.npmjs.com/package/@file-viewer/renderer-data)、[`@file-viewer/renderer-eda`](https://www.npmjs.com/package/@file-viewer/renderer-eda)、[`@file-viewer/renderer-typst`](https://www.npmjs.com/package/@file-viewer/renderer-typst)、[`@file-viewer/renderer-archive`](https://www.npmjs.com/package/@file-viewer/renderer-archive)、[`@file-viewer/renderer-email`](https://www.npmjs.com/package/@file-viewer/renderer-email)、[`@file-viewer/renderer-ebook`](https://www.npmjs.com/package/@file-viewer/renderer-ebook)、[`@file-viewer/renderer-text`](https://www.npmjs.com/package/@file-viewer/renderer-text)、[`@file-viewer/renderer-image`](https://www.npmjs.com/package/@file-viewer/renderer-image)、[`@file-viewer/renderer-media`](https://www.npmjs.com/package/@file-viewer/renderer-media)、[`@file-viewer/renderer-mindmap`](https://www.npmjs.com/package/@file-viewer/renderer-mindmap)、[`@file-viewer/renderer-geo`](https://www.npmjs.com/package/@file-viewer/renderer-geo) | 无                                                                                                                                                       | `latest` | 用于按需安装 Word、重型版式、文本阅读、图片、媒体、3D、数据资产、EDA 和地理数据链路，避免业务只看轻量格式时安装 DOCX/DOC/PDF/OFD/PPTX/CAD/Draw.io/Excalidraw/Mermaid/PlantUML/Typst/压缩包/邮件/EPUB/XMind/OLB/DRA/GDS/OASIS/GeoJSON/KML/GPX/SHP/PSD/SQLite/Patch/Git Bundle/代码高亮/HEIC/HLS/MIDI 依赖 |
| Vanilla JS / Pure Web / script 标签 | [`@file-viewer/web`](https://www.npmjs.com/package/@file-viewer/web)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [`@flyfish-group/file-viewer-web`](https://www.npmjs.com/package/@flyfish-group/file-viewer-web)                                                         | `latest` | `mountViewer(container, options)`、Custom Element、IIFE、资源复制 CLI、Worker/WASM 自托管工具                                                                           |
| Vue3                                | [`@file-viewer/vue3`](https://www.npmjs.com/package/@file-viewer/vue3)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | [`@flyfish-group/file-viewer3`](https://www.npmjs.com/package/@flyfish-group/file-viewer3)、[`file-viewer3`](https://www.npmjs.com/package/file-viewer3) | `latest` | Vue3 原生组件、插件安装、props、事件、ref/controller 和完整类型                                                                                                         |
| Vue2.7                              | [`@file-viewer/vue2.7`](https://www.npmjs.com/package/@file-viewer/vue2.7)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | [`@flyfish-group/file-viewer`](https://www.npmjs.com/package/@flyfish-group/file-viewer)                                                                 | `latest` | Vue2.7 原生组件，能力和 Vue3 保持一致                                                                                                                                   |
| Vue2.6                              | [`@file-viewer/vue2.6`](https://www.npmjs.com/package/@file-viewer/vue2.6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 无                                                                                                                                                       | `latest` | Vue2.6 专线，面向仍停留在 Vue 2.6 的老项目                                                                                                                              |
| React 18/19                         | [`@file-viewer/react`](https://www.npmjs.com/package/@file-viewer/react)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [`@flyfish-group/file-viewer-react`](https://www.npmjs.com/package/@flyfish-group/file-viewer-react)                                                     | `latest` | React 原生组件和 hooks/controller，不通过 Vue 或 iframe 转接                                                                                                            |
| React 16.8/17                       | [`@file-viewer/react-legacy`](https://www.npmjs.com/package/@file-viewer/react-legacy)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 无                                                                                                                                                       | `latest` | 面向旧 React 项目的兼容组件包                                                                                                                                           |
| jQuery                              | [`@file-viewer/jquery`](https://www.npmjs.com/package/@file-viewer/jquery)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 无                                                                                                                                                       | `latest` | jQuery 插件式接入，适合传统后台系统                                                                                                                                     |
| Svelte                              | [`@file-viewer/svelte`](https://www.npmjs.com/package/@file-viewer/svelte)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 无                                                                                                                                                       | `latest` | Svelte 组件、action 和类型入口                                                                                                                                          |

生态边界很清楚: `@file-viewer/core` 只负责底层预览能力和 API；各标准组件包只依赖 core 和自己的框架依赖，不嵌套其他框架实现；历史兼容包只负责旧包名继续可用，不建议新项目优先选择。

常见安装方式:

```bash
pnpm add @file-viewer/web
pnpm add @file-viewer/vue3
pnpm add @file-viewer/react
pnpm add @file-viewer/core
pnpm add @file-viewer/renderer-word
pnpm add @file-viewer/pptx
```

如果你在内网、离线环境，或者 npm 发布权限还没有完成配置，也可以直接使用开源总仓库 `artifacts/` 里的 release tarball。离线安装 React 包时请先安装同版本 web 包:

```bash
npm install ./artifacts/file-viewer-core-*.tgz
npm install ./artifacts/file-viewer-pptx-*.tgz
npm install ./artifacts/file-viewer-renderer-word-*.tgz
npm install ./artifacts/file-viewer-web-*.tgz
npm install ./artifacts/file-viewer-vue3-*.tgz
npm install ./artifacts/file-viewer-vue2.7-*.tgz
npm install ./artifacts/file-viewer-vue2.6-*.tgz
npm install ./artifacts/file-viewer-react-*.tgz
npm install ./artifacts/file-viewer-react-legacy-*.tgz
npm install ./artifacts/file-viewer-jquery-*.tgz
npm install ./artifacts/file-viewer-svelte-*.tgz
npm install ./artifacts/flyfish-group-file-viewer3-*.tgz
npm install ./artifacts/flyfish-group-file-viewer-*.tgz
npm install ./artifacts/flyfish-group-file-viewer-web-*.tgz
npm install ./artifacts/flyfish-group-file-viewer-react-*.tgz
```

Core、PPTX 原生引擎、Vanilla JS / Pure Web、Vue3、Vue2、React、React legacy、jQuery、Svelte 和历史兼容 tarball 都会随开源总仓库一起生成。`file-viewer3` 非 scoped 兼容包仍会同步发布到 npm，但它和 `@flyfish-group/file-viewer3` 包体重复，开源总仓库不再重复存储该 tarball。React / 纯 JS 包推荐用 `npm install` 获得完整依赖体验；如需自托管 Worker、WASM 和示例资源，可运行 `pnpm exec file-viewer-copy-assets ./public/file-viewer`。

GitHub Release 会同步提供完整下载项:

| 文件                                     | 用途                                                            |
| ---------------------------------------- | --------------------------------------------------------------- |
| `file-viewer-v2-*-demo.tar.gz`           | 主 Demo 静态站，解压后即可体验主预览和 `/compare.html` 文档比对 |
| `file-viewer-v2-*-component-demo.tar.gz` | Vanilla JS / React 原生组件演示站                               |
| `file-viewer-v2-*-lib-dist.tar.gz`       | Vue3 组件库构建产物，适合离线检查 dist 内容                     |
| `file-viewer-v2-*-docs.tar.gz`           | 文档站静态产物                                                  |
| `file-viewer-core-*.tgz`                 | `@file-viewer/core` 纯 TypeScript 底座本地 npm 安装包           |
| `file-viewer-pptx-*.tgz`                 | `@file-viewer/pptx` 原生 PPTX 渲染引擎本地 npm 安装包           |
| `file-viewer-vue3-*.tgz`                 | Vue3 标准包名本地 npm 安装包                                    |
| `file-viewer-vue2.7-*.tgz`               | Vue2.7 标准组件包 本地 npm 安装包                               |
| `file-viewer-vue2.6-*.tgz`               | Vue2.6 标准组件包 本地 npm 安装包                               |
| `file-viewer-react-*.tgz`                | React 18/19 标准组件包 本地 npm 安装包                          |
| `file-viewer-react-legacy-*.tgz`         | React 16.8/17 标准组件包 本地 npm 安装包                        |
| `file-viewer-web-*.tgz`                  | 纯 Web 标准组件包，本地安装后可复制 Worker/WASM viewer assets   |
| `file-viewer-jquery-*.tgz`               | jQuery 标准组件包 本地 npm 安装包                               |
| `file-viewer-svelte-*.tgz`               | Svelte 标准组件包 本地 npm 安装包                               |
| `flyfish-group-file-viewer3-*.tgz`       | Vue3 本地 npm 安装包                                            |
| `flyfish-group-file-viewer-*.tgz`        | Vue2.7 本地 npm 安装包                                          |
| `flyfish-group-file-viewer-web-*.tgz`    | 纯 JS 历史兼容包，提供 `mountViewer` 原生挂载和资源复制工具     |
| `flyfish-group-file-viewer-react-*.tgz`  | React 历史兼容包，提供原生 React 组件入口                       |

`file-viewer3` 非 scoped 历史兼容包仍会走 npm 发布链路；开源总仓库下载区使用 `flyfish-group-file-viewer3-*.tgz` 作为 Vue3 兼容 tarball，避免重复存储相同包体。

<!-- FILE_VIEWER_PUBLIC_GENERATED:START -->
## 标准生态包与公开仓库

下面内容由 `ecosystem/wrappers.json` 和 `packages/core/src/registry/formats.ts` 自动生成。开源总仓库同步 README 时会携带同一份索引，确保用户可以从任意入口找到标准 npm 包、历史兼容包、分散组件仓库和 release 下载物。

核心底座包: `@file-viewer/core`。core 源码已公开，GitHub: https://github.com/flyfish-dev/file-viewer-core，Gitee: https://gitee.com/flyfish-dev/file-viewer-core。开源总仓库提供可直接运行的主 Demo 源码、core、标准组件包、兼容包、文档源码、构建产物、示例文件和 release tarball；私有 Gitea `main` 是完整原始聚合仓，用于统一自动化、内部集成历史、打赏支持和优先技术支持，不等同于 GitHub 开源总仓库。

| 框架 | 标准 npm 包 | 入口格式 | GitHub | Gitee | 兼容历史包 |
| --- | --- | --- | --- | --- | --- |
| Vanilla JS / Pure Web | `@file-viewer/web` | ESM, 类型声明, script 标签 IIFE, Worker/WASM viewer 资源, 复制静态资源 CLI | [file-viewer-web](https://github.com/flyfish-dev/file-viewer-web) | [file-viewer-web](https://gitee.com/flyfish-dev/file-viewer-web) | `@flyfish-group/file-viewer-web` |
| Vue 3 | `@file-viewer/vue3` | ESM, 类型声明 | [file-viewer-vue3](https://github.com/flyfish-dev/file-viewer-vue3) | [file-viewer-vue3](https://gitee.com/flyfish-dev/file-viewer-vue3) | `@flyfish-group/file-viewer3`, `file-viewer3` |
| Vue 2.7 | `@file-viewer/vue2.7` | ESM, 类型声明 | [file-viewer-vue2.7](https://github.com/flyfish-dev/file-viewer-vue2.7) | [file-viewer-vue2.7](https://gitee.com/flyfish-dev/file-viewer-vue2.7) | `@flyfish-group/file-viewer` |
| Vue 2.6 | `@file-viewer/vue2.6` | ESM, 类型声明 | [file-viewer-vue2.6](https://github.com/flyfish-dev/file-viewer-vue2.6) | [file-viewer-vue2.6](https://gitee.com/flyfish-dev/file-viewer-vue2.6) | 无 |
| React 18/19 | `@file-viewer/react` | ESM, 类型声明 | [file-viewer-react](https://github.com/flyfish-dev/file-viewer-react) | [file-viewer-react](https://gitee.com/flyfish-dev/file-viewer-react) | `@flyfish-group/file-viewer-react` |
| React 16.8/17 | `@file-viewer/react-legacy` | ESM, 类型声明 | [file-viewer-react-legacy](https://github.com/flyfish-dev/file-viewer-react-legacy) | [file-viewer-react-legacy](https://gitee.com/flyfish-dev/file-viewer-react-legacy) | 无 |
| jQuery | `@file-viewer/jquery` | ESM, 类型声明 | [file-viewer-jquery](https://github.com/flyfish-dev/file-viewer-jquery) | [file-viewer-jquery](https://gitee.com/flyfish-dev/file-viewer-jquery) | 无 |
| Svelte | `@file-viewer/svelte` | Svelte 组件, ESM, 类型声明 | [file-viewer-svelte](https://github.com/flyfish-dev/file-viewer-svelte) | [file-viewer-svelte](https://gitee.com/flyfish-dev/file-viewer-svelte) | 无 |

## 工程级按需 renderer 装配

一个组件，一行代码，快速集成；真正影响安装体积和首屏包体的是 renderer 装配。推荐优先按产品形态选择 `@file-viewer/preset-lite`、`@file-viewer/preset-office`、`@file-viewer/preset-engineering` 或 `@file-viewer/preset-all`，需要极致裁剪时再安装单个 renderer 包。Vite 插件负责生成 `virtual:file-viewer-renderers`，业务代码只传同一套 `options`。

```bash
npm i @file-viewer/vue3 @file-viewer/core @file-viewer/vite-plugin @file-viewer/preset-office
```

```ts
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default {
  plugins: [
    fileViewerRenderers({
      preset: 'office',
      scan: true,
      copyAssets: true
    })
  ]
}
```

```ts
import { configuredFileViewerRenderers } from 'virtual:file-viewer-renderers'

const options = {
  builtinRenderers: 'none',
  renderers: configuredFileViewerRenderers,
  rendererMode: 'replace'
}
```

- Vue、React、Svelte、jQuery、Vanilla JS / Pure Web 都传同一份 `options`，只是在各自生态中映射为 props、hook、action、plugin 或 `mountViewer(...)` 参数。
- `preset-lite` 面向文本、Markdown、代码、图片和音视频；`preset-office` 面向 PDF / Word / Excel / PowerPoint / OFD；`preset-engineering` 面向 CAD / 3D / 绘图 / XMind / Geo / Typst / EDA / Data。
- 想要最小包体时，可以不用 preset，直接安装 `@file-viewer/renderer-pdf`、`@file-viewer/renderer-word` 等单个 renderer，并用 `formats` 精确生成 import。
- `scan:true` 会识别 `fileViewerFormats`、`data-file-viewer-formats` 和上传控件 `accept`，调试与打包时自动选择 renderer。
- `copyAssets:true` 会复制 PDF/CAD/Typst/Archive/Data 等 worker、WASM 和 vendor 资源，满足离线和企业内网部署。
- 想一次性拥有官方 Demo 的完整能力时，可以安装 `@file-viewer/preset-all` 并把 `allRenderers` 传给 `renderers`；这适合 demo 和后台运维工具，不建议作为所有业务默认入口。

### 组件属性与工具栏定制摘要

每个生态包都暴露原生接入方式。Vanilla JS / Pure Web 优先面向非框架、Custom Element 和 script 标签场景；Vue3 保持轻量声明式 props；React、Svelte、jQuery 和 Vue2 适合需要 `buffer`、`name`、`type`、`size` 等命令式挂载参数的场景。完整示例见官方文档: https://doc.file-viewer.app/guide/ecosystem

| 组件 | 实际属性 / 入口 | 事件入口 | 定制入口 |
| --- | --- | --- | --- |
| Vanilla JS / Pure Web `@file-viewer/web` | `<flyfish-file-viewer>` 属性 `src/url`、`filename/name`、`type`、`size`、`theme`、`toolbar`、`toolbar-position`、`watermark`、`search`、`options`；也支持 `mountViewer(...)` | `viewer-ready`、`viewer-event`、`viewer-state-change`、`viewer-error`、`onEvent`、`onStateChange`、`controller.subscribe()` | Custom Element 实例暴露完整 controller handle；IIFE script 标签会自动注册元素，同时保留 `mountViewer` 命令式挂载和资源复制 CLI。 |
| Vue 3 `@file-viewer/vue3` | `url`、`file`、`options` | `load-start`、`load-complete`、`unload-start`、`unload-complete`、`operation-before`、`operation-cancel`、`operation-availability-change`、`search-change`、`location-change`、`zoom-change` | 模板 `ref` 暴露 `FileViewerExpose`；适合声明式接入。`Blob` / `ArrayBuffer` 建议包装成带扩展名的 `File` 后传给 `file`。 |
| Vue 2.7 `@file-viewer/vue2.7` | `url`、`file`、`buffer`、`name`、`filename`、`type`、`size`、`options`、`containerClass`、`containerStyle` | `viewer-event` / `viewerEvent` | 组件实例暴露 controller handle 全量方法；适合 Vue 2.7 项目和历史 `@flyfish-group/file-viewer` 平滑升级。 |
| Vue 2.6 `@file-viewer/vue2.6` | 同 Vue 2.7 | `viewer-event` / `viewerEvent` | 独立 Vue 2.6 构建，不要求业务升级到 Vue 2.7。 |
| React `@file-viewer/react` | `ViewerMountOptions` + `div` 原生属性，如 `className`、`style`、`data-*`、`aria-*` | `onEvent`、`onStateChange` | `ref` 暴露 `FileViewerHandle`；`useFileViewer()` 会返回 `ref`、`props`、`state`、`handle`，便于自定义工具栏。 |
| React Legacy `@file-viewer/react-legacy` | 同 React 标准包 | `onEvent`、`onStateChange` | 面向 React 16.8 / 17；组件名和默认导出保持 legacy 生态友好。 |
| jQuery `@file-viewer/jquery` | `$(el).fileViewer(ViewerMountOptions & { replace?: boolean })` | `onEvent`、`onStateChange` 或 `getFileViewerController(el).subscribe()` | 插件方法支持 `zoomIn`、`printRenderedHtml`、`searchDocument` 等；`replace:false` 可在同一节点上原地更新。 |
| Svelte `@file-viewer/svelte` | `ViewerMountOptions` + `className`、`containerStyle` | `on:viewerEvent`、`onEvent`、`onStateChange` | `bind:this` 暴露 controller handle；也提供 `use:fileViewer` action，action 额外支持 `replace`。 |

内置工具栏可直接使用，也可以通过 `toolbar:false` 进入 headless 操作模式，自行用组件 ref、hook、controller、action 或 jQuery plugin method 组装业务工具栏。

| 工具栏配置 | 说明 |
| --- | --- |
| `toolbar: false` | 隐藏内置工具栏，但不关闭下载、打印、导出、缩放等 controller API，适合完全自定义业务工具栏。 |
| `toolbar: true` | 使用默认内置工具栏，下载、打印、HTML 导出和缩放按钮都会按能力动态显隐。 |
| `download` / `print` / `exportHtml` / `zoom` | 表达业务是否允许展示对应按钮；最终仍会结合文件类型、渲染完成状态、导出适配器和缩放 provider 计算真实可用性。 |
| `position` | `auto`、`top`、`bottom-right`。默认 `auto`，PDF 自动悬浮右下角，减少和 PDF 自身页码 / 目录工具栏冲突。 |
| `beforeOperation` | 工具栏层统一前置校验，会在 `options.beforeOperation` 后执行。返回 `false` 或抛错都会取消本次操作。 |
| `beforeDownload` / `beforePrint` / `beforeExportHtml` | 单按钮前置校验；适合下载权限、打印审计、导出水印确认等细粒度业务规则。 |

共享格式矩阵当前声明 24 条预览链路、206 个扩展名。完整能力通过 renderer / preset 按需装配，格式说明见本文“支持格式”和官方文档: https://doc.file-viewer.app/guide/formats
<!-- FILE_VIEWER_PUBLIC_GENERATED:END -->

## 支持项目与商业版

Flyfish Viewer 会持续保持 Apache-2.0 开源。开源版适合通用 Web 预览、内网部署、业务附件中心和轻量级集成；如果你需要更高还原度、更极致性能、私有化交付、定制适配或优先技术支持，可以通过下面入口请我们喝杯柠檬水，也可以了解商业版原生文档引擎。

- 打赏与优先支持: [dev.flyfish.group/shop](https://dev.flyfish.group/shop)
- 商业版介绍: [product.flyfish.group](https://product.flyfish.group/)
- 商业版 Demo: [office.flyfish.dev](https://office.flyfish.dev/)
- 飞鱼开源工作室: [flyfish.dev](https://flyfish.dev/)

| 微信赞赏码                                                                       | 支付宝收款码                                                                | 微信公众号二维码                                                                                     | 用户交流群                                                                                           |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| <img src="docs/_media/support/wechat-reward.jpg" width="150" alt="微信赞赏码" /> | <img src="docs/_media/support/alipay.jpg" width="150" alt="支付宝收款码" /> | <img src="docs/_media/support/wechat-mp.png" width="150" alt="飞鱼开源 WorkShop 微信公众号二维码" /> | <img src="docs/_media/support/community-qr.png" width="150" alt="Flyfish Viewer 用户交流群二维码" /> |

商业版来自 Flyfish Office 产品线，面向严肃企业场景提供自研原生 Office 文档引擎，重点解决 Word、Excel、PowerPoint 在复杂版式、大文件、分页布局、高保真渲染和稳定性能上的更高要求。开源版会继续维护，商业支持主要用于更快响应、私有化评估和定制交付。

## 接入路线

一个组件，一行代码，快速集成。无论是 Vanilla JS、Vue、React、jQuery 还是 Svelte，都优先选择对应的标准组件包，让底层格式能力保持一致、上层接入方式保持原生。

### 1. Vanilla JS / Pure Web 集成

适合非框架页面、微前端壳、传统后台、低代码平台和任意希望直接通过原生 Web 组件接入的系统。`@file-viewer/web` 同时提供 `<flyfish-file-viewer>`、`mountViewer(container, options)`、IIFE script 标签包和资源复制 CLI。

```bash
npm install @file-viewer/web
```

```html
<flyfish-file-viewer
  src="https://example.com/demo.pdf"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:100vh"
></flyfish-file-viewer>

<script type="module">
  import { defineFileViewerElement } from '@file-viewer/web'

  defineFileViewerElement()
</script>
```

完整的 script 标签、Custom Element、`mountViewer` 和离线资源复制说明见 [纯 JS 集成文档](https://doc.file-viewer.app/guide/quickstart-web)。

### 2. Vue 3 组件集成

适合已经在 Vue 3 项目里开发，希望最短路径完成接入的团队。Vue3 标准组件包 直接使用共享 core 能力，并承担 Vue 生态内的插件安装、组件 props、ref API 和类型出口。

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

### 3. Vue 2 组件集成

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
  render: (h) => h(App)
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

### 4. React 子工程

React 标准包走 native controller，直接在业务页面挂载完整预览器。React 16.8 / 17 老项目可使用 `@file-viewer/react-legacy`。

```bash
npm install @file-viewer/react
```

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer url="https://example.com/demo.docx" />
    </div>
  )
}
```

`@file-viewer/react` 支持 React 17 / 18 / 19，内部使用本包本地 controller 调用 `@file-viewer/core` 与 core browser engine，不依赖纯 Web 组件实现。鉴权文件仍建议由宿主系统先下载成 `Blob`，再用 `file` + `name` 交给预览器。资源复制命令仍保留，用于 worker/WASM 和示例资源的自托管分发；标准组件包接入不需要额外的静态页面地址。

本仓库内置了一个组件演示应用，覆盖 Vanilla JS / Pure Web helper、React 组件、jQuery 和 Svelte 入口。调试时直接运行:

```bash
pnpm dev:components
```

打开本地地址即可验证 Vanilla JS `mountViewer` 和 React 组件的 native 预览效果。验证静态部署产物时运行:

```bash
pnpm build:component-demo
pnpm --filter @flyfish-group/file-viewer-component-demo preview
```

确认无误后，`apps/component-demo/dist` 可以作为普通静态目录部署；其中只包含 Vanilla JS / Pure Web、React、Vue3、jQuery、Svelte 和 script 标签接入示例。正式在线预览站和文档比对入口由 `apps/viewer-demo` 承载。

### 5. Docker 一键部署

适合内网、私有云、客户现场或希望直接运行完整 Demo 的场景。镜像发布后可直接运行:

```bash
docker run -d \
  --name flyfish-viewer \
  --restart unless-stopped \
  -p 8080:80 \
  flyfishdev/file-viewer:latest
```

访问:

- 主预览: `http://localhost:8080/`
- 文档比对: `http://localhost:8080/compare.html`

源码仓库内也提供 `Dockerfile`，本地构建运行:

```bash
pnpm docker:build
docker run --rm -p 8080:80 flyfishdev/file-viewer:latest
```

## 使用说明

- 组件支持两条主要输入路径: `url?: string` 与 `file?: File`
- 独立文档比对页位于 `/compare.html`，可通过 `?left=/example/test.doc&right=/example/word.docx` 预置左右文件；它支持同步滚动、当前聚焦文档的浮层搜索、高亮命中、上一个 / 下一个、行级定位和 PDF 工具栏隐藏，但只做视觉并排预览，不做语义 diff，完整说明见 [Demo 文档](docs/guide/demo.md#文档比对页)
- 当 `file` 和 `url` 同时存在时，会优先渲染 `file`
- 如果业务侧拿到的是 `Blob` 或 `ArrayBuffer`，推荐先包装成带扩展名的 `File`
- 预览器会填满父容器，请为父容器提供稳定高度
- 使用 `url` 预览时，目标资源需要允许浏览器访问；跨域场景下需要正确配置 CORS
- 如果下载地址本身没有明确扩展名，建议先在业务侧取回文件，再包装成 `File`
- PPTX 渲染器已拆分为独立包 `@file-viewer/pptx` / `flyfish-dev/pptxjs`，会尽量还原常见组合图形、旋转/翻转、主题背景、图片裁剪和 EMF 矢量图片；复杂 Office 特效仍建议用真实业务文件做回归
- OFD、Typst、XMind、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、绘图、EPUB、UMD、PDF、Office、Markdown、音视频、HLS、HEIC、字体/数据资产和代码高亮渲染器都按需异步加载，只有命中格式时才拉取对应代码块；Typst compiler / renderer WASM 可通过 `options.typst.compilerWasmUrl`、`options.typst.rendererWasmUrl` 指向自托管地址，默认仅在打开 `.typ` / `.typst` 时加载
- 按需装配可通过 `options.builtinRenderers` 控制 core 内置集合: `lite` 只启用图片等低成本原生链路，`none` 适合完全由 `renderers` / preset 显式装配；轻量附件可用 `@file-viewer/preset-lite`，办公文档可用 `@file-viewer/preset-office`，工程附件可用 `@file-viewer/preset-engineering`，完整 Demo 能力使用 `@file-viewer/preset-all`；UMD / EPUB 电子书均由 `@file-viewer/renderer-ebook` 按需提供
- `options.archive` 一般只需要配置 `cache`、`workerTimeoutMs` 和体积上限；预览器会先尝试当前部署 base 下的 `vendor/libarchive/worker-bundle.js`。手机 WebView、本地临时服务器、MIME 或 CSP 导致 Worker 初始化超时时，会继续降级到 ZIP/TAR/GZIP 兼容模式，避免压缩包一直停在 loading。只有静态目录、CDN 路径或 WASM 位置特殊时，才需要显式传 `archive.workerUrl` / `archive.wasmUrl`
- 表格列宽拖拽通过 `options.spreadsheet.resizableColumns: true` 显式开启，默认关闭以保持历史交互兼容；官方 Demo 默认开启，方便查看被截断的长文本
- `options.theme` 支持 `light`、`dark`、`system`，默认继续跟随系统；DOCX 由 `@file-viewer/renderer-word` 内部 `@file-viewer/docx` Worker 解析、真实浏览器 DOM 渲染、连续流式阅读、目录字段缓存和异步分批挂载，可通过 `options.docx.workerUrl`、`options.docx.workerJsZipUrl` 覆盖离线资源路径；如业务明确需要页式预览，可显式设置 `options.docx.visualPagination: true`；Excel/XLSX 默认使用主线程解析，避免本地服务器、手机 WebView、MIME 或 CSP 导致 Worker 卡住，确实需要静态 Worker 时再传 `options.spreadsheet.worker: true` 和 `options.spreadsheet.workerUrl`；`options.pdf.workerUrl` 可覆盖 PDF.js Worker，适合内网、离线或 CSP 较严的私有化部署；`options.watermark` 支持文字或图片水印；`options.toolbar` 可控制下载原文件、打印完整渲染结果、导出 HTML、统一缩放按钮和操作栏位置，`toolbar.zoom` 可单独控制缩放按钮显示，`toolbar.position` 支持 `auto`、`top`、`bottom-right`，PDF 默认悬浮到右下角以避开自身导航栏；统一缩放通过渲染器内部 provider 适配 PDF、Word、PPTX、Excel 虚拟表格、图片、CAD、OFD、Typst、Markdown、代码和绘图等链路，避免业务侧外层 CSS 缩放造成表格坐标或 canvas 交互偏移；Excel 多 sheet 时标签栏按内容宽度展示并横向滚动，不会被平均压缩；`options.pdf.toolbar` 可隐藏 PDF 自身页码缩放工具栏；`options.search` 可控制搜索高亮、整词/大小写和命中数量；`options.ai` 可开启文本切片结构，返回行号、页码、锚点和 label 等溯源字段，便于业务侧做向量化、召回、AI 摘要、高亮回填和来源定位；`options.hooks` 可接收加载/卸载生命周期；`options.beforeOperation` 可在下载、打印、导出和缩放前做权限校验；打印按钮会结合当前文件类型、渲染完成状态和导出适配器动态显隐，Word / PDF 会生成完整页面，Excel 等虚拟表格会隐藏打印按钮，避免只打印当前视口或第一页

```ts
const blob = await response.blob()
const file = new File([blob], 'contract.pdf', { type: blob.type })
```

## 本地开发

下面的命令适用于开源总仓库和私有 Gitea 完整聚合仓。GitHub / Gitee 会公开 core、独立渲染引擎包、Demo、标准组件包、兼容包和文档站源码；私有 Gitea 提供完整聚合仓、统一发布脚本、内部自动化和优先技术支持。普通用户仍建议优先通过 npm、开源总仓库 `dist/` 或 `artifacts/` 里的 tarball 使用。

```bash
pnpm install
pnpm dev
```

常用脚本:

- `pnpm build`: 构建示例站点
- `pnpm build:vue3`: 构建 Vue3 标准组件包产物
- `pnpm docs:dev`: 启动 VitePress 文档站
- `pnpm docs:build`: 构建文档站
- `pnpm type-check`: 执行 TypeScript 类型检查
- `pnpm dev:components`: 启动 React + 纯 JS 组件 Demo
- `pnpm build:component-demo`: 构建 组件 Demo
- `pnpm docker:build`: 构建本机架构 Docker 镜像
- `pnpm docker:publish`: 推送 Docker Hub `linux/amd64` / `linux/arm64` 多架构镜像；可通过 `DOCKER_IMAGE` 替换命名空间
- `pnpm release:ecosystem:list`: 列出当前完整生态 npm 发布目标
- `pnpm release:ecosystem:pack`: 构建并打包 core、标准组件包 和历史兼容 npm tarball

## 打包发布

Vue3 和 Vue2 发包时分别在对应分支执行同一套发布链路:

| 包         | 分支                                 | npm 名称                                                                                                                    |
| ---------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Vue3       | `v3`                                 | `@flyfish-group/file-viewer3`                                                                                               |
| Vue2.7     | `v2`                                 | `@flyfish-group/file-viewer`                                                                                                |
| Core       | `packages/core` / `file-viewer-core` | `@file-viewer/core`                                                                                                         |
| React      | 当前仓库子工程                       | `@file-viewer/react` / `@flyfish-group/file-viewer-react`                                                                   |
| 纯 JS      | 当前仓库子工程                       | `@file-viewer/web` / `@flyfish-group/file-viewer-web`                                                                       |
| 其他组件包 | 当前仓库子工程                       | `@file-viewer/vue2.7` / `@file-viewer/vue2.6` / `@file-viewer/react-legacy` / `@file-viewer/jquery` / `@file-viewer/svelte` |

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

- `apps/viewer-demo/dist/` 是正式在线 Demo 和文档比对页的部署产物
- `packages/components/vue3/dist/` 是 Vue3 标准组件包构建产物；执行 `pnpm obfuscate` 后会对其中的 `.js` / `.mjs` 进行压缩混淆
- `pnpm build` 会生成可独立部署的 Demo 静态站点产物
- `docs/.vitepress/dist/` 是文档站静态产物
- `npm pack` 会生成可直接发布或分发的 npm 包 tarball

如果只是准备 npm 包，可以直接执行:

```bash
pnpm release:ecosystem:pack
```

完整生态包发布前执行:

```bash
pnpm type-check:components
pnpm build:component-demo
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

开源总仓库会提交 core、Demo、标准组件包、兼容包、文档源码，同时保留可直接使用的构建产物、示例文件和 npm tarball。为避免 Gitee 因历史二进制膨胀超过 1GB，同步 Gitee 时会使用最新完整快照的干净历史。私有 Gitea 仍作为完整聚合仓，保留统一发布脚本、内部集成历史和优先技术支持；需要支持项目或获得优先协助的用户，可以前往 [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)，请我们喝杯柠檬水。

## 文档导航

- [文档导览](https://doc.file-viewer.app/guide/)
- [快速开始](https://doc.file-viewer.app/guide/quickstart)
- [Demo 说明](https://doc.file-viewer.app/guide/demo)
- [组件用法](https://doc.file-viewer.app/guide/usage)
- [支持格式](https://doc.file-viewer.app/guide/formats)
- [本地开发与打包](https://doc.file-viewer.app/guide/development)
- [Docker 部署](https://doc.file-viewer.app/guide/docker)

## 开源说明

本项目使用 `Apache-2.0` 许可证。

二开或商用时，请按许可证要求保留版权、许可证和来源说明，并注明项目来源为 Flyfish Viewer / `@flyfish-group/file-viewer3` 或 `@flyfish-group/file-viewer`。如果你基于本项目修复了通用问题或增强了通用能力，也欢迎通过 issue / PR 一起贡献回来，让这套预览能力继续变得更稳。

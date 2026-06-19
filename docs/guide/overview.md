# 概述

Flyfish Viewer 可以为业务系统快速补齐文件在线预览能力。它不同于依赖后端转码的方案，核心解析和渲染都在浏览器端完成，不会额外占用服务器执行 Office 转 PDF、临时文件清理或异步转换任务。

这让它特别适合静态部署、内网私有化、低运维成本和多系统复用场景。查看[快速开始](/guide/quickstart)可以直接跑通第一个预览示例。

## 当前能力

<div class="doc-grid">
  <div class="doc-card">
    <h3>多格式预览</h3>
    <p>内置 194 个扩展名映射和 23 条预览链路，覆盖 Word、Excel、PowerPoint、PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、图片、音视频、字体、设计资产、结构化数据以及代码/文本。</p>
  </div>
  <div class="doc-card">
    <h3>纯前端渲染</h3>
    <p>大部分格式不需要后端转码服务。业务侧只需要提供可访问 URL、File 或二进制数据包装后的 File。</p>
  </div>
  <div class="doc-card">
    <h3>按需异步加载</h3>
    <p>PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、绘图、Office、EPUB、UMD、Markdown、HLS、HEIC、字体/数据资产和代码高亮都按需进入对应预览链路，减少无关格式的加载成本。</p>
  </div>
  <div class="doc-card">
    <h3>多接入路线</h3>
    <p>Vue3、Vue2.7、React、纯 JS、jQuery 和 Svelte 都有对应 npm 包；标准组件包复用同一套 core / core native engine，并提供各自生态的组件体验。</p>
  </div>
</div>

## 优势

- **交付边界清楚。** 组件、Demo、文档站、开源总仓库、npm tarball 和构建脚本都围绕开源分发维护，接入方可以先验收效果再决定集成方式。
- **视觉体验更接近真实阅读。** Word 文档使用灰色页面底和白色纸张；PDF 提供缩放、页码、导航窗格和可视宽度自适应，避免打开后内容被挤压或不可读。
- **格式策略务实。** PPTX 重点增强组合图形、主题背景、图片裁剪和 EMF 矢量图片；OFD 基于 `DLTech21/ofd.js` 源码链路预览；Typst 直接读取 `.typ` / `.typst` 源文件，命中格式时才加载浏览器 WASM 编译与 SVG 渲染链路；压缩包用 `libarchive.js` Worker 按需解压内部文件；邮件用 `postal-mime` / `@kenjiuno/msgreader` 解析正文和附件，并兼容 MBOX 归档；OLB/DRA 用 `cfb` 做结构树、对象候选、属性和诊断预览；CAD 使用 `@flyfish-dev/cad-viewer` 支持 DWG / DXF / DWF / DWFx / XPS，DWG 通过 Worker + LibreDWG WASM 按需解析，DWF/DWFx/XPS 通过 native `dwf-viewer` 渲染 W2D/W3D/XPS 图形；地理数据通过 GeoJSON 标准化做离线 SVG 预览；3D 模型基于 Three.js 支持常见浏览器可渲染格式；Excalidraw 和 draw.io 使用官方预览能力；EPUB 使用 `epubjs`；UMD 电子书按文件结构解析元数据、目录和 zlib 正文段；音视频使用原生媒体能力并按需补 HLS/MIDI 解析；代码/日志使用 `highlight.js` 轻量高亮，HTML 按源码展示；字体、PSD、SQLite、WASM、Parquet、Avro 和 WebArchive 以安全摘要或结构预览为主。内置 CAD、3D、绘图、压缩包、邮件、EDA、Typst、UMD、音视频、地理数据和结构化数据回归样例来源清楚，方便复现实文件兼容问题。
- **适合平台复用。** 多个系统可以共用同一套 core 能力和 组件语义，只要升级对应 npm 包即可统一更新预览能力。
- **Vue2 / Vue3 / React / 纯 JS 同步维护。** Vue3 包是 `@file-viewer/vue3@2.0.0` / `@flyfish-group/file-viewer3@2.0.0`，Vue2 包是 `@file-viewer/vue2.7@2.0.0` / `@flyfish-group/file-viewer@2.0.0`，React 包是 `@file-viewer/react@2.0.0` / `@flyfish-group/file-viewer-react@2.0.0`，纯 JS 包是 `@file-viewer/web@2.0.0` / `@flyfish-group/file-viewer-web@2.0.0`。各标准组件包 都使用原生挂载方式，保持一致 options、事件和类型语义。
- **二开路径明确。** 开源总仓库提供 core、标准组件包、Demo、文档和 release 下载物；飞鱼小铺作为打赏和优先技术支持入口，避免把源码分发和服务支持混在一起。

## 关键特性

| 能力 | 说明 |
| --- | --- |
| Word | `docx` 使用 `docx-preview` + 可选静态 Worker，`.doc` 使用 `msdoc-viewer`，保留文档页面感 |
| Excel | 多种表格格式统一进入表格预览链路，保留常见尺寸、合并和样式 |
| PowerPoint | PPTX 增强组合图形坐标、旋转/翻转、主题背景、图片裁剪和 EMF 矢量图预览 |
| PDF | 基于 `pdfjs-dist`，同源 URL 默认渐进读取，服务端支持 Range 时自动分片加载，支持缩放工具栏、页码状态、导航窗格、宽度适配、完整打印和导出 HTML |
| 操作栏 | 支持下载原文件、打印完整渲染结果、导出渲染后 HTML、统一缩放，以及文字或图片水印；打印和缩放按钮会按当前格式和渲染链路动态显隐 |
| OFD | 使用 `DLTech21/ofd.js` 源码链路，重型能力按需加载 |
| Typst | 直接读取 `.typ` / `.typst` 源文件，按需加载浏览器 WASM 编译与 SVG 渲染链路，支持按页预览、打印和 HTML 导出 |
| 压缩包 | 使用 `libarchive.js` Worker 读取目录，内部文件按需解压、缓存并继续在线预览 |
| 邮件 | EML / MSG / MBOX 支持头信息、HTML/文本正文、附件下载和附件继续预览 |
| EDA | OLB / DRA 使用 CFB 容器解析、结构树、对象候选、属性和可读字符串索引，适合结构初筛 |
| CAD | 使用 `@flyfish-dev/cad-viewer`，支持 DWG / DXF / DWF / DWFx / XPS 预览；DWG 通过 Worker + LibreDWG WASM 按需解析，DWF/DWFx/XPS 通过 native renderer 渲染 |
| 地理数据 | GeoJSON / KML / GPX / SHP 转为统一 GeoJSON 后离线 SVG 预览，适合轨迹、边界和点位附件 |
| 3D 模型 | 使用 Three.js 交互渲染 GLTF/GLB、OBJ、STL、PLY、FBX、DAE、3DS、3MF、AMF、USD/USDZ、KMZ、点云和 VTK 等格式 |
| 绘图 | Excalidraw 使用官方 `restore` + `exportToSvg`，draw.io 使用官方 diagrams.net `GraphViewer` |
| 电子书 | EPUB 使用 `epubjs`，UMD 解析移动电子书封装、目录和压缩正文 |
| 代码/文本 | 使用 `highlight.js` 高亮多语言源码、日志、配置、Notebook、HTTP、Graphviz、Proto、HCL、TeX 和 diff |
| 图片/音视频 | 图片使用浏览器原生能力和轻量查看器，HEIC/HEIF 按需转换，音频、MIDI、MP4、WEBM 和 HLS 按类型选择原生能力或轻量解析器 |
| 字体/设计/数据 | 字体、PSD、AI/EPS、SQLite、WASM、Parquet、Avro 和 WebArchive 以安全结构摘要和小样本预览为主 |

## 开源总仓库与支持

开源总仓库用于分发 core、标准组件包、兼容包、主 Demo、组件 Demo、文档源码、构建产物、示例和 release tarball。私有 Gitea 继续作为完整聚合仓，提供统一发布脚本、内部集成历史和优先技术支持；需要支持项目或获得优先协助的用户，可以前往 [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop)，请我们喝杯柠檬水。

项目遵循 `Apache-2.0` 许可证。二开或商用时，请保留许可证、版权和来源说明，并注明项目来源为 Flyfish Viewer / `@flyfish-group/file-viewer3` 或 `@flyfish-group/file-viewer`。如果你基于项目修复了通用问题或增强了通用能力，也欢迎一起贡献。

<div class="doc-shot">
  <img src="/_images/demo-doc.png" alt="DOC 文档按 Word 风格展示" />
  <p class="doc-caption">Word 预览在视觉上回到灰色工作台与白色纸张的阅读模型，用户打开正式文档时会更接近熟悉的文档软件体验。</p>
</div>

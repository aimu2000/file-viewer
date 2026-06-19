# Demo 说明

<div class="doc-kicker">See It Before You Ship It</div>

<p class="doc-lead">
  一个好用的 Demo，不只是“给别人看看”，也是团队内部确认能力边界、联调文件样本和复现问题的最快入口。
  当前仓库已经为所有已注册格式准备了可切换入口，适合在本地开发、依赖升级和上线前做完整回归。
</p>

## 本地可用的两个入口

| 入口 | 地址 | 适合做什么 |
| --- | --- | --- |
| 主示例页 | `/` | 切换预置文件、上传本地文件、快速确认各类格式表现 |
| 文档比对页 | `/compare.html` | 左右并排预览两份文档，支持示例、URL、本地上传、交换、重置、同步滚动、聚焦文档浮层搜索和行级定位 |
| 组件 Demo | `apps/component-demo` | 同时验证 React、Pure Web、Vue3、jQuery、Svelte 和 script 标签接入 |

## 主示例页

主示例页内置了完整示例列表，包括 Word、Excel、PPT、PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、代码/文本、图片、音视频、字体/设计资产和结构化数据。示例选择器按文件类型分组展示，每个样例都提供图标、格式名和文件名，点击后会立即打开并自动收起选择器。它适合做三件事:

- 快速演示当前项目支持哪些文件类型
- 用本地上传验证 `file` 方案
- 在修改渲染逻辑后做肉眼回归检查

<div class="doc-shot">
  <img src="/_images/demo-main.png" alt="主示例页截图" />
  <p class="doc-caption">主示例页提供分组样例文件盒子、URL 预览和上传预览，是最直接的联调入口。</p>
</div>

## 文档比对页

文档比对页是独立入口，不会出现在主预览流程里，也不会改变 `FileViewer` 组件本身的默认工具栏。它适合让用户快速核对两份附件的版式差异，例如旧版合同与新版 Word、PDF 与源文档、PPTX 不同版本或 Markdown 与导出物。

直接访问:

```text
/compare.html
```

生产环境体验地址:

```text
https://viewer.flyfish.dev/compare.html
```

也可以用查询参数预置左右文件:

```text
/compare.html?left=/example/test.doc&right=/example/word.docx
```

当前支持的查询参数只有两个，文档中不建议额外扩展临时参数，避免和后续组件 API 冲突:

| 参数 | 说明 | 示例 |
| --- | --- | --- |
| `left` | 左侧面板初始文件 URL，支持同源相对路径或浏览器可访问的绝对 URL | `/example/test.doc` |
| `right` | 右侧面板初始文件 URL，支持同源相对路径或浏览器可访问的绝对 URL | `/example/word.docx` |

页面提供三种输入方式，左右两侧互不影响:

- 内置示例: DOC、DOCX、PDF、PPTX、Typst、Markdown，可快速演示常见文档差异
- URL 输入: 粘贴业务文件地址后点击预览，适合联调带签名的临时文件链接
- 本地上传: 直接选择本机文件，适合客户现场复现和售前演示

比对页顶部提供“同步滚动”“隐藏 PDF 工具栏”“交换”“重置”和行号定位。同步滚动按两侧真实滚动容器的滚动比例联动，不要求两份文档页数完全一致；搜索采用和主预览一致的轻量浮层交互，先聚焦左侧或右侧文档，再用浏览器常见查找快捷键呼出搜索框，命中只作用于当前聚焦文档，避免两侧同时滚动导致视线丢失。行级定位会复用预览器抽取出的通用锚点，文本类文档通常定位到段落/行块，PDF 会优先使用可用文本层和页面锚点。

PDF 在比对页中默认隐藏自身阅读工具栏，只保留正文和可滚动页面，避免左侧 Word / Markdown 与右侧 PDF 因多一条页码缩放栏而错位。需要查看 PDF 页码、缩放、旋转或目录时，可以关闭“隐藏 PDF 工具栏”开关。

为了保持左右对照清晰，比对页默认关闭每个预览器通用操作栏。如果需要下载、打印、导出 HTML、水印或业务权限钩子，请使用主预览入口或在业务侧基于 `FileViewer` 组件自定义比对容器。

私有化部署时，`pnpm build-only` 产物、Docker 镜像和开源总仓库的 `demo/` 目录都会包含同一个入口:

```text
demo/compare.html
```

上线前建议至少验证下面两条:

```bash
pnpm verify:demo-output
```

```text
/compare.html?left=/example/test.doc&right=/example/word.docx
```

这项功能做的是视觉并排预览，不是语义 diff。它不会自动标红文本改动，也不会解析 Office 修订痕迹；如果需要合同逐字差异、表格单元格差异或 PDF OCR 差异，请在业务侧接入专门的 diff 服务，再把结果作为文件或 HTML 交给预览器展示。预览器已经提供 `collectDocumentAnchors()`、`scrollToLine()`、`scrollToAnchor()`、`searchDocument()` 和 `getDocumentTextChunks()`，业务侧可以基于这些通用结构继续实现 AI 溯源、向量化召回、命中高亮、来源定位和审计记录。

## Word 页面效果

Word 示例被单独拿出来说明，因为它已经不只是“能打开”，而是具备更明确的页面感。`.doc` 和 `.docx` 都会尽量保留灰色页面底、白色纸张、页面居中和宽度自适应的阅读体验。

<div class="doc-shot">
  <img src="/_images/demo-doc.png" alt="DOC 文件渲染截图" />
  <p class="doc-caption">Word 文件会显示在灰色工作台中的白色纸张上，页面居中，阅读体验更接近真实文档。</p>
</div>

## React / 纯 JS 组件 Demo

仓库中的 `apps/component-demo` 会同时挂载 React 组件、Pure Web controller、Vue3 组件、jQuery 组件、Svelte action 和普通 script 标签全局包，用同一份 DOCX 示例验证 组件原生挂载、生命周期事件、文件输入和资源加载。调试时运行:

```bash
pnpm dev:components
```

构建上线前运行:

```bash
pnpm build:component-demo
pnpm --filter @flyfish-group/file-viewer-component-demo preview
```

如果开发服务和 build preview 中各个面板都能显示同一份 DOCX 示例，就说明 React 组件、纯 JS `mountViewer`、jQuery、Svelte 和 script 标签全局包都可用。

## 示例文件清单

仓库中当前提供的示例文件位于 `apps/viewer-demo/public/example/`:

代码、配置和日志类样本已经按真实集成场景扩充，不再只是几行占位内容；它们会覆盖注释、函数、类型、嵌套配置、SQL CTE、Shell 参数、diff 块和长内容滚动，适合验证代码高亮的实际可读性。`word.docx` 使用 Basel Convention 公开中文正式文档，`ppt.pptx` 使用 R4Psy 公开中文课程课件，`markdown.md` 使用更丰富的长内容样例，`pdf.pdf` 使用项目方提供的 13 页《PDF沉浸式翻译技术说明》，`report.typ` 使用项目内编写的多页 Typst 源文件报告，用于验证浏览器端直接编译、按页预览、打印和 HTML 导出链路。CAD、3D、绘图、音频和 EPUB 样本使用公开文件或项目内最小夹具，UMD 电子书样本由项目内生成，来源记录在 `apps/viewer-demo/public/example/SOURCES.md`。

| 文件 | 用途 | 对应能力 |
| --- | --- | --- |
| `test.doc` | 验证老 Word 文档链路 | `doc` + Word 风格页面容器 |
| `word.docx` | Basel Convention 公开中文正式文档，验证现代 Word 长文档、标题层级、表格、图示、白色纸张和完整打印 | `docx` |
| `excel.xlsx` | 验证表格样式链路 | `xlsx` |
| `excel.xlsm` | 验证宏工作簿扩展名映射 | `xlsm` |
| `excel.xlsb` | 验证二进制工作簿扩展名映射 | `xlsb` |
| `excel.xls` | 验证老 Excel 扩展名映射 | `xls` |
| `table.csv` | 验证轻量数据表格链路 | `csv` |
| `excel.ods` | 验证 OpenDocument 表格扩展名映射 | `ods` |
| `excel.fods` | 验证 Flat ODS 扩展名映射 | `fods` |
| `excel.numbers` | 验证 Numbers 扩展名映射 | `numbers` |
| `sample.rtf` | 验证 RTF 富文本兼容预览 | `rtf` |
| `document.odt` | 验证 OpenDocument 文本正文抽取和纸张阅读面 | `odt` |
| `ppt.pptx` | R4Psy 公开中文课程课件，验证多页幻灯片、图片资源、主题背景、组合元素和富文本排版 | `pptx` |
| `slides.odp` | 验证 OpenDocument 演示文稿页面结构和文本预览 | `odp` |
| `pdf.pdf` | 项目方提供的 13 页真实技术说明 PDF，验证多页阅读、缩放工具栏、页面/目录导航窗格、完整打印和 HTML 导出 | `pdf` |
| `ofd.ofd` | 验证 OFD 在线预览 | `ofd` |
| `report.typ` | 验证 Typst 源文件直接读取、浏览器 WASM 编译、按页 SVG 预览、打印和 HTML 导出 | `typ` |
| `drawing.dxf` | 使用公开 DXF 样例验证 CAD 图纸预览、平移、缩放、图层和 WebGL/Canvas fallback | `dxf` |
| `sample.dwg` | 使用公开 DWG 样例验证 Worker + LibreDWG WASM 几何解析和 CAD 视图适配 | `dwg` |
| `samples/apache/blocks_and_tables.dwf` | 使用 Apache Tika 公开 Jira 附件验证原生 DWF 容器、块和表格渲染 | `dwf` |
| `samples/autodesk/house.dwfx` | 使用 Autodesk 官方 Viewer 教程样例验证 DWFx/XPS native renderer、多页结构和 CAD 视图适配 | `dwfx` |
| `samples/autodesk/robot-arm.dwfx` | 使用 Autodesk 官方 Viewer 教程样例验证 W2D/W3D native renderer 和复杂装配图形 | `dwfx` |
| `map.geojson` | 验证 GeoJSON 点线面离线地图预览 | `geojson` |
| `route.kml` | 验证 KML 转 GeoJSON 后预览 | `kml` |
| `track.gpx` | 验证 GPX 轨迹转 GeoJSON 后预览 | `gpx` |
| `model.gltf` | 使用项目内嵌入数据的最小 glTF 验证 Web 3D 预览 | `gltf` |
| `model.obj` | 使用项目内生成的 OBJ 四面体验证 OBJ 几何预览 | `obj` |
| `model.stl` | 使用项目内生成的 STL 四面体验证 STL 几何预览 | `stl` |
| `model.ply` | 使用项目内生成的 PLY 四面体验证 PLY 几何预览 | `ply` |
| `model.step` | 使用项目内生成的最小 STEP 验证工程 CAD 格式转换原因提示 | `step` |
| `flow.excalidraw` | 使用公开 Excalidraw 图纸验证官方恢复与 SVG 导出预览 | `excalidraw` |
| `process.drawio` | 使用官方 draw.io 示例验证 diagrams.net Viewer 预览 | `drawio` |
| `book.epub` | 使用 Project Gutenberg 公开 EPUB 验证电子书目录和滚动阅读 | `epub` |
| `book.umd` | 使用项目内生成的 UMD 电子书验证元数据、目录和 zlib 正文解析 | `umd` |
| `archive.zip` | 验证 ZIP 目录读取、按需解压、缓存和压缩包内文档预览 | `zip` |
| `archive.tar.gz` | 验证 TAR.GZ 压缩包兼容入口和内部文件预览 | `gz` |
| `sample.eml` | 验证 EML 头信息、HTML/文本正文、附件下载和附件预览 | `eml` |
| `sample.msg` | 使用 msgreader 上游公开样例验证 Outlook MSG 解析 | `msg` |
| `sample.mbox` | 验证 MBOX 归档识别和首封邮件预览 | `mbox` |
| `sample.olb` | 使用项目内生成的 CFB 元件库夹具验证 OLB 结构预览 | `olb` |
| `sample.dra` | 使用项目内生成的 CFB 封装图纸夹具验证 DRA 结构预览 | `dra` |
| `markdown.md` | 验证 Markdown 长内容、表格、代码块和明暗主题阅读面 | `md` |
| `notes.markdown` | 验证 Markdown 长扩展名和主题隔离 | `markdown` |
| `text.txt` | 验证纯文本展示 | `txt` |
| `data.json` | 验证 JSON 高亮 | `json` |
| `data.jsonc` | 验证 JSONC 注释配置高亮 | `jsonc` |
| `data.json5` | 验证 JSON5 宽松对象语法高亮 | `json5` |
| `notebook.ipynb` | 验证 Jupyter Notebook JSON 结构预览 | `ipynb` |
| `code.js` | 验证 JavaScript 高亮 | `js` |
| `code.mjs` | 验证 ES Module JavaScript 高亮 | `mjs` |
| `code.cjs` | 验证 CommonJS JavaScript 高亮 | `cjs` |
| `code.ts` | 验证 TypeScript 高亮 | `ts` |
| `code.tsx` | 验证 TSX 高亮 | `tsx` |
| `code.jsx` | 验证 JSX 高亮 | `jsx` |
| `code.css` | 验证 CSS 高亮 | `css` |
| `page.html` | 验证 HTML 源码展示，不作为网页执行 | `html` |
| `page.htm` | 验证 HTM 源码展示，不作为网页执行 | `htm` |
| `data.xml` | 验证 XML 高亮 | `xml` |
| `component.vue` | 验证 Vue 单文件组件高亮 | `vue` |
| `config.yaml` | 验证 YAML 高亮 | `yaml` |
| `config.yml` | 验证 YML 高亮 | `yml` |
| `config.toml` | 验证 TOML 配置高亮 | `toml` |
| `settings.ini` | 验证 INI 高亮 | `ini` |
| `service.proto` | 验证 Protocol Buffers IDL 高亮 | `proto` |
| `infrastructure.hcl` | 验证 HCL 基础设施配置展示 | `hcl` |
| `formula.tex` | 验证 TeX / LaTeX 源码展示 | `tex` |
| `graph.gv` | 验证 Graphviz DOT 源码展示 | `gv` |
| `request.http` | 验证 HTTP 请求片段展示 | `http` |
| `script.sh` | 验证 Shell 脚本高亮 | `sh` |
| `script.bash` | 验证 Bash 脚本高亮 | `bash` |
| `query.sql` | 验证 SQL 高亮 | `sql` |
| `main.go` | 验证 Go 高亮 | `go` |
| `main.rs` | 验证 Rust 高亮 | `rs` |
| `code.rb` | 验证 Ruby 高亮 | `rb` |
| `code.swift` | 验证 Swift 高亮 | `swift` |
| `Main.kt` | 验证 Kotlin 高亮 | `kt` |
| `component.react` | 验证 React 片段入口 | `react` |
| `index.php` | 验证 PHP 高亮 | `php` |
| `main.c` | 验证 C 高亮 | `c` |
| `main.cpp` | 验证 C++ 高亮 | `cpp` |
| `module.cc` | 验证 C++ 兼容扩展名高亮 | `cc` |
| `main.h` | 验证 C/C++ 头文件高亮 | `h` |
| `main.hpp` | 验证 C++ 头文件高亮 | `hpp` |
| `program.cs` | 验证 C# 高亮 | `cs` |
| `change.diff` | 验证 diff 高亮 | `diff` |
| `code.java` | 验证 Java 高亮 | `java` |
| `code.py` | 验证 Python 高亮 | `py` |
| `app.log` | 验证日志文本展示 | `log` |
| `pic.png` | 验证 PNG 图片预览 | `png` |
| `pic.jpg` | 验证 JPG 图片预览 | `jpg` |
| `pic.jpeg` | 验证 JPEG 图片预览 | `jpeg` |
| `pic.gif` | 验证 GIF 图片预览 | `gif` |
| `pic.bmp` | 验证 BMP 图片预览 | `bmp` |
| `pic.tiff` | 验证 TIFF 图片预览 | `tiff` |
| `pic.tif` | 验证 TIF 图片预览 | `tif` |
| `vector.svg` | 验证 SVG 图片预览 | `svg` |
| `pic.webp` | 验证 WEBP 图片预览 | `webp` |
| `audio.mp3` | 使用 MDN CC0 音频验证 MP3 原生播放 | `mp3` |
| `audio.ogg` | 使用 Wikimedia Commons 音频验证 OGG 原生播放 | `ogg` |
| `melody.mid` | 验证 MIDI 轨道、时长和音符摘要 | `mid` |
| `video.mp4` | 验证视频播放 | `mp4` |
| `icon.ico` | 验证 ICO 图标预览 | `ico` |
| `sample.sqlite` | 验证 SQLite 表结构和少量数据行预览 | `sqlite` |
| `module.wasm` | 验证 WASM 模块导入导出摘要 | `wasm` |

<div class="doc-note">
  部分兼容格式示例复用了同一份可解析内容来覆盖扩展名入口，例如表格兼容格式和图片兼容格式。Excel 当前使用虚拟表格展示，打印按钮会按能力自动隐藏，避免只打印当前视口。上线前仍建议使用业务真实文件补一轮回归。
</div>

## 完整覆盖与绘图说明

上面的清单已经覆盖当前注册的主要样例扩展名。CAD 链路已经切到 `@flyfish-dev/cad-viewer` 0.6.4，支持 DWG / DXF / DWF / DWFx / XPS；DWG 会按需加载 viewer assets 中 `wasm/cad/` 下的 Worker 和 LibreDWG WASM，DWF/DWFx/XPS 会按需加载 native renderer 与 `dwfv-render.wasm`。

3D 模型示例覆盖 glTF、OBJ、STL、PLY 四条最常用的浏览器模型入口；FBX、DAE、3DS、3MF、AMF、USD/USDZ、KMZ、PCD、VRML/WRL、XYZ、VTK/VTP 等扩展名也已经注册到同一个 Three.js 预览器。STEP/IGES/IFC/3DM 会展示转换原因，建议用客户真实模型补充回归。

Excalidraw 使用官方 `@excalidraw/excalidraw` 的 `restore` 补齐真实公开文件中常见的精简字段，再通过 `exportToSvg` 生成只读 SVG；draw.io / diagrams.net 文件使用官方 `GraphViewer` 渲染 mxGraphModel / mxfile。组件不自行实现绘图格式解析，只做按需加载、容器挂载和错误提示。

压缩包样例用于验证 `libarchive.js` Worker、目录读取、按需解压、IndexedDB 缓存和内部文件继续预览。邮件样例用于验证 EML / MSG / MBOX 的头信息、正文切换、附件下载和附件预览。地理数据样例用于验证 GeoJSON/KML/GPX 到离线 SVG 地图的链路。OLB / DRA 样例是项目内生成的 CFB 容器，用于验证 EDA 文件结构树、对象候选、属性、诊断和可读字符串索引。SQLite、WASM 和 ICO 样例用于验证资产/数据预览链路不会影响普通文档首屏。

## 公开样例来源

| 示例 | 来源 | 许可 |
| --- | --- | --- |
| `drawing.dxf` | `mozman/ezdxf` 的 `examples_dxf/wipeout_door.dxf` | MIT |
| `word.docx` | Basel Convention 的公开中文正式文档 `UNEP-CHW.15-6-Add.5-Rev.1.Chinese.docx` | 公开下载，需保留来源归属 |
| `ppt.pptx` | `hcp4715/R4Psy` 的 `slides/chapter_1.pptx` 中文课程课件 | CC-BY-4.0 |
| `sample.dwg` | `dshn06/cad-webviewer-unity` 的 `baseline-sample.dwg` | MIT |
| `samples/apache/blocks_and_tables.dwf` | Apache Tika `TIKA-1823` 的 `blocks_and_tables.dwf` Jira 附件 | Apache Software Foundation Jira attachment |
| `samples/autodesk/house.dwfx` | Autodesk `viewer-javascript-tutorial` 的 `Sample files/House.dwfx` 官方样例 | MIT |
| `samples/autodesk/robot-arm.dwfx` | Autodesk `viewer-javascript-tutorial` 的 `Sample files/RobotArm1.dwfx` 官方样例 | MIT |
| `model.gltf` / `model.obj` / `model.stl` / `model.ply` / `model.step` | 项目内生成的最小 3D fixture | Apache-2.0 |
| `flow.excalidraw` | `neo4j-labs/agent-memory` 的 `poleo-model.excalidraw` | Apache-2.0 |
| `process.drawio` | `jgraph/drawio-diagrams` 的 `blog/data-flow.drawio` | Apache-2.0 |
| `book.umd` | 项目内生成的最小 UMD 文本电子书 fixture | Apache-2.0 |
| `archive.zip` / `archive.tar.gz` | 项目内打包的丰富 PDF、公开 DOCX、Markdown、TypeScript 和 JSON 示例集合 | 随内部文件来源 |
| `sample.eml` | 项目内生成的标准 MIME 邮件 fixture | Apache-2.0 |
| `sample.msg` | `HiraokaHyperTools/msgreader` 的 `test/A memo.msg` | MIT |
| `sample.olb` / `sample.dra` | 项目内生成的 CFB EDA fixture | Apache-2.0 |
| `audio.mp3` | MDN interactive examples 的 `t-rex-roar.mp3` | CC0 |
| `audio.ogg` | Wikimedia Commons 的 `Example.ogg` | CC BY-SA 3.0 |
| `book.epub` | Project Gutenberg 的 `Alice's Adventures in Wonderland` EPUB | Public domain in the USA |

这些样例的作用是验证预览器兼容性，不承诺覆盖你业务中所有 CAD 图元、绘图插件、UMD 方言或打包器输出。上线前仍建议把自己的高频文件加入回归清单。

## 建议保留一套自己的回归样本

如果你要把这个项目接进正式业务，建议你把下面这几类文件各留一份，形成自己的最小回归集:

- 一份版式复杂的 `docx`
- 一份历史 `.doc`
- 一份带合并单元格和颜色的 `xlsx`
- 一份兼容格式表格，比如 `xls` 或 `csv`
- 一份业务里最常见的 `pdf`
- 一份真实 OFD 发票或归档件
- 一份 DXF 图纸
- 一份 Excalidraw 或 draw.io 图纸
- 一份 EPUB 或 UMD 电子书
- 一份业务常见压缩包，里面至少包含 PDF、Office 和代码/文本文件
- 一份 EML 或 MSG 邮件，最好带附件
- 一份 OLB 或 DRA，如果业务会接触 EDA 文件
- 一份 Markdown 说明文档
- 一份日志或配置文件，比如 `log` / `json`
- 一份源码文件，比如 `ts` / `py` / `java`
- 一份 `svg` 或 `webp` 图片
- 一份业务常用音频，比如 `mp3` 或 `ogg`

这样每次升级预览器、调整依赖或准备发版时，都能快速知道“这次有没有把关键能力碰坏”。

<div class="doc-note">
  建议你先用仓库内置样本确认主链路，再用自己的真实文件补一轮回归。前者帮你判断“项目本身能不能跑”，后者帮你判断“它能不能真正接住你的业务”。
</div>

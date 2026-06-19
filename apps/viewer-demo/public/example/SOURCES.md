# Public Sample Sources

本目录中的 PDF、DOCX、PPTX、CAD、3D 模型、绘图、音视频、EPUB 和 MSG 示例文件使用项目方提供的真实资料、可追溯的公开样本或项目内最小夹具；RTF、ODT、ODP、地理数据、MIDI、SQLite、WASM、UMD、EML、MBOX、OLB、DRA 和压缩包示例文件由项目内生成，用于固定回归对应结构。后续替换这些文件时，请优先选择许可清楚、可直接访问 raw 文件的公开仓库、国际组织公开文档或项目方明确授权的资料，并同步更新本文件与 `README.md`。

| Local file | Source | License | Purpose |
| --- | --- | --- | --- |
| `drawing.dxf` | `https://github.com/mozman/ezdxf/blob/master/examples_dxf/wipeout_door.dxf` | MIT | Real DXF CAD drawing for pan, zoom and layer smoke tests |
| `word.docx` | `https://www.basel.int/Portals/4/download.aspx?d=UNEP-CHW.15-6-Add.5-Rev.1.Chinese.docx` | Public Basel Convention document, source attribution required | Rich Chinese DOCX preview with headings, long-form text, tables, drawings, responsive white paper and print/export smoke tests |
| `template.dot` | Copied from project `test.doc` fixture and saved with the Word 97-2003 template extension | Apache-2.0 | DOT extension routing smoke test for legacy Word template preview |
| `ppt.pptx` | `https://github.com/hcp4715/R4Psy/blob/main/slides/chapter_1.pptx` | CC-BY-4.0 | Rich Chinese presentation smoke test for slide layout, images, theme styling and media-heavy PPTX rendering |
| `pdf.pdf` | Project-owner provided `PDF沉浸式翻译技术说明.pdf` | Demo distribution authorized by project owner | 13-page PDF toolbar, scale, page/tree sidebar, print, export and dark-shell isolation smoke tests |
| `sample.dwg` | `https://github.com/dshn06/cad-webviewer-unity/blob/main/cad-webview/public/cad-data/data/baseline-sample.dwg` | MIT | Real DWG sample for Worker + LibreDWG WASM geometry smoke tests |
| `samples/apache/blocks_and_tables.dwf` | `https://issues.apache.org/jira/browse/TIKA-1823` attachment `blocks_and_tables.dwf` | Apache Software Foundation Jira attachment | Native DWF 6 container smoke test for blocks, tables, W2D graphics and MIME/header handling |
| `samples/autodesk/house.dwfx` | `https://github.com/Developer-Autodesk/viewer-javascript-tutorial/blob/master/Sample%20files/House.dwfx` | MIT | Official Autodesk Viewer tutorial DWFx sample for native DWFx/XPS rendering, multi-page structure and CAD viewport smoke tests |
| `samples/autodesk/robot-arm.dwfx` | `https://github.com/Developer-Autodesk/viewer-javascript-tutorial/blob/master/Sample%20files/RobotArm1.dwfx` | MIT | Official Autodesk Viewer tutorial DWFx sample for W2D/W3D native rendering and assembly drawing smoke tests |
| `model.gltf` / `model.obj` / `model.stl` / `model.ply` / `model.step` | Project-generated minimal fixtures | Apache-2.0 | Three.js model rendering and engineering-format fallback smoke tests |
| `flow.excalidraw` | `https://github.com/neo4j-labs/agent-memory/blob/main/docs/assets/images/diagrams/excalidraw/poleo-model.excalidraw` | Apache-2.0 | Real Excalidraw scene for official restore/export smoke tests |
| `process.drawio` | `https://github.com/jgraph/drawio-diagrams/blob/dev/blog/data-flow.drawio` | Apache-2.0 | Official draw.io sample for diagrams.net viewer smoke tests |
| `book.umd` | 项目内生成的最小 UMD 文本电子书 fixture | Apache-2.0 | UMD ebook metadata, table-of-contents and zlib text smoke tests |
| `sample.rtf` / `document.odt` / `slides.odp` | Project-generated compatible document fixtures | Apache-2.0 | RTF, ODT and ODP route smoke tests |
| `map.geojson` / `route.kml` / `track.gpx` | Project-generated lightweight geospatial fixtures | Apache-2.0 | GeoJSON, KML and GPX normalization plus offline SVG map smoke tests |
| `report.typ` | Project-generated Typst multi-page fixture | Apache-2.0 | Direct Typst source preview and browser WASM smoke tests |
| `archive.zip` / `archive.tar.gz` | Project-packaged PDF, public DOCX, Markdown, TypeScript and JSON sample set | See bundled file sources | Archive directory, lazy extraction, cache and nested preview smoke tests |
| `sample.eml` | Project-generated MIME email fixture | Apache-2.0 | EML headers, text/html body, attachment download and attachment preview smoke tests |
| `sample.msg` | `https://github.com/HiraokaHyperTools/msgreader/blob/master/test/A%20memo.msg` | MIT | Outlook MSG parsing smoke test through @kenjiuno/msgreader |
| `sample.mbox` | Project-generated MBOX email archive fixture | Apache-2.0 | MBOX message detection and first-message preview smoke tests |
| `sample.olb` / `sample.dra` | Project-generated CFB EDA fixtures | Apache-2.0 | OLB/DRA structure tree, entity, property and readable-string smoke tests |
| `data.jsonc` / `data.json5` / `notebook.ipynb` / `config.toml` / `service.proto` / `infrastructure.hcl` / `formula.tex` / `graph.gv` / `request.http` / `component.react` / `code.rb` / `code.swift` / `Main.kt` | Project-authored source/config fixtures | Apache-2.0 | Expanded highlight.js language mapping smoke tests |
| `melody.mid` / `sample.sqlite` / `module.wasm` / `icon.ico` | Project-generated or favicon-derived fixtures | Apache-2.0 | MIDI, SQLite, WASM and ICO smoke tests |
| `audio.mp3` | `https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3` | CC0 | Small MP3 sample for native audio playback smoke tests |
| `audio.ogg` | `https://commons.wikimedia.org/wiki/File:Example.ogg` | CC BY-SA 3.0 | OGG Vorbis sample for native audio playback smoke tests |
| `book.epub` | `https://www.gutenberg.org/ebooks/928.epub3.images` | Public domain in the USA | EPUB sample for epubjs table-of-contents and paginated reading smoke tests |

运行时说明:

- `sample.dwg` 是真实 DWG 文件；运行时通过 `@flyfish-dev/cad-viewer` 按需加载 DWG Worker 和 LibreDWG WASM，验证浏览器本地 DWG 几何预览链路。
- `samples/apache/blocks_and_tables.dwf` 来自 Apache Tika `TIKA-1823` 的公开 Jira 附件，保留 `(DWF V06.00)PK` 文件头，用于验证原生 DWF 6 ZIP 容器、块、表格、W2D 图形和 MIME/header 识别。
- `samples/autodesk/house.dwfx` 来自 Autodesk 官方 Viewer 教程仓库，用于验证 DWFx / XPS native renderer、图形、多页结构和视图适配；该文件约 17MB，但只在用户选择样例时按需加载。
- `samples/autodesk/robot-arm.dwfx` 同样来自 Autodesk 官方 Viewer 教程仓库，用于验证 W2D/W3D native renderer 和复杂装配图形。
- `word.docx` 来自 Basel Convention 公开中文正式文档，覆盖标题层级、长正文、表格、图示、白色纸张和完整打印回归；该样本保留真实文档复杂度，但避免默认 Demo 首屏触发超大 DOCX 保护。
- `template.dot` 复用 `test.doc` 的二进制内容，仅用于验证 Word 97-2003 模板扩展名能正确进入老 Word 渲染链路。
- `ppt.pptx` 来自 `hcp4715/R4Psy` 的 CC-BY-4.0 中文课程课件，覆盖多页幻灯片、图片资源、主题样式、组合元素和富文本排版。
- `pdf.pdf` 是项目方提供的 13 页真实技术说明 PDF，覆盖缩放、页侧边栏、树形导航、打印、导出和暗色外壳隔离回归。
- `model.gltf`、`model.obj`、`model.stl`、`model.ply` 和 `model.step` 是最小 3D fixture，用于验证 Three.js 预览和工程格式转换提示。
- `flow.excalidraw` 先经过 `@excalidraw/excalidraw` 的官方 `restore`，再用 `exportToSvg` 输出只读预览，以兼容公开样例中常见的精简字段。
- `process.drawio` 由 diagrams.net 官方 `GraphViewer` 解析，组件不自行实现 draw.io 方言解析。
- `audio.mp3` 与 `audio.ogg` 只用于验证浏览器原生音频播放能力；不同浏览器对编码的支持存在差异。
- `melody.mid` 是最小 MIDI fixture，用于验证 `@tonejs/midi` 只在 MIDI 命中时按需加载并展示轨道、时长和音符摘要。
- `book.epub` 来自 Project Gutenberg，运行时由 `epubjs` 解析 EPUB 包、目录和章节资源。
- `book.umd` 由项目内生成，覆盖 UMD 文件头、元数据、章节偏移、章节标题和 zlib 压缩正文段。
- `report.typ` 由项目内编写，覆盖 Typst 标题、表格、公式、代码块、多页输出、页面尺寸和打印/HTML 导出，线上 Demo 会直接读取源文件并通过浏览器端 WASM 编译预览。
- `archive.zip` 与 `archive.tar.gz` 由本目录中的 PDF、DOCX、Markdown、TypeScript 和 JSON 示例打包，用于验证 `libarchive.js` Worker、按需解压、IndexedDB 缓存和内部文件继续预览；其中 DOCX 同步使用当前公开中文 Word 样例。
- `sample.eml` 是标准 MIME fixture，用于验证 EML 头信息、HTML/文本正文和附件链路。
- `sample.msg` 来自 `HiraokaHyperTools/msgreader` 测试样例，用于验证 Outlook MSG 解析。
- `sample.mbox` 是项目内生成的邮件归档 fixture，用于验证 MBOX 归档识别和首封邮件预览。
- `sample.olb` 与 `sample.dra` 是项目内生成的 CFB 夹具，用于验证 OLB / DRA 结构树、对象候选、属性和可读字符串索引。
- `sample.rtf`、`document.odt` 和 `slides.odp` 是项目内生成的兼容文档 fixture，用于验证 RTFJS 与 OpenDocument 包结构读取。
- `map.geojson`、`route.kml` 和 `track.gpx` 是项目内生成的轻量地理数据 fixture，用于验证 GeoJSON/KML/GPX 标准化和离线 SVG 地图预览。
- `sample.sqlite`、`module.wasm` 和 `icon.ico` 用于验证结构化数据、WASM 模块摘要和 ICO 图标预览；`data.jsonc` 等工程文本 fixture 用于验证新增 highlight.js 扩展名映射。

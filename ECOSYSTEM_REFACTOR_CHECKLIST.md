# File Viewer 生态重构 Checklist

> 目标: 以 `@file-viewer/core` 作为唯一纯 TypeScript core 底座，在同一个 core 包内部按 `headless` / `browser` / `renderers` 分层沉淀格式矩阵、资源读取、renderer 协议、能力模型、生命周期上下文、操作 API、搜索/定位/缩放/打印/导出/水印/AI 文本结构契约，以及 framework-neutral DOM/Canvas/Worker/WASM 解析、渲染和呈现能力；Vue、React、React legacy、Vue 2.6、Vue 2.7、Vue 3、Pure JS、jQuery、Svelte 均作为 native standard component packages，只依赖 `@file-viewer/core` 并提供完整参数、生命周期和生态交互体验。旧的独立页面协议不再作为当前仓库正式实现，必要示例只能在独立参考仓库中存在。

## 基线

- 基线分支: `v3`
- 当前根包: `@flyfish-group/file-viewer3@2.0.0`
- 当前 core 包: `@file-viewer/core@2.0.0`
- 当前 core package policy: `single-framework-neutral-core-with-headless-browser-renderers`
- 当前 renderer implementation status: `framework-neutral-core-renderers-migrated`
- 当前 core boundary status: `single-core-renderers-migrated-pending-branch-cutover`
- 当前 core browser renderer ids: `audio`, `video`, `markdown`, `code`, `image`, `umd`, `geo`, `open-document`, `ofd`, `pdf`, `email`, `eda`, `cad`, `typst`, `office-presentation`, `epub`, `model`, `drawing`, `data-asset`, `archive`, `office-word-openxml`, `office-word-binary`, `spreadsheet-openxml`
- 当前支持矩阵: 23 条预览链路、194 个扩展名
- 当前源码远端: `origin -> https://git.flyfish.dev/flyfish-group/file-viewer.git`
- 当前源码远端可见性: `private`
- 公开组织: `flyfish-dev`
- 开源总仓库: `https://github.com/flyfish-dev/file-viewer` / `https://gitee.com/flyfish-dev/file-viewer`
- 开源总仓库策略: `public-open-source-main-repository`
- core source visibility policy: `public-source`
- 标准包命名: `@file-viewer/*`

## 最新外部发布审计

- 实时审计命令: `pnpm audit:ecosystem-status`；最终发布阻断可使用 `node scripts/audit-ecosystem-status.mjs --strict`。
- 源码仓当前状态: 私有 Gitea 聚合仓 `origin/v3` 已完成推送；具体提交以实时审计命令输出为准，避免 checklist 因自我更新产生哈希追尾。
- 开源总仓库: GitHub `flyfish-dev/file-viewer` 与 Gitee `flyfish-dev/file-viewer` 已同步为同一文件树；具体提交和 tree hash 以实时审计命令输出为准。
- 开源总仓库 Release: GitHub Release `v2.0.0` 已创建并维护 18 个资产（core、标准组件包、兼容包、Demo、文档、lib dist 和 `release-manifest.json`）。
- Component GitHub 仓库: core + 8 个标准组件包仓库均已创建并推送 `main`，`pnpm verify:wrapper-public-remotes --host=github` 通过。
- Component Gitee 仓库: core + 8 个标准组件包仓库仍返回 404，`pnpm verify:wrapper-public-remotes --host=gitee` 失败；当前环境没有可用 Gitee token，SSH 账号也不是 `flyfish-dev` 写权限，待有效 Gitee 组织权限后创建并推送。
- Demo / 文档站: 历史 Cloudflare Pages 部署曾完成并指向正式域名；本次开源总仓库定位与治理文档更新后，`viewer.flyfish.dev` 与 `doc.flyfish.dev` 的最新重部署仍待执行。
- npm 发布: `@file-viewer/*` 标准包均仍未发布；历史包当前仍为 `@flyfish-group/file-viewer3@1.0.26`、`file-viewer3@1.0.26`、`@flyfish-group/file-viewer@1.0.25`、`@flyfish-group/file-viewer-web@1.0.25`、`@flyfish-group/file-viewer-react@1.0.25`；当前机器 `npm whoami` 返回 `ENEEDAUTH`，待交互式登录/Passkey。

## 总体不变量

- [ ] 主 Demo、文档比对页、示例文件选择器、工具栏、水印、搜索、缩放、打印、导出、主题、生命周期 hooks 和 beforeOperation 行为不倒退。
- [ ] 当前 194 个扩展名、23 条预览链路的支持矩阵不得倒退。
- [x] core 是唯一总底座：内部可以分 `headless`、`browser`、`renderers`，但对外不再形成第二个核心包。
- [x] core 可以承载 `HTMLElement` / `window` / `document` / `MutationObserver` / DOM 搜索高亮 / 缩放 provider / 打印窗口 / 下载触发 / Canvas、Worker、WASM 渲染等浏览器执行能力，但必须保持纯 TS 和 framework-neutral，不依赖 Vue/React/Svelte 等上层框架。
- [x] 移除 `@flyfish-group/file-viewer3` 临时 renderer host，将渲染器注册、异步加载和呈现链路收敛到 `@file-viewer/core` 内部 browser/renderers 分层；各标准组件包 仅持有自己的本地 controller 和生态生命周期逻辑。
- [x] Vue、React、Svelte、jQuery 和 Pure JS 标准组件包必须默认走 core native browser engine，不把旧的独立页面方案作为正式组件实现。
- [x] Vue、React、Svelte、jQuery 和 Pure JS 标准组件包只能依赖 `@file-viewer/core` 和自身生态依赖，不得依赖其他标准组件包或任何第二核心包。
- [x] `@flyfish-group/*`、`file-viewer3` 等历史包名只作为标准包名的兼容别名同步更新。
- [x] core 源码公开到独立 `file-viewer-core` 仓库，并随开源总仓库提供可审计源码。
- [x] 开源总仓库发布 core、标准组件包、兼容包、主 Demo 源码、组件 Demo 源码和文档源码，同时保留混淆/压缩后的构建产物、示例、tarball、release manifest 和分发说明。

## 分支与目录验收

- [ ] `main` 分支成为 core 主线，只承载 framework-neutral 底座和共享协议，branch role 为 `core`，包名为 `@file-viewer/core`，source policy 为 `core-source-exported-publicly`。
- [ ] 原 `main` 分支转为 `v2`，用于 Vue2.7 标准组件兼容包线，branch role 为 `vue2.7-component`，包名为 `@file-viewer/vue2.7`，source policy 为 `component-source-exported-publicly`。
- [ ] 新 `v3` 分支用于 Vue3 标准组件包线，branch role 为 `vue3-component`，包名为 `@file-viewer/vue3`，source policy 为 `component-source-exported-publicly`。
- [x] 当前 `v3` 分支的 Vue3 标准组件代码迁移到 `packages/components/vue3` 独立包。
- [x] 正式在线 Demo 已迁移到 `apps/viewer-demo`，组件接入示例保留在 `apps/component-demo`，`packages/` 下只保留 core、标准组件包和兼容 alias。
- [ ] 当前 `v3` 分支提升为新的 `main` 基线，并在远端完成分支角色切换。
- [ ] 新的 Vue3 标准组件包线提交到新的 `v3` 分支，并保持 `@file-viewer/vue3`、`@flyfish-group/file-viewer3`、`file-viewer3` 三个发布入口一致。
- [x] `packages/components/vue3`、`packages/components/vue2.7`、`packages/components/vue2.6`、`packages/components/react`、`packages/components/react-legacy`、`packages/components/web`、`packages/components/jquery`、`packages/components/svelte` 都只保留对应生态组件职责，不依赖其他标准组件包。
- [x] `packages/compat/vue2.7`、`packages/compat/vue3-scoped`、`packages/compat/vue3-unscoped`、`packages/compat/web`、`packages/compat/react` 与根包只作为历史兼容别名或历史发布入口，不承载新的业务实现。
- [x] core 与标准组件包的类型边界在 CI 中通过 `pnpm verify:core-api`、`pnpm verify:wrapper-api`、`pnpm verify:wrapper-options` 固化。

## 架构分层验收

| 层级 | 包 | 允许职责 | 禁止职责 |
| --- | --- | --- | --- |
| Core headless | `@file-viewer/core` | 格式矩阵、source 解析、renderer 协议、能力模型、options 归一化、生命周期/操作/搜索/定位/缩放/打印/导出/水印/AI 契约、纯状态机和类型 | 组件生命周期、框架依赖、业务 UI 状态 |
| Core browser/renderers | `@file-viewer/core` | direct browser viewer engine、renderer registry、异步 loader、DOM/Canvas/Worker/WASM 渲染器、DOM 搜索高亮、缩放 provider、打印/导出执行适配、浏览器资源路径解析 | Vue/React/Svelte 标准组件生命周期、框架插件安装、依赖任何上层框架 |
| Standard Components | `@file-viewer/vue3`、`@file-viewer/react`、`@file-viewer/web` 等 | 对应生态的组件/插件/action、props/ref/controller、toolbar/search/loading UI、生命周期转发、类型出口 | 依赖其他标准组件包、依赖第二核心包、复制重型 renderer、重新定义格式矩阵 |
| Alias packages | `@flyfish-group/*`、`file-viewer3` | 标准包的兼容发布入口 | 承载新的业务实现或重复存储同内容产物 |

## 目标包名和仓库矩阵

| 能力 | 标准 npm 包名 | 兼容/历史 npm 包名 | 代码归属 | GitHub | Gitee | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| Core | `@file-viewer/core` | 无 | `packages/core` / `main` | `https://github.com/flyfish-dev/file-viewer-core` | `https://gitee.com/flyfish-dev/file-viewer-core` | [ ] 待最终切主线与独立仓同步 |
| Vue 3 | `@file-viewer/vue3` | `@flyfish-group/file-viewer3`, `file-viewer3` | `packages/components/vue3` / `v3` | `https://github.com/flyfish-dev/file-viewer-vue3` | `https://gitee.com/flyfish-dev/file-viewer-vue3` | [~] GitHub 已发布，Gitee / 分支切换待完成 |
| Vue 2.7 | `@file-viewer/vue2.7` | `@flyfish-group/file-viewer` | `packages/components/vue2.7` / `v2` | `https://github.com/flyfish-dev/file-viewer-vue2.7` | `https://gitee.com/flyfish-dev/file-viewer-vue2.7` | [~] GitHub 已发布，Gitee / v2 分支待完成 |
| Vue 2.6 | `@file-viewer/vue2.6` | 无 | `packages/components/vue2.6` | `https://github.com/flyfish-dev/file-viewer-vue2.6` | `https://gitee.com/flyfish-dev/file-viewer-vue2.6` | [~] GitHub 已发布，Gitee 待完成 |
| React 18/19 | `@file-viewer/react` | `@flyfish-group/file-viewer-react` | `packages/components/react` | `https://github.com/flyfish-dev/file-viewer-react` | `https://gitee.com/flyfish-dev/file-viewer-react` | [~] GitHub 已发布，Gitee 待完成 |
| React legacy | `@file-viewer/react-legacy` | 无 | `packages/components/react-legacy` | `https://github.com/flyfish-dev/file-viewer-react-legacy` | `https://gitee.com/flyfish-dev/file-viewer-react-legacy` | [~] GitHub 已发布，Gitee 待完成 |
| Pure Web / Pure JS | `@file-viewer/web` | `@flyfish-group/file-viewer-web` | `packages/components/web` | `https://github.com/flyfish-dev/file-viewer-web` | `https://gitee.com/flyfish-dev/file-viewer-web` | [~] GitHub 已发布，Gitee 待完成 |
| jQuery | `@file-viewer/jquery` | 无 | `packages/components/jquery` | `https://github.com/flyfish-dev/file-viewer-jquery` | `https://gitee.com/flyfish-dev/file-viewer-jquery` | [~] GitHub 已发布，Gitee 待完成 |
| Svelte | `@file-viewer/svelte` | 无 | `packages/components/svelte` | `https://github.com/flyfish-dev/file-viewer-svelte` | `https://gitee.com/flyfish-dev/file-viewer-svelte` | [~] GitHub 已发布，Gitee 待完成 |
| Open-source main repository | 开源源码 + 主分发入口 | 当前 `flyfish-dev/file-viewer` | 开源总仓库 | `https://github.com/flyfish-dev/file-viewer` | `https://gitee.com/flyfish-dev/file-viewer` | [x] v2.0.0 已刷新，GitHub/Gitee 内容一致 |

## npm 发布包清单

- [ ] `@file-viewer/core`
- [ ] `@file-viewer/vue3`
- [ ] `@file-viewer/vue2.7`
- [ ] `@file-viewer/vue2.6`
- [ ] `@file-viewer/react`
- [ ] `@file-viewer/react-legacy`
- [ ] `@file-viewer/web`
- [ ] `@file-viewer/jquery`
- [ ] `@file-viewer/svelte`
- [ ] `@flyfish-group/file-viewer3`
- [ ] `file-viewer3`
- [ ] `@flyfish-group/file-viewer`
- [ ] `@flyfish-group/file-viewer-web`
- [ ] `@flyfish-group/file-viewer-react`

## Phase 1: Core 底座收敛

- [x] 建立 `@file-viewer/core` framework-neutral TypeScript 底座。
- [x] 将格式矩阵、资产路径、操作 API、生命周期 hooks、beforeOperation、搜索、定位、缩放、打印、导出、水印、主题和 loading 状态的底层契约沉淀到 core 类型与 API。
- [x] 移除 core 中的旧独立页面协议、事件桥、二进制投递和来源校验类型。
- [ ] 完成 `main` 分支只包含 core 核心底座源码的切换审计。
- [x] 移除 `temporary-v3-renderer-host-until-core-renderer-migration` 过渡策略。
- [x] 撤回 core 中偏 Web 的 `mountViewer` 下沉，改为各标准组件包自带本地 controller。
- [x] 将旧 v3 拆出的 `createViewer`、renderer registry、异步 loader、DOM provider registry、print layout 和浏览器资源解析合并回 `@file-viewer/core` 的 browser/renderers 分层。
- [ ] 保留 `documentDom` 中的锚点/滚动定位、DOM search controller、DOM zoom controller、浏览器下载/打印/导出执行器作为 core browser 能力，但拆目录、拆文件，避免污染 headless 契约入口。
- [~] DOM search / zoom provider registry 已归入 `@file-viewer/core/browser` 方向，后续不得作为独立核心入口。
- [~] DOM print layout helper 已归入 `@file-viewer/core/browser/printLayout` 方向。
- [~] 浏览器 `document.baseURI` / `location.href` 默认读取已归入 `@file-viewer/core/browser/assets` 方向，headless asset/source loading 继续只接受显式 `documentBaseUrl` / `pageHref`。
- [x] `verify:core-api` 应拆分 headless 与 browser export 门禁，允许 core browser 入口，但禁止任何 Vue/React/Svelte 框架依赖。
- [x] `@file-viewer/core`、`@file-viewer/core/headless`、`@file-viewer/core/browser` 的入口职责已写入 core README / README.en.md 和开发门禁文档，标准组件包后续应优先选择最窄入口。

## Phase 2: Vue3 基线拆包

- [x] Vue3 标准组件从旧 `v3` 根实现迁移到 `packages/components/vue3`。
- [x] `@file-viewer/vue3` 提供 Vue 插件、组件、props、ref API、事件和类型出口。
- [x] `@flyfish-group/file-viewer3` 和 `file-viewer3` 保持兼容发布入口。
- [ ] 新的 `v3` 分支只维护 Vue3 标准组件包线。

## Phase 3: 当前仓库分支职责重排

- [ ] 私有 Gitea `main` 分支提升为 pure TypeScript core 主线。
- [ ] 旧 `main` 分支迁移为 `v2`，对应 Vue2.7 标准组件包。
- [ ] 当前 `v3` 基线提升为新的 core `main` 前，完成源码、产物、文档和发布记录审计。
- [ ] `ecosystem/branch-roles.json`、`ecosystem/wrappers.json`、`README.md`、`README.en.md` 与实际远端分支一致。

## Phase 4: 标准组件包实现

- [x] React 18/19 标准组件包提供 native React 组件、hooks 和完整 options 类型。
- [x] React legacy 标准组件包提供 React 16.8/17 native 组件体验。
- [x] Vue 2.6 标准组件包提供 `Vue.use()` 和 native viewer。
- [x] Vue 2.7 标准组件包提供 `Vue.use()` 和 native viewer。
- [x] Vue 3 标准组件包提供 `createApp(App).use(FileViewer)` 和 native viewer。
- [x] Pure JS 标准组件包提供 `mountViewer(container, options)`、IIFE、viewer assets、copy-assets CLI。
- [x] jQuery 标准组件包提供插件式 native 挂载。
- [x] Svelte 标准组件包提供原生 Svelte component 和 action 体验。
- [x] 所有标准组件包 的参数、事件、操作、搜索、缩放、打印、导出、主题、水印、AI 文本结构能力对齐 core。
- [x] 标准组件包不再依赖其他标准组件包；`pnpm verify:wrapper-api` 会扫描源码并阻止 package-to-package import。
- [x] 标准组件包 和 script tag IIFE 不再暴露 `mountViewerFrame`、`postFileToViewer`、`viewerUrl`、`targetOrigin` 等旧独立页面 API；`pnpm verify:wrapper-api` 与 `pnpm verify:component-demo-output` 已作为回归门禁。

## Phase 4.5: Core Renderers 去框架化

- [x] 不再保留第二核心包；direct browser viewer engine、renderer registry、async renderer loader、打印页尺寸 helper、DOM provider registry、浏览器资源 base/href 解析全部并入 `@file-viewer/core`。
- [x] 将旧 Vue SFC 渲染器逐步迁移为 core 内部 framework-neutral 实现，优先保留完整体验与导出/打印/搜索/缩放能力。
- [x] 将 Audio / MIDI / Video / HLS 媒体 renderer 迁为 core browser TypeScript DOM 实现，并移除对应 Vue SFC 依赖。
- [x] 将 Code / Text renderer 迁为 core browser TypeScript DOM 实现，并保留按需高亮、暗色主题和缩放 provider。
- [x] 将 Markdown renderer 去掉 CSS import 后迁为 core browser TypeScript DOM 实现，并保留按需解析、暗色主题和缩放 provider。
- [x] 将 Image renderer 迁为 core browser TypeScript DOM 实现，并保留 HEIC/HEIF 按需转换、暗色主题、灯箱和缩放 provider。
- [x] 将 UMD renderer 迁为 core browser TypeScript DOM 实现，并保留章节目录、封面/图集、正文段解压、移动端目录和状态展示。
- [x] 将 Geo renderer 迁为 core browser TypeScript DOM 实现，并保留 GeoJSON/KML/GPX/SHP 解析、离线 SVG 预览、范围统计和暗色主题。
- [x] 将 OpenDocument / RTF renderer 迁为 core browser TypeScript DOM 实现，并保留 ODT/ODP XML 解析、RTF DOM 渲染、纸张阅读样式和暗色主题隔离。
- [x] 将 Email renderer 迁为 core browser TypeScript DOM 实现，并保留 EML/MSG/MBOX 解析、CID 图片、正文/头信息切换、附件下载和标准组件包注入的嵌套预览能力。
- [x] 将 EDA renderer 迁为 core browser TypeScript DOM 实现，并保留 OLB/DRA CFB 解析、结构树、对象分组、流筛选、属性/字符串/诊断展示和安全二进制退化。
- [x] 将 CAD renderer 迁为 core browser TypeScript DOM 实现，并保留 DWG/DXF/DWF/DWFx/XPS、图层侧栏、结构面板、fit/zoom、Worker/WASM 路径解析和 native DWF renderer。
- [x] 将 Typst renderer 迁为 core browser TypeScript DOM 实现，并保留浏览器 WASM 编译、按页 SVG、compiler/renderer WASM 路径配置、缩放 provider、打印和 HTML 导出适配器。
- [x] 将 PPTX renderer 迁为 core browser TypeScript DOM 实现，并保留 `@aiden0z/pptx-renderer` 按需加载、slide 懒渲染、窗口化列表、缩放 provider、渐进渲染通知、打印和 HTML 导出适配器。
- [x] 将 EPUB renderer 迁为 core browser TypeScript DOM 实现，并保留 epubjs 目录/分页、正文跳转、可读帧检测、移动端目录和 loading/error 状态。
- [x] 将 Model renderer 迁为 core browser TypeScript DOM 实现，并保留 Three.js 交互视图、OrbitControls、主流 loader、适配/旋转/线框/网格/坐标工具和工程格式提示。
- [x] 将 Drawing renderer 迁为 core browser TypeScript DOM 实现，并保留 Excalidraw 官方 SVG 导出、rough.js 兜底、diagrams.net 官方 Viewer、缩放 provider 和 loading/error 状态。
- [x] 将 Data Asset renderer 迁为 core browser TypeScript DOM 实现，并保留 FontFace、PSD 图层摘要、SQLite/Parquet/Avro/WASM 结构预览、AI/EPS/WebArchive 安全摘要和 SQLite WASM 路径配置。
- [x] 将 PDF renderer 迁为 core browser TypeScript DOM 实现，并保留 PDF.js 按需加载、workerUrl 配置、流式/Range 读取、页面/目录导航、缩放 provider、原生搜索、打印和 HTML 导出适配器。
- [x] PDF 等剩余渲染链路迁移时必须逐条保留按需加载、Worker/WASM 资源路径、导出适配器和 demo 样例。
- [x] core browser/renderers 完成后，React/Vue/Svelte/jQuery/Web 标准组件包的生产依赖不得因为 core 传递引入非自身生态框架。
- [x] 增加 core browser/renderers 门禁：`@file-viewer/core` 不得依赖 `vue`、`@vitejs/plugin-vue`、`vue-tsc`、`@lucide/vue`、React、Svelte 或任何 标准组件包。

### Renderer 迁移盘点

- [x] Vue3 renderer registry 直接复用 `@file-viewer/core` 的 `coreBrowserRendererHandlers`，已迁移格式不再保留 wrapper 内薄转发 vendor 入口。
- [x] `audio` / `mp4` / `text` 已由 `@file-viewer/core` 的 `renderFileViewerAudio`、`renderFileViewerVideo`、`renderFileViewerCode` 直接承载。
- [x] `md` 实际 Markdown 解析、DOM 渲染和缩放 provider 已由 core 直接承载。
- [x] `image` 已迁移到 `@file-viewer/core` 的 `renderFileViewerImage`，按需加载 `heic2any` 并提供原生 DOM 灯箱与缩放 provider。
- [x] `umd` 已迁移到 `@file-viewer/core` 的 `renderFileViewerUmd`，Vue3 registry 直接复用 core handler。
- [x] `geo` 已迁移到 `@file-viewer/core` 的 `renderFileViewerGeo`，Vue3 registry 直接复用 core handler。
- [x] `open-document` 已迁移到 `@file-viewer/core` 的 `renderFileViewerOpenDocument`，Vue3 registry 直接复用 core handler。
- [x] `email` 已迁移到 `@file-viewer/core` 的 `renderFileViewerEmail`，附件嵌套预览通过 `FileRenderContext.renderNestedBuffer` 注入。
- [x] `eda` 已迁移到 `@file-viewer/core` 的 `renderFileViewerEda` 和 `parseEdaFile`，Vue3 registry 直接复用 core handler。
- [x] `cad` 已迁移到 `@file-viewer/core` 的 `renderFileViewerCad`，Vue3 registry 直接复用 core handler，`@flyfish-dev/cad-viewer` 依赖归属 core。
- [x] `typst` 已迁移到 `@file-viewer/core` 的 `renderFileViewerTypst`，Vue3 registry 直接复用 core handler，`@myriaddreamin/typst.ts` 相关依赖归属 core。
- [x] `pptx` 已迁移到 `@file-viewer/core` 的 `renderFileViewerPptx`，Vue3 registry 直接复用 core handler，`@aiden0z/pptx-renderer` 依赖归属 core。
- [x] `ebook` 已迁移到 `@file-viewer/core` 的 `renderFileViewerEpub`，Vue3 registry 直接复用 core handler。
- [x] `model` 已迁移到 `@file-viewer/core` 的 `renderFileViewerModel`，Vue3 registry 直接复用 core handler。
- [x] `drawing` 已迁移到 `@file-viewer/core` 的 `renderFileViewerDrawing`，Vue3 registry 直接复用 core handler，`@excalidraw/excalidraw` 与 `roughjs` 依赖归属 core。
- [x] `data-asset` 已迁移到 `@file-viewer/core` 的 `renderFileViewerDataAsset`，Vue3 registry 直接复用 core handler，`ag-psd`、`sql.js`、`hyparquet` 与 `avsc` 依赖归属 core。
- [x] `archive` 已迁移到 `@file-viewer/core` 的 `renderFileViewerArchive`，Vue3 registry 直接复用 core handler，保留 `libarchive.js` 静态 Worker、WASM 路径、ZIP/TAR/GZIP 兼容降级、IndexedDB 缓存和压缩包内嵌套预览。
- [x] `word` 已迁移到 `@file-viewer/core` 的 `renderFileViewerWordDocx` / `renderFileViewerWordDoc`，Vue3 registry 直接复用 core handler，`docx-preview` 与 `msdoc-viewer` 依赖归属 core；保留 DOCX 渐进挂载、可选静态 Worker URL、缩放 provider、打印和 HTML 导出适配器。
- [x] `xlsx` 已迁移到 `@file-viewer/core` 的 `renderFileViewerSpreadsheet`，Vue3 registry 直接复用 core handler；保留 `styled-exceljs`、`e-virt-table` 虚拟滚动、工作表标签、workbook drawing 图片、缩放 provider、静态 Worker URL 和主线程降级。
- [x] `ofd` 已迁移到 `@file-viewer/core` 的 `renderFileViewerOfd`，Vue3 registry 直接复用 core handler，保留 DLTech21/ofd.js 按需加载、解析缓存、resize 重排、缩放 provider、打印和 HTML 导出。
- [x] `pdf` 已迁移到 `@file-viewer/core` 的 `renderFileViewerPdf`，Vue3 registry 直接复用 core handler，`pdfjs-dist` 依赖归属 core。

## Phase 5: 公开仓库与 README

- [ ] 所有目标标准组件包 均存在 GitHub 和 Gitee 公开仓库。
- [x] 所有目标标准组件包 均存在 GitHub 公开仓库并通过 `pnpm verify:wrapper-public-remotes --host=github`。
- [ ] 所有目标标准组件包 均存在 Gitee 公开仓库并通过 `pnpm verify:wrapper-public-remotes --host=gitee`。
- [ ] 所有标准组件包 的 README 中英文完整，体现完整格式支持矩阵、官方文档、Demo、安装方式、options、事件、操作 API、私有化 viewer assets 说明和贡献方式。
- [ ] 开源总仓库 README 中列出 core、所有开源标准组件仓库、npm 包、历史兼容包、下载包和文档地址。
- [x] core 源码进入 `file-viewer-core` 与开源总仓库，Gitea 私有仓继续作为完整聚合仓和优先支持入口。

## Phase 6: npm 发布与兼容别名

- [x] `@flyfish-group/file-viewer` 作为 Vue2.7 历史兼容 alias 纳入发布矩阵。
- [x] `@flyfish-group/file-viewer3`、`file-viewer3`、`@flyfish-group/file-viewer-web`、`@flyfish-group/file-viewer-react` 纳入发布矩阵。
- [ ] 所有 `@file-viewer/*` npm 包均发布成功。
- [ ] 所有历史兼容包均发布成功，版本连续，latest 指向最新。
- [ ] `file-viewer3` 非 scoped alias 发布到 npm，但开源总仓库不重复存储其 tarball。

## Phase 7: 构建产物与公开分发

- [x] 开源总仓库包含最新全渠道构建产物、viewer assets、Demo、component demo、文档静态产物、示例文件、tarball、release manifest、开源源码和更新历史。
- [x] 开源总仓库包含 core 和标准组件包源码，同时保留混淆压缩后的成品。
- [x] GitHub / Gitee 开源总仓库同步一致。
- [ ] Docker 镜像按需发布 `linux/amd64` 和 `linux/arm64`。

## Phase 8: 验证与发布门禁

- [x] `pnpm type-check`
- [x] `pnpm type-check:components`
- [x] `pnpm docs:build`
- [x] `pnpm build-only`
- [x] `pnpm build:component-demo`
- [x] `pnpm verify:format-support`
- [x] `pnpm verify:ecosystem-checklist`
- [x] `pnpm verify:ecosystem-readmes`
- [x] `pnpm verify:branch-roles`
- [x] `pnpm verify:core-api`
- [x] `pnpm verify:core-framework-neutral`
- [x] `pnpm verify:wrapper-api`
- [x] `pnpm verify:wrapper-options`
- [x] `pnpm verify:compatibility-api`
- [x] `pnpm verify:compatibility-readmes`
- [x] `pnpm verify:ecosystem-versions`
- [x] `pnpm verify:ecosystem-tarballs`
- [x] `pnpm audit:ecosystem-status`（只读审计 GitHub / Gitee / npm / Release 当前状态，`--strict` 可用于最终发布阻断）
- [x] `pnpm verify:wrapper-public-remotes --host=github`
- [ ] `pnpm verify:wrapper-public-remotes`
- [x] `pnpm verify:production-entrypoints`
- [x] `pnpm verify:browser-smoke`
- [x] `pnpm components:standalone-smoke`
- [ ] `pnpm deploy:cloudflare`（需针对 `5081e11` 之后的当前最新内容重新执行）
- [ ] `pnpm docs:deploy:cloudflare`（需针对 `5081e11` 之后的当前最新内容重新执行）
- [x] `node scripts/sync-public-main.mjs --public-repo-dir ../file-viewer-public --vue2-tarball .release/file-viewer-v2-2.0.0/ecosystem/flyfish-group-file-viewer-2.0.0.tgz`
- [x] `pnpm test`
- [ ] 本地和生产 smoke 证明各生态体验与当前 v3 基线一致。

## 完成审计标准

- [ ] 当前私有 Gitea 仓库作为完整聚合仓，`main` 分支以 core 为主线，并保留统一发布自动化。
- [ ] `v2` / `v3` 分支分别是 Vue2.7 / Vue3 标准组件包。
- [ ] 所有目标标准组件包 均存在 GitHub 和 Gitee 公开仓库。
- [ ] 所有 `@file-viewer/*` npm 包均发布成功。
- [ ] 所有历史兼容包和别名包均发布成功。
- [ ] 所有标准组件包的 README 中英文完整。
- [ ] 开源总仓库包含最新全渠道构建产物。
- [ ] 文档站和 Demo 站均上线最新内容。
- [ ] 本地和生产 smoke 证明各生态体验与当前 v3 基线一致。
- [ ] 发布记录能证明 npm、GitHub、Gitee、Gitea、Demo、文档站、开源总仓库的版本口径一致。

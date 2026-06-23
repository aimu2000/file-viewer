# 发布与开源分发

<div class="doc-kicker">Release For Users</div>

<p class="doc-lead">
  这一页说明 Flyfish Viewer 对外分发时包含什么、如何安装、如何发布私有化 Worker/WASM viewer assets，以及开源总仓库和私有 Gitea 聚合仓之间的职责。
  GitHub / Gitee 的 <code>flyfish-dev/file-viewer</code> 是开源总仓库和主分发入口，包含可直接运行的主 Demo 源码、core、标准组件包、兼容包、文档源码、构建产物、示例文件和 release 下载物。
  为控制国内镜像仓库体积，Gitee 同步使用最新完整快照的干净历史，避免多轮二进制构建历史叠加。
  Gitee 镜像同步同一份开源总仓库内容，方便国内网络环境下载和部署。
</p>

## 分发渠道

| 渠道 | 地址 | 内容 |
| --- | --- | --- |
| 官方网站 | [file-viewer.app](https://file-viewer.app) | 一站式组件门户、产品定位、应用场景、资源导航和商业支持入口 |
| 官方文档/组件主页 | [doc.file-viewer.app](https://doc.file-viewer.app) | 主文档域名，提供组件主页、接入文档、格式说明和开源分发说明 |
| 在线 Demo | [demo.file-viewer.app](https://demo.file-viewer.app) | 可直接体验完整预览器，用于快速验证能力 |
| 文档比对 Demo | [demo.file-viewer.app/compare.html](https://demo.file-viewer.app/compare.html) | 独立入口，支持左右并排预览、上传、URL、交换、重置、同步滚动、聚焦搜索和行级定位 |
| Docker 镜像发布目标 | `flyfishdev/file-viewer:latest` | 可一键部署的 nginx 静态镜像，发布时支持 `linux/amd64` 和 `linux/arm64` |
| npm 标准生态 | [生态组件总览](/guide/ecosystem) | `@file-viewer/core`、独立 renderer、preset、`@file-viewer/pptx` 原生引擎、Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery、Svelte 全线标准包 |
| 自托管静态资源 | `file-viewer/assets/*`、`file-viewer/vendor/*`、`file-viewer/wasm/*` | Worker、WASM、示例文件和重型渲染器资源，按需自托管 |
| GitHub 开源总仓库 | [github.com/flyfish-dev/file-viewer](https://github.com/flyfish-dev/file-viewer) | 一站式入口: README、LICENSE、主 Demo 源码、core、标准组件包、兼容包、文档源码、构建产物、示例和 release tarball |
| Gitee 开源总仓库 | [gitee.com/flyfish-dev/file-viewer](https://gitee.com/flyfish-dev/file-viewer) | 国内镜像目标，使用干净历史控制仓库体积；如远端配额阻塞，以 GitHub 开源总仓库和 release 为准 |
| 打赏与优先支持 | [https://dev.flyfish.group/shop](https://dev.flyfish.group/shop) | 请我们喝杯柠檬水后，可获得完整聚合仓访问、优先技术支持和维护协助 |

## npm 安装

新项目优先使用 `@file-viewer/*` 标准包名。历史 `@flyfish-group/*` 包继续同步发布，但主要用于旧项目平滑升级。

| 场景 | 标准包 | 历史兼容包 |
| --- | --- | --- |
| Core 底座 | `@file-viewer/core` | 无 |
| PPTX 原生引擎 | `@file-viewer/pptx` | 无 |
| Word renderer | `@file-viewer/renderer-word` | 无 |
| 演示文稿 renderer | `@file-viewer/renderer-presentation` | 无 |
| 绘图 renderer | `@file-viewer/renderer-drawing` | 无 |
| 3D 模型 renderer | `@file-viewer/renderer-3d` | 无 |
| 数据资产 renderer | `@file-viewer/renderer-data` | 无 |
| EDA renderer | `@file-viewer/renderer-eda` | 无 |
| 轻量 renderer preset | `@file-viewer/preset-lite` | 无 |
| Office renderer preset | `@file-viewer/preset-office` | 无 |
| 工程 renderer preset | `@file-viewer/preset-engineering` | 无 |
| 全量 renderer preset | `@file-viewer/preset-all` | 无 |
| Vite 按需装配插件 | `@file-viewer/vite-plugin` | 无 |
| Vanilla JS / Pure Web / script 标签 | `@file-viewer/web` | `@flyfish-group/file-viewer-web` |
| Vue3 | `@file-viewer/vue3` | `@flyfish-group/file-viewer3`、`file-viewer3` |
| Vue2.7 | `@file-viewer/vue2.7` | `@flyfish-group/file-viewer` |
| Vue2.6 | `@file-viewer/vue2.6` | 无 |
| React 18/19 | `@file-viewer/react` | `@flyfish-group/file-viewer-react` |
| React 16.8/17 | `@file-viewer/react-legacy` | 无 |
| jQuery | `@file-viewer/jquery` | 无 |
| Svelte | `@file-viewer/svelte` | 无 |

常用安装命令:

```bash
pnpm add @file-viewer/web
pnpm add @file-viewer/vue3
pnpm add @file-viewer/vue2.7
pnpm add @file-viewer/react
pnpm add @file-viewer/jquery
pnpm add @file-viewer/svelte
pnpm add @file-viewer/renderer-word
pnpm add @file-viewer/preset-office
```

Vanilla JS / Pure Web:

```html
<flyfish-file-viewer
  src="/files/demo.pdf"
  theme="light"
  style="display:block;height:100vh"
></flyfish-file-viewer>

<script type="module">
  import { defineFileViewerElement } from '@file-viewer/web'
  defineFileViewerElement()
</script>
```

Vue3:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer).mount('#app')
```

Vue2.7:

```ts
import Vue from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue2.7'

Vue.use(FileViewer)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

React:

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer url="/files/demo.docx" />
    </div>
  )
}
```

Svelte、jQuery、React Legacy、Vue2.6、Core 自定义接入和 script 标签示例见 [生态组件总览](/guide/ecosystem)。Vanilla JS / Pure Web、React、jQuery 和 Svelte 标准接入不需要配置独立静态页面地址。只有当你希望固定 Worker、WASM 或示例文件的访问路径时，才需要执行 `pnpm exec file-viewer-copy-assets ./public/file-viewer`。复制脚本会写入 `flyfish-viewer-assets.json`，按 core renderer asset manifest 校验 archive、CAD、DOCX、Spreadsheet、Typst、SQLite 等 worker/WASM 静态资源。

## Release Tarball 安装

如果你在内网、离线环境，或者 npm 发布权限还没有完成配置，也可以直接使用开源总仓库 `artifacts/` 里的 release tarball:

```bash
npm install ./artifacts/flyfish-group-file-viewer3-*.tgz
npm install ./artifacts/file-viewer-core-*.tgz
npm install ./artifacts/file-viewer-vue3-*.tgz
npm install ./artifacts/file-viewer-vue2.7-*.tgz
npm install ./artifacts/file-viewer-vue2.6-*.tgz
npm install ./artifacts/file-viewer-react-*.tgz
npm install ./artifacts/file-viewer-react-legacy-*.tgz
npm install ./artifacts/file-viewer-web-*.tgz
npm install ./artifacts/file-viewer-jquery-*.tgz
npm install ./artifacts/file-viewer-svelte-*.tgz
npm install ./artifacts/file-viewer-renderer-word-*.tgz
npm install ./artifacts/file-viewer-renderer-presentation-*.tgz
npm install ./artifacts/file-viewer-preset-all-*.tgz
npm install ./artifacts/file-viewer-pptx-*.tgz
npm install ./artifacts/flyfish-group-file-viewer-*.tgz
npm install ./artifacts/flyfish-group-file-viewer-web-*.tgz
npm install ./artifacts/flyfish-group-file-viewer-react-*.tgz
```

Core、独立 renderer、preset、PPTX 原生引擎、Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery、Svelte 和历史兼容 tarball 都会随开源总仓库一起生成。`file-viewer3` 非 scoped 兼容包仍会同步发布到 npm，但它和 `@flyfish-group/file-viewer3` 包体重复，开源总仓库下载区只保留 `flyfish-group-file-viewer3-*.tgz` 这一份 Vue3 兼容 tarball。React tarball 依赖 web viewer 包，离线安装时请按 npm 依赖关系一起放入本地源或依次安装。

纯离线部署时，除了 npm tarball，也要把 viewer assets 一起发布到业务静态目录。运行 `file-viewer-copy-assets` 会复制 PDF.js worker/CMap/WASM/standard fonts、CAD WASM、Typst WASM、SQLite WASM、压缩包 worker 和 Office worker，并生成 `flyfish-viewer-assets.json` 供验收。运行时默认不会访问公共 CDN 或第三方在线静态资源；路径特殊时通过各格式的 `options.*Url` 指向自托管地址。

## 开源总仓库内容

GitHub / Gitee 的 `flyfish-dev/file-viewer` 是开源总仓库，用于分发开源源码、可直接运行的 Demo、文档源码和可直接使用的 release 产物。私有 Gitea 继续作为完整聚合仓、统一发布脚本、内部自动化和优先技术支持入口。仓库内容包括:

- `packages/core/`: framework-neutral core 源码
- `packages/components/`: Vanilla JS / Pure Web、Vue、React、jQuery、Svelte 等标准组件包源码
- `packages/compat/`: 历史 npm 包名兼容 alias 源码
- `apps/`: 主 Demo 和组件 Demo 源码
- `dist/`: 混淆压缩后的组件库产物
- `demo/`: 可独立部署的私有化预览器静态站点
- `component-demo/`: React 和纯 JS 接入的最小化示例
- `docs/`: VitePress 文档静态站点
- `example/`: 完整样例文件列表
- `artifacts/`: npm tarball、组件 tarball、Demo tarball、文档 tarball
- `Dockerfile` / Docker Hub 标签: 可直接部署的静态镜像构建与发布信息
- `README.md`: 默认中文入口，提供友好的安装、嵌入、下载和授权说明
- `README.en.md`: 完整英文入口，与中文 README 互相提供语言切换链接，便于海外客户快速评估和接入
- `LICENSE`: 项目许可证

其中 `README.md` 会承担开源总仓库首页职责，写明官方文档、在线 Demo、npm 包、私有化部署、源码目录、release 下载物和支持入口。`apps/`、`packages/`、`docs/`、`demo/`、`component-demo/` 和 `example/` 默认展开提交，保证用户克隆后可以直接运行和审计完整结构；`artifacts/*.tar.gz` 继续保留，方便直接下载离线包。

如果某个镜像平台临时无法承载完整展开目录，可以显式使用 `FILE_VIEWER_PUBLIC_SLIM=1` 或 `--slim` 生成应急轻量布局。该模式只用于临时镜像排障，不作为公开 GitHub / Gitee 的默认发布形态。

开源总仓库会包含 `apps/`、`packages/core/`、`packages/components/`、`packages/compat/` 和 `docs/` 等源码，同时继续保留可直接部署或下载的 release 产物。

## 发版命令

2.x 之后，生态包从完整聚合仓统一构建、校验和发布。发布前建议执行:

```bash
pnpm type-check
pnpm build
pnpm build:vue3
pnpm obfuscate
pnpm docs:build
pnpm release:ecosystem:pack
```

其中 `pnpm obfuscate` 会处理 `packages/components/vue3/dist/` 中的 `.js` / `.mjs` 文件。类型声明、CSS、图片和示例文件不会被混淆，便于业务方正常接入和排查。

正式发布前建议先执行:

```bash
npm publish --dry-run --access public
```

确认包名、版本、README 和 `dist/` 文件无误后，再执行 `npm publish --access public`。如果 npm 账号启用了 MFA，请使用交互式会话完成浏览器确认。

生态包发布:

```bash
pnpm type-check:components
pnpm build:component-demo
pnpm release:ecosystem:list
pnpm release:ecosystem:pack
pnpm release:ecosystem:publish:dry-run
pnpm release:ecosystem:publish
```

`release:ecosystem:pack` 会先构建 core、独立 renderer、preset、PPTX 原生引擎、标准组件包和历史兼容包，再统一打包当前 35 个 npm 目标。发布前请确认 tarball 中包含必要的 viewer assets、`dist/*`、README / README.en.md，且没有 `.DS_Store`。

开源总仓库使用私有 Gitea `main` 完整聚合仓生成，发布前执行:

```bash
pnpm release:public
```

该命令会同步开源源码、Demo、component demo、文档静态产物、示例文件、混淆后的 `dist/` 和生态 tarball，并在写入后自动执行 `pnpm verify:public-main`。如果只想检查已经生成的开源总仓库内容，可以执行:

```bash
pnpm verify:public-main
```

校验会反查 `artifacts/release-manifest.json`、`artifacts/release-status.json`、`artifacts/release-status.schema.json`、所有应公开 tarball、README / README.en.md、组件 GitHub / Gitee 索引和顶层目录边界，避免漏掉源码、重复 tarball 或发布过期产物。`release-manifest.json` 会通过 `metadataAssets` 索引 manifest、status 和 schema 三份元数据；`release-status.json` 的 `sourceBaseline` 会明确私有 Gitea `main` 才是完整原始聚合仓基线，本地 checkout 分支名只是执行上下文；`release-status.schema.json` 是状态报告的公开 JSON Schema，可用于 CI 或下载端判断哪些缺口是本地可修项、哪些是 npm / Gitee / GitHub 等外部发布阻塞。

## Docker 镜像发布

Docker 镜像用于一键部署主 Demo 和文档比对页。发布前先确保 Docker Hub 已登录，并且当前账号对 `flyfishdev/file-viewer` 有推送权限:

```bash
docker login
DOCKER_IMAGE=flyfishdev/file-viewer pnpm docker:publish
```

默认会推送 `latest` 和 `latest` 两个标签，并生成 `linux/amd64` / `linux/arm64` 多架构 manifest。发布后至少验证:

```bash
docker run --rm -p 8080:80 flyfishdev/file-viewer:latest
```

然后打开 `/`、`/compare.html` 和 `/healthz`。

## 授权和贡献

项目使用 `Apache-2.0` 许可证。二开或商用时，请保留许可证、版权和来源说明，并注明项目来源为 Flyfish Viewer / `@flyfish-group/file-viewer3` 或 `@flyfish-group/file-viewer`。

如果你修复了通用问题或增强了通用能力，建议通过 issue / PR 一起贡献回来。这样后续升级时，大家都能少走一点弯路。

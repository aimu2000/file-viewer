# 纯 JS 集成

<div class="doc-kicker">Vanilla JavaScript</div>

<p class="doc-lead">
  纯 JS 包提供 <code>mountViewer(container, options)</code>。它直接把完整预览器挂载进目标 DOM，
  适合传统后台页面、微前端壳、非框架系统和 script 标签接入。
</p>

## 标准安装

新项目优先使用标准包名:

```bash
npm install @file-viewer/web@2.0.0
```

历史包名仍同步维护:

```bash
npm install @flyfish-group/file-viewer-web@2.0.0
```

```ts
import { mountViewer } from '@file-viewer/web'

const controller = mountViewer(document.getElementById('viewer')!, {
  url: '/files/demo.pdf',
  options: {
    theme: 'light',
    toolbar: { position: 'bottom-right' },
    archive: { cache: true, workerTimeoutMs: 30000 }
  },
  onEvent(event) {
    console.log(event.type, event.event, event.payload)
  }
})

controller.reload()
```

容器需要有明确高度，预览器会填满容器。

## 鉴权文件

业务系统可以先完成登录态、权限或签名校验，再把文件二进制交给预览器。传 `Blob` 或 `ArrayBuffer` 时请同时传 `name`:

```ts
const blob = await fetch('/api/files/contract', { credentials: 'include' }).then(res => res.blob())

mountViewer(document.getElementById('viewer')!, {
  file: blob,
  name: 'contract.pdf',
  options: { theme: 'light' }
})
```

## 构建工具接入

Vite、Webpack、Rspack、Rollup 等构建工具可以直接使用 ESM 包入口。构建工具会负责解析 `@file-viewer/web`、Vue 和底层预览依赖:

```ts
import { mountViewer } from '@file-viewer/web'

mountViewer(document.getElementById('viewer')!, {
  url: '/files/demo.pdf',
  options: { theme: 'light', toolbar: { position: 'bottom-right' } }
})
```

不要把 `dist/index.js` 复制到 public 后直接用浏览器加载。该入口保留了包依赖关系，面向构建工具和包管理器；无构建工具页面请使用下面的 IIFE 全局包。

## 通过普通 script 引入

IIFE 包会暴露 `window.FlyfishFileViewerWeb`:

```bash
cp ./node_modules/@file-viewer/web/dist/flyfish-file-viewer-web.iife.js ./public/vendor/file-viewer-web/flyfish-file-viewer-web.iife.js
```

```html
<div id="viewer" style="height: 720px"></div>
<script src="/vendor/file-viewer-web/flyfish-file-viewer-web.iife.js"></script>
<script>
  window.FlyfishFileViewerWeb.mountViewer(document.getElementById('viewer'), {
    url: '/files/demo.docx',
    options: { theme: 'light' }
  })
</script>
```

## 自托管 Worker / WASM 资源

大多数业务只需要安装包即可。只有在内网、CSP 严格、CDN 前缀特殊或希望固定重型资源路径时，才需要复制资源:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

复制命令会写入 `flyfish-viewer-assets.json`，并校验 archive、DOCX、CAD 等 worker/WASM 静态资源是否齐全。部署路径特殊时，可以在 `options.archive.workerUrl`、`options.archive.wasmUrl`、`options.docx.workerUrl`、`options.typst.compilerWasmUrl`、`options.typst.rendererWasmUrl`、`options.data.sqlWasmUrl` 等参数中指定自托管地址。

## API

| API | 说明 |
| --- | --- |
| `mountViewer(container, options)` | 挂载预览器并返回 controller |
| `controller.update(options)` | 更新文件或运行参数 |
| `controller.reload()` | 重新加载当前文件 |
| `controller.destroy()` | 卸载预览器并释放资源 |
| `createViewerControllerHandle()` | 创建可复用的 controller handle，适合框架组件包 封装 |

`options` 与 Vue、React、jQuery、Svelte standard component package 保持一致，支持主题、水印、搜索、统一缩放、下载、打印、导出 HTML、beforeOperation 前置校验、生命周期 hooks、压缩包缓存和格式专项参数。

## 常见问题

| 现象 | 处理方式 |
| --- | --- |
| 控制台提示裸包名无法解析 | 使用构建工具打包，或在无构建页面使用 IIFE 全局包 |
| 文件接口 401 | 由宿主页面先 `fetch` 成 `Blob`，再传 `file` + `name` |
| 压缩包或 CAD 卡在资源加载 | 运行 `file-viewer-copy-assets`，并检查 worker/WASM 的 MIME、CSP 和访问路径 |
| 页面空白 | 确认父容器有稳定高度，且传入文件带有可识别扩展名 |

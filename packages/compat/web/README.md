# @flyfish-group/file-viewer-web

纯 Web 文件预览组件。这个包是 `@file-viewer/web` 的历史包名同步版本，当前只提供 native DOM 挂载能力: 在目标容器内直接创建完整 Flyfish Viewer，不需要额外的静态页面协议。

```bash
npm install @flyfish-group/file-viewer-web@2.0.0
```

```ts
import { mountViewer } from '@flyfish-group/file-viewer-web'

const controller = mountViewer(document.getElementById('viewer')!, {
  url: 'https://example.com/demo.pdf',
  options: {
    theme: 'light',
    toolbar: { position: 'bottom-right' },
    search: { maxMatches: 1000 },
    pdf: { toolbar: true },
    watermark: { text: '内部预览', opacity: 0.14 },
    archive: { cache: true }
  },
  onEvent(event) {
    console.log(event.type, event.event, event.payload)
  }
})

controller.reload()
```

鉴权文件可以由宿主系统先下载成 `Blob`，再通过 `file` 和 `name` 交给预览器:

```ts
const blob = await fetch('/api/files/contract', { credentials: 'include' }).then(res => res.blob())

mountViewer(document.getElementById('viewer')!, {
  file: blob,
  name: 'contract.pdf'
})
```

## Script 标签接入

无构建工具项目可以自托管 IIFE 包，它会暴露 `window.FlyfishFileViewerWeb`:

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

浏览器不能直接解析 `@flyfish-group/file-viewer-web` 这种裸包名；没有构建工具时请使用静态 URL、IIFE 全局包，或配置 import map。Worker、WASM 和示例资源可以通过复制命令自托管:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

`options` 会透传给共享预览底座，可配置主题、下载/打印/导出 HTML 操作栏、文字或图片水印、搜索高亮、AI 友好文本切片、统一缩放，以及压缩包预览的 Worker、IndexedDB 缓存和体积上限。生命周期、操作能力变化、搜索状态和当前位置会通过 `onEvent` 回传给宿主，适合记录加载耗时、审计下载/打印尝试、搜索命中、页码/行号、AI 切片和溯源状态。

新项目建议优先使用标准包名 `@file-viewer/web`。官方文档: https://doc.flyfish.dev/

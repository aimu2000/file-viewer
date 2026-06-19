# React 集成

<div class="doc-kicker">For React 17 / 18 / 19</div>

<p class="doc-lead">
  React 包提供原生组件体验。组件内部通过共享 core native engine 直接挂载完整预览器，
  props、事件、ref、调试链路都留在 React 项目内。
</p>

## 安装

新项目优先使用标准包名:

```bash
npm install @file-viewer/react@2.0.0
```

历史包名仍同步维护:

```bash
npm install @flyfish-group/file-viewer-react@2.0.0
```

## 最短示例

```tsx
import FileViewer from '@file-viewer/react'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/files/demo.docx"
        onViewerEvent={(event) => {
          console.log(event.type, event.event, event.payload)
        }}
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right' },
          watermark: { text: '内部预览', opacity: 0.14 },
          archive: { cache: true, workerTimeoutMs: 30000 }
        }}
      />
    </div>
  )
}
```

父容器必须有明确高度；预览器会填满父容器。

## 预览鉴权文件

如果文件必须由宿主系统鉴权下载，请先拿到 `Blob`，再传给组件。传 `Blob` 或 `ArrayBuffer` 时一定要同时传 `name`，用于识别扩展名。

```tsx
import { useEffect, useState } from 'react'
import FileViewer, { type FileRef } from '@file-viewer/react'

export function PrivatePreview() {
  const [file, setFile] = useState<FileRef>()

  useEffect(() => {
    fetch('/api/files/contract', { credentials: 'include' })
      .then(response => response.blob())
      .then(setFile)
  }, [])

  return (
    <div style={{ height: '100vh' }}>
      <FileViewer file={file} name="contract.pdf" />
    </div>
  )
}
```

## 可用参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `string` | 可直接被浏览器访问的文件地址 |
| `file` | `File \| Blob \| ArrayBuffer` | 本地文件或鉴权下载后的二进制内容，优先级高于 `url` |
| `name` | `string` | `Blob` / `ArrayBuffer` 的文件名，建议带扩展名 |
| `options` | `FileViewerOptions` | 主题、操作栏、水印、搜索、统一缩放、打印、导出、压缩包 Worker / 缓存 / 体积限制等运行配置 |
| `onViewerEvent` | `(event) => void` | 接收加载、卸载、操作能力、搜索状态和当前位置变化 |

`options.beforeOperation`、`options.hooks` 等函数型配置可以直接传入 React 组件。下载、打印、导出、缩放等按钮操作会在预览器内部根据文件类型动态显隐，并在执行前触发权限校验钩子。

## 本地调试

仓库内置了 React + 纯 JS + Vue3 + jQuery + Svelte 多入口演示:

```bash
pnpm dev:components
```

打开页面后，React 面板应当能显示同一份本地 DOCX 示例，并能触发生命周期事件、搜索、缩放和操作按钮状态变化。

## 自托管资源

React 标准接入不需要额外配置静态页面地址。只有当你希望固定 Worker、WASM 或示例文件的访问路径时，才需要复制资源:

```bash
npx file-viewer-copy-assets ./public/file-viewer
```

压缩包、CAD、Typst 等重型格式都会按需加载；部署路径特殊时，可以在 `options.archive`、`options.typst` 或 CAD 相关参数中指定自托管资源地址。

# @file-viewer/renderer-archive

Flyfish File Viewer 的独立压缩包 renderer 包。它用 `libarchive.js` Worker + WASM 读取 RAR、7z、ZIP、TAR 等压缩包目录，并在点击内部文件时才按需解压、缓存和调用 File Viewer 的嵌套渲染能力。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { archiveRenderer } from '@file-viewer/renderer-archive'

const options = {
  rendererMode: 'replace',
  renderers: archiveRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
import { archiveRenderer } from '@file-viewer/renderer-archive'
import { pdfRenderer } from '@file-viewer/renderer-pdf'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: [pdfRenderer, cadRenderer, archiveRenderer],
}
```

## 能力边界

- 支持 ZIP、TAR、GZIP、RAR、7z 等常见压缩包目录预览。
- 优先使用 `libarchive.js` Worker + WASM，避免大压缩包阻塞主线程。
- Worker 不可用时自动回退到 ZIP / TAR / GZIP 兼容模式，适合手机 WebView、本地临时服务器和内网静态部署排障。
- 点击内部文件后才按需解压，并通过 `renderNestedBuffer` 或 core dispatcher 复用 PDF、Office、CAD、XMind、图片、代码等现有 renderer。
- 内置体积上限、单文件预览上限、Worker 超时、IndexedDB 缓存和下载入口，避免一次性把压缩包全部展开到内存。

## 离线资产

默认会从 viewer assets 下读取：

- `vendor/libarchive/worker-bundle.js`
- `vendor/libarchive/libarchive.wasm`

私有化部署时可以通过 `options.archive.workerUrl` 和 `options.archive.wasmUrl` 覆盖。

```ts
const options = {
  archive: {
    workerUrl: '/file-viewer/vendor/libarchive/worker-bundle.js',
    wasmUrl: '/file-viewer/vendor/libarchive/libarchive.wasm',
    cache: true,
    workerTimeoutMs: 30000,
  },
}
```

## 迁移说明

`@file-viewer/core` 已不再内置 archive renderer，也不再为压缩包链路直接安装 `libarchive.js`。ZIP/TAR/GZIP fallback、`jszip`、缓存和 Worker 逻辑由本包维护；core 在 OFD 完全拆出前可能仍会因 OFD vendor 临时保留 `jszip`。需要压缩包预览时，请显式安装本包，或直接使用 `@file-viewer/preset-all` 聚合能力。

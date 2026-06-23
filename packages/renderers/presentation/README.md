# @file-viewer/renderer-presentation

Flyfish File Viewer 的独立演示文稿 renderer 包，基于 `@file-viewer/pptx`，提供 PPTX/PPTM/POTX/POTM/PPSX/PPSM 渐进式幻灯片预览、缩放、打印和 HTML 导出能力。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { presentationRenderer } from '@file-viewer/renderer-presentation'

const options = {
  rendererMode: 'replace',
  renderers: presentationRenderer,
}
```

也可以和其他 renderer 组合：

```ts
const options = {
  rendererMode: 'replace',
  renderers: [presentationRenderer],
}
```

## 说明

- 该包专注 OOXML 演示文稿格式：`pptx`、`pptm`、`potx`、`potm`、`ppsx`、`ppsm`。
- `odp` 仍由 core 的 OpenDocument 兼容 renderer 负责，避免把不同格式族的解析链路混在一起。
- 渲染链路复用 `@file-viewer/pptx` 的 Worker 分页输出和资源解析能力，适合按需加载。

## 迁移说明

`@file-viewer/core` 已不再直接依赖 `@file-viewer/pptx`，PowerPoint 预览能力由本包和 `@file-viewer/preset-all` 承接。只安装 core 时，PPTX 会提示安装对应 renderer；需要官方 Demo 的完整格式矩阵时，直接传入 `allRenderers` 即可。

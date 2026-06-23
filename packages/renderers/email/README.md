# @file-viewer/renderer-email

Flyfish File Viewer 的独立邮件 renderer 包。它负责 `.eml`、`.msg`、`.mbox` 邮件预览、正文/头信息切换、附件下载和附件嵌套预览。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { emailRenderer } from '@file-viewer/renderer-email'

const options = {
  builtinRenderers: 'none',
  renderers: emailRenderer,
}
```

也可以与其他 renderer 组合：

```ts
import { emailRenderer } from '@file-viewer/renderer-email'
import { pdfRenderer } from '@file-viewer/renderer-pdf'
import { archiveRenderer } from '@file-viewer/renderer-archive'

const options = {
  builtinRenderers: 'none',
  renderers: [pdfRenderer, archiveRenderer, emailRenderer],
}
```

## 能力边界

- `.eml` 和 `.mbox` 使用 `postal-mime` 解析邮件头、HTML 正文、纯文本正文和附件。
- `.msg` 使用 `@kenjiuno/msgreader` 解析 Outlook MSG 文件。
- 支持 HTML / 正文 / 头信息切换，HTML 邮件在 sandbox iframe 中只读展示。
- 支持附件下载；宿主 viewer 提供 `renderNestedBuffer` 时，附件会继续复用 PDF、Office、图片、代码等现有 renderer。
- 不绑定任何在线服务或公共 CDN，适合内网附件中心、工单邮件归档和客户来信查看。

## 迁移说明

`@file-viewer/core` 已不再内置 email renderer，也不再直接安装 `postal-mime` / `@kenjiuno/msgreader`。需要邮件预览时，请显式安装本包，或直接使用 `@file-viewer/preset-all` 聚合能力。

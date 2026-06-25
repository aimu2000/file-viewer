# 快速开始

<div class="doc-kicker">Get Running Fast</div>

<p class="doc-lead">
  如果你现在最想做的事情是“尽快看到效果”，这一页就是最快路径。
  先选接入路线，再复制一段最小示例，十几分钟内你就能把预览器跑起来。
  一个组件，一行代码，快速集成。
</p>

## 三步接入

| 步骤 | 做什么 | 最短答案 |
| --- | --- | --- |
| 1 | 选生态组件 | 最轻入口用 `@file-viewer/web` / `@file-viewer/vue3` / `@file-viewer/react` 等标准包；一步到位用 `@file-viewer/web-full` / `@file-viewer/vue3-full` / `@file-viewer/react-full` 等 full 包 |
| 2 | 选格式能力 | 标准包按需注入 `preset-lite`、`preset-office`、`preset-engineering` 或 `preset-all`；full 包默认已启用完整矩阵 |
| 3 | 传入文件和 options | `url="/files/demo.pdf"` 或 `file={file}`，标准包把 `preset` 放进 `options`，full 包可直接传主题、工具栏、水印等业务配置 |

本页只保留最短可运行路径。完整 options、renderer 包清单和工具栏/水印/打印/搜索等参数见 [组件用法](/guide/usage)，按需装配和 Vite 插件细节见 [模块化与按需装配](/guide/on-demand-renderers)。

## 先选接入路线

| 方案 | 适合谁 | 优点 | 你应该看哪页 |
| --- | --- | --- | --- |
| 纯 JS 集成 | 非框架页面、微前端壳、任意 Web 系统 | `<flyfish-file-viewer>` 原生组件，也可用 `mountViewer` 命令式挂载 | [纯 JS 集成](/guide/quickstart-web) |
| Vue3 组件集成 | Vue 3 项目 | 主推组件体验，完整渲染能力直接进入 Vue 应用 | [Vue3 集成](/guide/quickstart-vue3) |
| Vue2 组件集成 | Vue2.7 / Vue2.6 项目 | 保留旧业务栈，体验与 Vue3 一致 | [Vue2 集成](/guide/quickstart-vue2) |
| React 组件集成 | React 16.8 / 17 / 18 / 19 项目 | 原生 React 组件，props、事件和 ref 都能直接调试 | [React 集成](/guide/quickstart-react) |
| jQuery / Svelte | 老后台、SvelteKit 或轻量页面 | 独立标准组件包，复用同一套 core 和 options | [生态组件总览](/guide/ecosystem) |
| Core / PPTX 引擎 | 自研组件、深度二开、单独验证 PPTX | framework-neutral 能力与独立 renderer 包 | [生态组件总览](/guide/ecosystem) |

<div class="doc-callout">
  <strong>推荐经验:</strong> 一个组件，一行代码，快速集成。core 只负责底层预览能力和 API；Vanilla JS / Pure Web、Vue、React、jQuery、Svelte 标准组件包负责各自生态的原生接入体验。所有标准组件包都使用同一套 options、事件、搜索、缩放、打印和导出语义。
</div>

## 先理解安装边界

直接安装 `@file-viewer/vue3`、`@file-viewer/react`、`@file-viewer/web` 这类标准组件包是最轻的接入方式，它们只提供当前框架的原生组件、类型、controller 和 core 基础能力，不会默认把 PDF、Office、CAD、Typst、压缩包等重型渲染依赖全部装进业务项目。

如果你的目标是“一个组件，一行代码，快速获得完整体验”，可以使用 full 包。full 包内部已引入 `@file-viewer/preset-all`，保留同样的组件 API，但默认具备官方 Demo 的完整格式矩阵。CDN / script 标签场景优先使用 `@file-viewer/web-full`，jsDelivr / unpkg 会直接从 npm 分发完整 IIFE，不需要把完整依赖下载到业务仓库；脚本会按自身 URL 自动定位随包分发的 Worker、WASM、字体和 vendor 资源。内网、严格 CSP 或完全离线部署时，再把这些资源同步到自己的静态域。

| 模式 | 安装示例 | 特点 |
| --- | --- | --- |
| 最轻标准包 | `npm i @file-viewer/vue3 @file-viewer/preset-office` | 按业务选择 preset / renderer，安装体积最可控 |
| 完整 full 包 | `npm i @file-viewer/vue3-full` | 默认启用 `preset-all`，适合后台全格式附件中心 |
| CDN full | `https://cdn.jsdelivr.net/npm/@file-viewer/web-full@latest/dist/flyfish-file-viewer-web-full.iife.js` | 无需本地安装，适合传统页面快速试跑完整矩阵 |

需要预览具体文件格式时，再选择一个 preset 或单独 renderer:

| 能力包 | 覆盖范围 | 推荐场景 |
| --- | --- | --- |
| `@file-viewer/preset-lite` | 文本、Markdown、代码、图片、音频、视频 | 常见轻附件、IM / 工单附件 |
| `@file-viewer/preset-office` | PDF、Word、Excel、PowerPoint、OFD、RTF、OpenDocument | OA、审批、知识库、合同归档 |
| `@file-viewer/preset-engineering` | CAD、3D、绘图、XMind、Geo、Typst、Archive、Data、EDA | 工程图纸、研发附件、设计资产 |
| `@file-viewer/preset-all` | 官方 Demo 的完整格式矩阵 | 演示站、内部全格式附件中心 |
| 单个 renderer | 例如 `@file-viewer/renderer-pdf`、`@file-viewer/renderer-word` | 只需要少数格式、追求最小依赖 |

最稳定的通用接入方式是显式 import preset 或 renderer，并通过 `options.preset` / `options.renderers` 注入给组件。这个方案不依赖 Vite，适用于 Webpack、Rspack、Rollup、Umi、传统多页应用、微前端壳和内部组件库。Vite 项目可以再使用 `@file-viewer/vite-plugin` 省去手动 import，并自动复制离线资源。

### 通用方案：options.preset 注入

安装当前生态组件包和一个 preset：

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-office
```

```ts
import officePreset from '@file-viewer/preset-office'

export const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

组件层只需要传同一份 options：

```vue
<file-viewer url="/files/demo.docx" :options="viewerOptions" />
```

多个能力包直接组合到同一个 `preset` 字段，不需要再学习第二个 options 名称：

```ts
import officePreset from '@file-viewer/preset-office'
import engineeringPreset from '@file-viewer/preset-engineering'

export const viewerOptions = {
  preset: [officePreset, engineeringPreset],
  rendererMode: 'replace'
}
```

只需要少数格式时，跳过 preset，直接安装单 renderer：

```bash
pnpm add @file-viewer/vue3 @file-viewer/renderer-pdf
```

```ts
import { pdfRenderer } from '@file-viewer/renderer-pdf'

export const viewerOptions = {
  renderers: [pdfRenderer],
  rendererMode: 'replace'
}
```

如果打开的是支持矩阵内但未装配的格式，预览器会给出应该安装哪个 preset / renderer 的提示；只有真正不在矩阵中的扩展名才提示不支持。

### 一步到位：full 包

full 包适合希望先获得完整格式体验、再按业务优化体积的团队。它们与标准包暴露同样的 props、事件、controller 和 options，只是默认已启用完整 preset：

| 生态 | full 包 | 标准包 |
| --- | --- | --- |
| Vanilla JS / Web Component | `@file-viewer/web-full` | `@file-viewer/web` |
| Vue 3 | `@file-viewer/vue3-full` | `@file-viewer/vue3` |
| Vue 2.7 | `@file-viewer/vue2.7-full` | `@file-viewer/vue2.7` |
| Vue 2.6 | `@file-viewer/vue2.6-full` | `@file-viewer/vue2.6` |
| React 18 / 19 | `@file-viewer/react-full` | `@file-viewer/react` |
| React 16.8 / 17 | `@file-viewer/react-legacy-full` | `@file-viewer/react-legacy` |
| jQuery | `@file-viewer/jquery-full` | `@file-viewer/jquery` |
| Svelte | `@file-viewer/svelte-full` | `@file-viewer/svelte` |

```bash
npm install @file-viewer/vue3-full
```

```ts
import FileViewer from '@file-viewer/vue3-full'
```

```vue
<file-viewer url="/files/contract.pdf" :options="{ theme: 'light', toolbar: { position: 'bottom-right' } }" />
```

React / Vue2 / Svelte / jQuery 只需要把包名替换为对应 full 包，组件写法保持一致。

### CDN full：完整能力快速试跑

无构建工具或临时验证页面可以直接使用 CDN full 包。CDN 不占用本地项目安装体积，适合演示、POC 和传统后台页面快速试跑：

```html
<div id="viewer" style="height:720px"></div>

<script src="https://cdn.jsdelivr.net/npm/@file-viewer/web-full@latest/dist/flyfish-file-viewer-web-full.iife.js"></script>
<script>
  FlyfishFileViewerWebFull.mountViewer(document.getElementById('viewer'), {
    url: '/files/demo.pdf',
    options: {
      theme: 'light',
      toolbar: { position: 'bottom-right' }
    }
  })
</script>
```

也可以使用原生组件写法：

```html
<script src="https://cdn.jsdelivr.net/npm/@file-viewer/web-full@latest/dist/flyfish-file-viewer-web-full.iife.js"></script>
<flyfish-file-viewer
  src="/files/demo.docx"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:720px"
></flyfish-file-viewer>
```

### Vite 插件：免配置自动装配

Vite 项目可以在通用方案基础上安装并注册插件。安装 `@file-viewer/vite-plugin` 和任意 `@file-viewer/preset-*` 后，在 `vite.config.ts` 注册 `fileViewerRenderers({ copyAssets:true })`，插件就会自动发现已安装 preset、注入 renderer virtual module，并复制 Worker / WASM / 字体 / vendor 资源。业务代码可以不再手动 import preset：

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-office
pnpm add -D @file-viewer/vite-plugin
```

```ts
// vite.config.ts
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default {
  plugins: [
    fileViewerRenderers({
      copyAssets: true
      // 无需 preset:'office'，插件会自动发现已安装的 @file-viewer/preset-office。
    })
  ]
}
```

重度用户需要最快拥有全部能力时，直接把 preset 换成全量包：

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-all
pnpm add -D @file-viewer/vite-plugin
```

需要自定义时再显式配置：

| 选项 | 适合场景 |
| --- | --- |
| `copyAssets:true` | 自动复制 Worker、WASM、PDF 字体、CAD、Typst、Archive、Data 等离线资源，推荐生产和内网部署开启 |
| `formats` / `renderers` | 不使用 preset、或在 preset 外补充少数格式时，生成精确 renderer import |
| `scan:true` | 让插件扫描 `fileViewerFormats`、`data-file-viewer-formats`、上传 `accept` 等源码 hint |
| `preset:'auto'` / `autoPresets:true` | 开启 `scan:true` 时仍保持“根据已安装 preset 自动激活能力” |
| `inject:false` | 关闭自动注入，改为手动导入 `virtual:file-viewer-renderers` 并传给 `options.renderers` |
| `chunkStrategy:'renderer'` | 按 renderer 拆分 chunk，方便缓存、排查和分析重型格式体积 |

默认推荐路径是 `fileViewerRenderers({ copyAssets:true })`。只有需要极致裁剪、源码扫描或严格 registry 管理时，才需要显式配置上面的选项。

## 运行环境

- Node.js `>= 18`
- 纯 JS、React、Vue2 / Vue3 项目都可以使用 npm、pnpm、yarn 或业务项目已有包管理器
- 浏览器需要支持现代前端能力，建议优先在最新版 Chrome 或 Edge 中联调

## 语言与文案

组件默认 `locale: 'auto'`，会根据浏览器语言在中文和英文之间自动选择。需要固定语言或覆盖文案时，直接通过同一套 `options` 传入:

```ts
const options = {
  locale: 'en-US',
  messages: {
    'toolbar.download': 'Save file'
  }
}
```

也可以使用分组写法:

```ts
const options = {
  i18n: {
    locale: 'zh-CN',
    messages(key, params, locale) {
      return key === 'state.empty.title' ? '请选择文件' : undefined
    }
  }
}
```

`locale`、`messages` 和 `i18n` 在 Vanilla JS / Pure Web、Vue、React、jQuery、Svelte 标准组件包中保持一致。

## 纯 JS 最短路径

```bash
npm install @file-viewer/web @file-viewer/preset-office
```

```html
<flyfish-file-viewer
  src="/files/demo.pdf"
  locale="zh-CN"
  theme="light"
  toolbar-position="bottom-right"
  style="display:block;height:100vh"
></flyfish-file-viewer>

<script type="module">
  import { defineFileViewerElement } from '@file-viewer/web'
  import officePreset from '@file-viewer/preset-office'

  defineFileViewerElement()

  const viewer = document.querySelector('flyfish-file-viewer')
  viewer.options = {
    preset: officePreset,
    rendererMode: 'replace'
  }
</script>
```

传统后台页面或无构建工具项目请使用 IIFE 全局包接入；详细示例见 [纯 JS 集成](/guide/quickstart-web)。

## Vue3 最短路径

```bash
pnpm add @file-viewer/vue3 @file-viewer/preset-office
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer).mount('#app')
```

```vue
<script setup lang="ts">
import officePreset from '@file-viewer/preset-office'

const options = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' },
  watermark: { text: '内部预览', opacity: 0.14 }
}
</script>

<template>
  <div style="height: 100vh">
    <file-viewer url="/files/demo.docx" :options="options" />
  </div>
</template>
```

## Vue2 最短路径

Vue2.7 项目优先使用 `@file-viewer/vue2.7`，能力与 Vue3 包保持一致，入口会自动带上样式:

```bash
pnpm add @file-viewer/vue2.7 @file-viewer/preset-office
```

```ts
import Vue from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue2.7'

Vue.use(FileViewer)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

Vue2.6 老项目使用 `@file-viewer/vue2.6`。完整步骤见 [Vue2 集成](/guide/quickstart-vue2)。

## React 最短路径

```bash
npm install @file-viewer/react @file-viewer/preset-office
```

```tsx
import FileViewer from '@file-viewer/react'
import officePreset from '@file-viewer/preset-office'

export function Preview() {
  return (
    <div style={{ height: '100vh' }}>
      <FileViewer
        url="/files/demo.docx"
        options={{
          preset: officePreset,
          rendererMode: 'replace',
          theme: 'light',
          toolbar: { position: 'bottom-right' }
        }}
      />
    </div>
  )
}
```

完整步骤见 [React 集成](/guide/quickstart-react)。

## 下一步建议

- 想了解 Demo 中每个示例文件的作用: 看 [Demo 说明](/guide/demo)
- 想查看 Vanilla JS / Pure Web、Vue3、Vue2、React、jQuery、Svelte、Core 和 PPTX 引擎的完整包矩阵: 看 [生态组件总览](/guide/ecosystem)
- 想明确 `file`、`url`、水印、工具栏、压缩包缓存和导出的参数行为: 看 [组件用法](/guide/usage)
- 准备做本地验证和打包: 看 [本地开发与打包](/guide/development)
- 想下载公开源码、成品或了解优先支持: 看 [发布与开源分发](/guide/distribution)

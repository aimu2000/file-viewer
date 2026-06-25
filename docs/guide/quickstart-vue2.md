# Vue2 集成

<div class="doc-kicker">For Vue 2 Projects</div>

<p class="doc-lead">
  Vue2 已拆成 <code>@file-viewer/vue2.7</code> 和 <code>@file-viewer/vue2.6</code> 两条标准包线。
  它们面向仍在 Vue2 的业务系统，格式能力、示例文件和 options / 事件语义与 Vue3 包保持一致。
</p>

## 安装

```bash
pnpm add @file-viewer/vue2.7 @file-viewer/preset-office
```

Vue2.6 项目请安装:

```bash
pnpm add @file-viewer/vue2.6 @file-viewer/preset-office
```

只安装 `@file-viewer/vue2.7` 或 `@file-viewer/vue2.6` 是最轻组件入口；PDF、Office、CAD、Typst、压缩包等具体格式能力由 preset 或 renderer 提供。Webpack、Rspack、Rollup、Umi、传统多页应用等非 Vite 项目优先通过 `options.preset` 显式注入能力：

```ts
import officePreset from '@file-viewer/preset-office'

const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right' }
}
```

Vite 项目可以额外加入插件，插件会自动发现已安装的 `@file-viewer/preset-*` 并省去手动 import preset。注意：只安装插件包不会让 Vite 自动运行，仍需要在 `vite.config.ts` 注册一次插件：

```bash
pnpm add -D @file-viewer/vite-plugin
```

```ts
import { defineConfig } from 'vite'
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
})
```

需要完整格式矩阵时，把 `@file-viewer/preset-office` 换成 `@file-viewer/preset-all`，Vite 配置保持一致：

```bash
pnpm add @file-viewer/vue2.7 @file-viewer/preset-all
```

也可以使用 full 包一步到位：Vue2.7 使用 `@file-viewer/vue2.7-full`，Vue2.6 使用 `@file-viewer/vue2.6-full`。full 包默认启用完整格式矩阵，组件、事件和 controller API 与标准包一致：

```bash
pnpm add @file-viewer/vue2.7-full
```

```ts
import Vue from 'vue'
import FileViewer from '@file-viewer/vue2.7-full'

Vue.use(FileViewer)
```

如果是 Vue 2.6 项目，把组件包替换为 `@file-viewer/vue2.6` 或 `@file-viewer/vue2.6-full` 即可。需要更强自定义时，再配置 `formats`、`renderers`、`scan:true`、`inject:false` 或 `chunkStrategy:'renderer'`；常规项目保持 `fileViewerRenderers({ copyAssets:true })` 即可。

## 注册插件

```ts
import Vue from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue2.7'

Vue.use(FileViewer)

new Vue({
  render: h => h(App)
}).$mount('#app')
```

Vue2 入口会自动带上样式，不需要再额外 import CSS。

## URL 预览

```vue
<template>
  <div style="height: 100vh">
    <file-viewer :url="url" :options="options" />
  </div>
</template>

<script>
import officePreset from '@file-viewer/preset-office'

export default {
  data() {
    return {
      url: 'https://example.com/demo.pdf',
      options: {
        theme: 'light',
        preset: officePreset,
        rendererMode: 'replace',
        toolbar: { position: 'bottom-right' },
        watermark: { text: '内部预览', opacity: 0.14 },
        archive: {
          cache: true,
          workerTimeoutMs: 30000
        }
      }
    }
  }
}
</script>
```

## File 预览

```vue
<template>
  <div style="height: 100vh">
    <input type="file" @change="onChange" />
    <div style="height: calc(100vh - 40px)">
      <file-viewer :file="file" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      file: undefined
    }
  },
  methods: {
    onChange(event) {
      const value = event.target.files && event.target.files.item(0)
      if (value) {
        this.file = value
      }
    }
  }
}
</script>
```

## 与其他生态版本保持一致

Vue2.7 / Vue2.6 标准包共享同一套 core 接口和 renderer/preset 装配能力；完整矩阵可覆盖 Word、Excel、PPT、PDF、OFD、Typst、XMind 脑图、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、代码高亮、图片、音视频、字体、设计资产和结构化数据。差异主要在包名和 Vue 运行时版本:

两条分支也共享同一套打印和缩放能力判断: `toolbar.print` / `toolbar.zoom` 只表示业务是否显示按钮，真实按钮会结合当前文件类型、渲染完成状态、导出适配器和缩放 provider 动态显隐。`toolbar.position` 支持 `auto`、`top`、`bottom-right`，默认 `auto`，PDF 会自动悬浮到右下角以避开自身导航栏。Word / PDF 会输出完整页面，不适合直接打印的表格、压缩包、邮件、EPUB、音视频、3D / 模型等链路会隐藏打印按钮；Excel 等虚拟表格不会被外层 CSS 强行缩放。`options.theme` 支持 `light`、`dark`、`system`，默认继续跟随系统；浅色业务系统建议显式传 `light`。

| 版本 | npm 包 | 最新版本 | 注册方式 |
| --- | --- | --- | --- |
| Vue2.7 | `@file-viewer/vue2.7` | `latest` | `Vue.use(FileViewer)` |
| Vue2.6 | `@file-viewer/vue2.6` | `latest` | `Vue.use(FileViewer)` |
| Vue2.7 Full | `@file-viewer/vue2.7-full` | `latest` | 默认启用完整格式矩阵 |
| Vue2.6 Full | `@file-viewer/vue2.6-full` | `latest` | 默认启用完整格式矩阵 |
| Vue3 | `@file-viewer/vue3` | `latest` | `createApp(App).use(FileViewer)` |

历史包名 `@flyfish-group/file-viewer` 仍同步维护，对应 Vue2.7 线；新项目建议优先使用标准包名。

<div class="doc-note">
  如果一个预览能力需要被多个不同技术栈系统复用，建议统一使用标准组件包线，让 Vanilla JS / Pure Web、Vue、React、jQuery 和 Svelte 共享同一套 core 能力和运行参数。完整矩阵见 <a href="/guide/ecosystem">生态组件总览</a>。
</div>

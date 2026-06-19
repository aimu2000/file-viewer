# Vue2 集成

<div class="doc-kicker">For Vue 2.7 Projects</div>

<p class="doc-lead">
  Vue2 包已经同步发布到 <code>@flyfish-group/file-viewer@2.0.0</code>。
  它面向 Vue2.7 项目，格式能力、示例文件和 options / 事件语义与 Vue3 包保持一致。
</p>

## 安装

```bash
pnpm add @flyfish-group/file-viewer
```

也可以使用 `npm`:

```bash
npm install --save @flyfish-group/file-viewer
```

## 注册插件

```ts
import Vue from 'vue'
import App from './App.vue'
import FileViewer from '@flyfish-group/file-viewer'

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
export default {
  data() {
    return {
      url: 'https://example.com/demo.pdf',
      options: {
        theme: 'light',
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

## 与 Vue3 版本保持一致

Vue2 `main` 分支和 Vue3 `v3` 分支共享同一套预览能力，包括 Word、Excel、PPT、PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、代码高亮、图片、音视频、字体、设计资产和结构化数据。差异主要在包名和插件注册入口:

两条分支也共享同一套打印和缩放能力判断: `toolbar.print` / `toolbar.zoom` 只表示业务是否显示按钮，真实按钮会结合当前文件类型、渲染完成状态、导出适配器和缩放 provider 动态显隐。`toolbar.position` 支持 `auto`、`top`、`bottom-right`，默认 `auto`，PDF 会自动悬浮到右下角以避开自身导航栏。Word / PDF 会输出完整页面，不适合直接打印的表格、压缩包、邮件、EPUB、音视频、3D / 模型等链路会隐藏打印按钮；Excel 等虚拟表格不会被外层 CSS 强行缩放。`options.theme` 支持 `light`、`dark`、`system`，默认继续跟随系统；浅色业务系统建议显式传 `light`。

| 版本 | npm 包 | 最新版本 | 注册方式 |
| --- | --- | --- | --- |
| Vue2.7 | `@flyfish-group/file-viewer` | `2.0.0` | `Vue.use(FileViewer)` |
| Vue3 | `@flyfish-group/file-viewer3` | `2.0.0` | `createApp(App).use(FileViewer)` |

<div class="doc-note">
  如果一个预览能力需要被多个不同技术栈系统复用，建议统一使用标准组件包线，让 Vue、React、纯 JS、jQuery 和 Svelte 共享同一套 core 能力和运行参数。
</div>

# Vue3 集成

<div class="doc-kicker">For Vue 3 Projects</div>

<p class="doc-lead">
  如果你的业务工程本身就是 Vue 3，这条路线几乎是最顺手的。
  安装组件、注册一次，然后把文件 URL 或二进制交给它，剩下的渲染工作交给预览器处理。
</p>

当前 Vue3 标准 npm 包是 `@file-viewer/vue3@2.0.0`，历史包名 `@flyfish-group/file-viewer3@2.0.0` 会继续同步维护。Vue3 标准组件包 直接使用共享 core 能力，并提供 Vue 插件、组件 props、ref API 和类型出口。

## 安装

```bash
pnpm add @file-viewer/vue3
```

也可以使用 `npm`:

```bash
npm install --save @file-viewer/vue3
```

## 全局注册

包默认导出的是一个 Vue 插件，推荐在 `main.ts` 中全局注册:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FileViewer from '@file-viewer/vue3'

createApp(App).use(FileViewer).mount('#app')
```

Vue3 入口会自动把样式带进来，所以这里只需要正常 `use(FileViewer)`。

## 页面中使用

### 通过 URL 预览

```vue
<script setup lang="ts">
import { ref } from 'vue'

const url = ref('https://example.com/demo.pdf')
</script>

<template>
  <div class="viewer-shell">
    <file-viewer :url="url" />
  </div>
</template>

<style scoped>
.viewer-shell {
  height: 100vh;
}
</style>
```

### 通过上传文件预览

```vue
<script setup lang="ts">
import { ref } from 'vue'

const file = ref<File | undefined>()

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.files?.item(0)
  if (value) file.value = value
}
</script>

<template>
  <div class="page">
    <input type="file" @change="onChange" />
    <div class="viewer-shell">
      <file-viewer :file="file" />
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
}

.viewer-shell {
  height: calc(100vh - 40px);
}
</style>
```

## 参数行为

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `url` | `string` | 组件内部会使用 `axios` 拉取文件，再交给对应渲染器解析 |
| `file` | `File` | 推荐直接传入带正确扩展名的 `File`，适合本地上传预览或业务侧已完成鉴权下载的场景 |
| `options` | `FileViewerOptions` | 可选运行配置，支持主题、工具栏、水印、压缩包 Worker、缓存和体积上限 |

当 `file` 和 `url` 同时存在时，组件会优先渲染 `file`。如果后续 `file` 被清空，组件会回退到 `url` 继续加载。

如果你的业务侧拿到的是 `Blob` 或 `ArrayBuffer`，推荐先包装成带扩展名的 `File` 再传入，例如:

```ts
file.value = new File([blob], 'contract.pdf', { type: blob.type })
```

### 配置水印、导出和压缩包

```vue
<file-viewer
  :url="url"
  :options="{
    theme: 'light',
    toolbar: { position: 'bottom-right', download: true, print: true, exportHtml: true },
    watermark: { text: '内部预览', opacity: 0.14 },
    archive: {
      cache: true,
      workerTimeoutMs: 30000
    }
  }"
/>
```

`toolbar.print` / `toolbar.zoom` 表示业务允许显示打印和缩放按钮，最终按钮还会结合当前文件类型、渲染完成状态、导出适配器和缩放 provider 动态显隐。`toolbar.position` 支持 `auto`、`top`、`bottom-right`，默认 `auto`，PDF 会自动悬浮到右下角以避开自身页码、缩放和目录导航栏。Word / PDF 会输出完整页面；表格、压缩包、邮件、EPUB、音视频、3D / 模型等不适合直接打印的链路会自动隐藏打印按钮，Excel 等虚拟表格不会被外层 CSS 强行缩放。

## 常见接入建议

### 给容器一个明确高度

预览器默认会填满父容器，所以父容器必须是有高度的。最常见的写法是 `100vh`，或者在后台页面里使用 Flex 布局撑开:

```vue
<template>
  <div class="page">
    <header class="toolbar">工具栏</header>
    <main class="content">
      <file-viewer :url="url" />
    </main>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  min-height: 0;
}
</style>
```

### URL 方案要注意 CORS

如果你使用 `url` 参数，本质上是在浏览器里请求目标文件。只要文件地址不可直接访问，或者服务端没有返回正确的跨域头，预览就会失败。这种场景建议由业务侧先完成鉴权下载，再切换到 `file` 参数。

### 局部注册也可以

如果你不想全局 `use()`，也可以从包中按需导出组件:

```ts
import { FileViewer } from '@file-viewer/vue3'
```

## Vue2 项目怎么选

Vue2.7 项目请使用 `@file-viewer/vue2.7@2.0.0` 或历史包名 `@flyfish-group/file-viewer@2.0.0`，插件注册方式是 `Vue.use(FileViewer)`。两条包线的文件格式能力、Demo 样例和运行参数保持一致，详细步骤见 [Vue2 集成](/guide/quickstart-vue2)。

## 更适合平台化的方案

如果你正在做的是统一附件中心或多个系统共用预览能力，建议先统一到 core + component 的包线管理: Vue、React、纯 JS、jQuery、Svelte 使用同一套 options、事件和文件输入语义，业务侧只需要按技术栈选择对应标准组件包。

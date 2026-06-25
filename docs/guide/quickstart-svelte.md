# Svelte 集成

<div class="doc-kicker">For Svelte Projects</div>

<p class="doc-lead">
  Svelte 包提供原生组件和 action 两种入口。组件适合页面声明式使用，action 适合已有 DOM 容器或轻量工具页。
</p>

## 安装

最轻入口按需选择 preset：

```bash
npm install @file-viewer/svelte @file-viewer/preset-office
```

一步到位完整能力使用 full 包：

```bash
npm install @file-viewer/svelte-full
```

`@file-viewer/svelte-full` 默认启用 `@file-viewer/preset-all`，组件、action、事件和 controller API 与标准包一致。

## 组件用法

```svelte
<script lang="ts">
  import FileViewer from '@file-viewer/svelte'
  import officePreset from '@file-viewer/preset-office'

  const options = {
    preset: officePreset,
    rendererMode: 'replace',
    theme: 'light',
    toolbar: { position: 'bottom-right' },
    archive: { cache: true }
  }

  function handleViewerEvent(event) {
    console.log(event.detail.type, event.detail.payload)
  }
</script>

<section style="height: 100vh">
  <FileViewer
    url="/files/report.docx"
    {options}
    on:viewerEvent={handleViewerEvent}
  />
</section>
```

full 包写法只替换包名，不需要手动 import preset：

```svelte
<script lang="ts">
  import FileViewer from '@file-viewer/svelte-full'

  const options = {
    theme: 'light',
    toolbar: { position: 'bottom-right' }
  }
</script>

<section style="height: 100vh">
  <FileViewer url="/files/demo.pdf" {options} />
</section>
```

## Action 用法

如果你不想使用组件，可以直接把 action 挂到已有容器：

```svelte
<script lang="ts">
  import { fileViewer } from '@file-viewer/svelte'
  import officePreset from '@file-viewer/preset-office'

  const viewerOptions = {
    url: '/files/report.pdf',
    options: {
      preset: officePreset,
      rendererMode: 'replace',
      theme: 'light'
    }
  }
</script>

<div use:fileViewer={viewerOptions} style="height: 720px"></div>
```

## Vite 自动装配

SvelteKit / Vite 项目可以注册插件，让已安装 preset 自动激活，并复制 Worker / WASM / 字体 / vendor 资源：

```bash
npm install -D @file-viewer/vite-plugin
```

```ts
import { fileViewerRenderers } from '@file-viewer/vite-plugin'

export default {
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
}
```

非 Vite 项目继续使用 `options.preset` / `options.renderers` 显式注入能力即可。

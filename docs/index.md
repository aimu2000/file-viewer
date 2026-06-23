---
layout: page
title: Flyfish Viewer
titleTemplate: false
---

<main class="doc-home">
<section class="doc-home-hero">
<div class="doc-home-hero-inner">
<div class="doc-eyebrow">Official Docs And Component Home</div>
<h1>Flyfish Viewer</h1>
<p>
纯前端多格式文件预览组件。把 Word、Excel、PPT、PDF、OFD、Typst、XMind 脑图、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、Excalidraw、draw.io、Mermaid、PlantUML、EPUB、UMD、Markdown、代码、Git patch/bundle、图片、音视频、字体、PSD 图层资产和结构化数据预览能力放进浏览器端，
同时提供 Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery 和 Svelte 原生集成路径。
一个组件，一行代码，快速集成。
</p>
<div class="doc-home-actions">
<a class="doc-action doc-action-primary" href="/guide/quickstart">快速开始</a>
<a class="doc-action" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">在线 Demo</a>
<a class="doc-action" href="https://demo.file-viewer.app/compare.html" target="_blank" rel="noreferrer">文档比对</a>
<a class="doc-action" href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub 开源总仓库</a>
</div>
</div>
</section>

<section class="doc-home-metrics" aria-label="Flyfish Viewer 核心指标">
<div>
<strong>206</strong>
<span>个扩展名映射</span>
</div>
<div>
<strong>24</strong>
<span>条预览链路</span>
</div>
<div>
<strong>15</strong>
<span>个 npm 发布入口</span>
</div>
<div>
<strong>Native</strong>
<span>多生态一致接入</span>
</div>
</section>

<section class="doc-section">
<div class="doc-section-heading">
<span>Product Experience</span>
<h2>产品化的文件预览，而不是格式清单</h2>
<p>
文档解析、阅读布局、示例验收和分发交付被放在同一条链路里维护。接入前可以先看真实 Demo，
接入后也能通过 npm、私有化静态站和各生态标准组件包继续迭代。
</p>
</div>

<div class="doc-showcase">
<figure>
<img src="/_images/demo-main.png" alt="Flyfish Viewer 在线预览器主界面" />
<figcaption>在线 Demo 和私有化 Demo 都包含示例文件选择器、上传入口和多格式预览区，可直接用于验收真实浏览体验。</figcaption>
</figure>
<div class="doc-showcase-list">
<article>
<span>01</span>
<h3>打开即适配阅读宽度</h3>
<p>PDF 和 Word 会按当前视口计算默认缩放，PDF 支持页侧边栏和目录树侧边栏切换，Word / PDF 打印使用专属完整页适配器，其他格式按能力动态显隐打印按钮。</p>
</article>
<article>
<span>02</span>
<h3>重型能力按需进入</h3>
<p>OFD、Typst、XMind、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、绘图、EPUB、UMD、PDF、Office、Markdown、音视频、HEIC、HLS、字体/数据资产和代码高亮都拆成异步块，命中格式时再加载。</p>
</article>
<article>
<span>03</span>
<h3>示例覆盖完整验收路径</h3>
<p>示例文件按文档、表格、图纸、脑图与绘图、地理数据、电子书、压缩包、邮件、EDA、代码、媒体和数据资产等类型分组，方便快速定位和回归。</p>
</article>
<article>
<span>04</span>
<h3>独立比对不污染主入口</h3>
<p><code>/compare.html</code> 提供左右并排预览、示例选择、URL、本地上传、交换、同步滚动、聚焦文档浮层搜索、行级定位和 PDF 工具栏隐藏，适合合同、报告、PPT 和导出物的视觉核对。</p>
</article>
</div>
</div>
</section>

<section class="doc-section doc-demo-embed">
<div class="doc-section-heading">
<span>Live Workbench</span>
<h2>无需离开文档，即可打开完整 Demo</h2>
<p>
下方嵌入的是 <code>demo.file-viewer.app</code> 的生产 Demo。它会在独立 iframe 中运行，保留完整示例矩阵、上传预览和文档比对入口；你也可以单独打开 Demo，用更大的视口做真实文件验收。
</p>
</div>
<div class="doc-demo-frame-shell">
<div class="doc-demo-frame-bar">
<span></span>
<span></span>
<span></span>
<strong>demo.file-viewer.app</strong>
<a href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">单独打开</a>
</div>
<iframe
  src="https://demo.file-viewer.app/?embed=docs-home"
  title="Flyfish File Viewer 在线 Demo"
  loading="lazy"
></iframe>
</div>
</section>

<section class="doc-section doc-section-muted">
<div class="doc-section-heading">
<span>Why It Works</span>
<h2>为业务系统准备的工程取舍</h2>
<p>它不是一个只展示单一 PDF 的小组件，而是一套面向附件中心、OA、知识库和工单系统的前端预览方案。</p>
</div>

<div class="doc-value-grid">
<article class="doc-card">
<h3>少一条服务端链路</h3>
<p>大多数格式直接在浏览器完成解析，不需要把附件交给后端转 PDF，也减少临时文件和队列任务。</p>
</article>
<article class="doc-card">
<h3>格式覆盖贴近业务</h3>
<p>除了 Office、PDF 和图片，也补齐 OFD、Typst、XMind 脑图、压缩包、邮件、OLB/DRA/GDS/OASIS、CAD、地理数据、3D 模型、Excalidraw、draw.io、Mermaid、PlantUML、EPUB、UMD、Markdown、代码、日志、配置文件、Git patch/bundle、音视频、字体、PSD 图层、SQLite、WASM、Parquet、Avro 和 WebArchive；XMind / Mermaid / PlantUML 使用 Panzoom 支持拖拽平移、移动端双指缩放和适配画布，结构化数据由独立 <code>@file-viewer/renderer-data</code> 承接，EDA 由独立 <code>@file-viewer/renderer-eda</code> 承接，标准 GDSII 可生成 SVG / WebGL 版图预览，OASIS 文本夹具可生成 SVG，PPTX 由独立开源的 <code>@file-viewer/pptx</code> 原生引擎承接，对组合图形、主题背景和 EMF 图片做了专门增强。</p>
</article>
<article class="doc-card">
<h3>阅读质感有兜底</h3>
<p>Word 保留白色纸张和灰色页面底，PDF 具备缩放、页码、页面/目录导航和宽度自适应，PPTX 通过 <code>@file-viewer/pptx</code> 尽量保留模板背景、组合元素和矢量插图。</p>
</article>
<article class="doc-card">
<h3>接入边界清晰</h3>
<p>Vanilla JS / Pure Web、Vue3、Vue2.7、Vue2.6、React、React Legacy、jQuery 和 Svelte 都有明确示例，URL、File、Blob 转 File 等输入路径也已写明。</p>
</article>
<article class="doc-card">
<h3>开源总仓一站式入口</h3>
<p>GitHub / Gitee 同步 core、标准组件包、Demo、文档源码、构建产物、样例文件和 release tarball。</p>
</article>
<article class="doc-card">
<h3>版本交付可追踪</h3>
<p>README、文档站、Demo、npm 包和开源总仓库同步维护，便于验收和分发。</p>
</article>
</div>
</section>

<section class="doc-section">
<div class="doc-section-heading">
<span>Choose Your Path</span>
<h2>按你的接入场景开始</h2>
<p>先选路线，再进入对应文档。每条路线都给出最短示例和真实项目里的注意事项。</p>
</div>

<div class="doc-callout">
<strong>接入亮点:</strong> 一个组件，一行代码，快速集成。Vanilla JS、Vue、React、jQuery 和 Svelte 都使用标准组件包接入，底层能力一致，上层体验保持各自生态的原生方式。
</div>

<div class="doc-path-grid">
<a class="doc-path-card" href="/guide/quickstart-web">
<strong>Vanilla JS / 纯 JS 页面</strong>
<span>安装 @file-viewer/web，优先用 &lt;flyfish-file-viewer&gt; 原生组件，也可用 mountViewer 命令式挂载。</span>
</a>
<a class="doc-path-card" href="/guide/quickstart-vue3">
<strong>Vue 3 项目</strong>
<span>安装 @file-viewer/vue3，使用 createApp(App).use(FileViewer)，样式会随安装器自动带入。</span>
</a>
<a class="doc-path-card" href="/guide/quickstart-vue2">
<strong>Vue2 项目</strong>
<span>Vue2.7 安装 @file-viewer/vue2.7，Vue2.6 安装 @file-viewer/vue2.6，统一使用 Vue.use(FileViewer)。</span>
</a>
<a class="doc-path-card" href="/guide/quickstart-react">
<strong>React 项目</strong>
<span>React 18/19 使用 @file-viewer/react，React 16.8/17 使用 @file-viewer/react-legacy。</span>
</a>
<a class="doc-path-card" href="/guide/ecosystem#svelte">
<strong>Svelte 项目</strong>
<span>安装 @file-viewer/svelte，使用 Svelte 组件或 action 原生接入。</span>
</a>
<a class="doc-path-card" href="/guide/ecosystem#jquery">
<strong>jQuery 后台</strong>
<span>安装 @file-viewer/jquery，用 $(el).fileViewer(options) 接入传统系统。</span>
</a>
<a class="doc-path-card" href="/guide/ecosystem#core">
<strong>Core 自定义</strong>
<span>使用 @file-viewer/core 构建自研组件层，复用底层格式能力和统一 API。</span>
</a>
<a class="doc-path-card" href="/guide/ecosystem#pptx">
<strong>PPTX 引擎</strong>
<span>使用 @file-viewer/pptx 单独验证或复用原生幻灯片渲染能力。</span>
</a>
<a class="doc-path-card" href="/guide/usage">
<strong>统一 API</strong>
<span>查看 options、事件、搜索、缩放、打印、导出和 beforeOperation 钩子。</span>
</a>
<a class="doc-path-card" href="/guide/distribution">
<strong>开源与支持</strong>
<span>下载开源总仓库、分散组件仓库和 release 产物，或通过官方渠道支持项目并获得优先协助。</span>
</a>
</div>
</section>

<section class="doc-final-band">
<div>
<span>Official Resources</span>
<h2>官网用于验证，组件用于私有化接入</h2>
<p>
官方文档是 <a href="https://doc.file-viewer.app">doc.file-viewer.app</a>，
在线预览是 <a href="https://demo.file-viewer.app">demo.file-viewer.app</a>，
官网门户是 <a href="https://file-viewer.app">file-viewer.app</a>，
开源总仓库是 <a href="https://github.com/flyfish-dev/file-viewer">github.com/flyfish-dev/file-viewer</a>，
Gitee 镜像是 <a href="https://gitee.com/flyfish-dev/file-viewer">gitee.com/flyfish-dev/file-viewer</a>。
Vanilla JS / Pure Web、React、jQuery 和 Svelte 组件默认在业务页面内原生挂载预览器，不会把官网 Demo 地址作为内置依赖。
</p>
</div>
<a class="doc-action doc-action-primary" href="/guide/">进入文档导览</a>
</section>
</main>

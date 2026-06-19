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
纯前端多格式文件预览组件。把 Word、Excel、PPT、PDF、OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、代码、图片、音视频、字体、设计资产和结构化数据预览能力放进浏览器端，
同时提供 Vue3、Vue2.7、React、纯 JS、jQuery 和 Svelte 原生集成路径。
</p>
<div class="doc-home-actions">
<a class="doc-action doc-action-primary" href="/guide/quickstart">快速开始</a>
<a class="doc-action" href="https://viewer.flyfish.dev" target="_blank" rel="noreferrer">在线 Demo</a>
<a class="doc-action" href="https://viewer.flyfish.dev/compare.html" target="_blank" rel="noreferrer">文档比对</a>
<a class="doc-action" href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub 开源总仓库</a>
</div>
</div>
</section>

<section class="doc-home-metrics" aria-label="Flyfish Viewer 核心指标">
<div>
<strong>194</strong>
<span>个扩展名映射</span>
</div>
<div>
<strong>23</strong>
<span>条预览链路</span>
</div>
<div>
<strong>14</strong>
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
接入后也能通过 npm、私有化静态站和各生态标准组件包 继续迭代。
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
<p>OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、绘图、EPUB、UMD、PDF、Office、Markdown、音视频、HEIC、HLS、字体/数据资产和代码高亮都拆成异步块，命中格式时再加载。</p>
</article>
<article>
<span>03</span>
<h3>示例覆盖完整验收路径</h3>
<p>示例文件按文档、表格、图纸、地理数据、电子书、压缩包、邮件、EDA、代码、媒体和数据资产等类型分组，方便快速定位和回归。</p>
</article>
<article>
<span>04</span>
<h3>独立比对不污染主入口</h3>
<p><code>/compare.html</code> 提供左右并排预览、示例选择、URL、本地上传、交换、同步滚动、聚焦文档浮层搜索、行级定位和 PDF 工具栏隐藏，适合合同、报告、PPT 和导出物的视觉核对。</p>
</article>
</div>
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
<p>除了 Office、PDF 和图片，也补齐 OFD、Typst、压缩包、邮件、OLB/DRA、CAD、地理数据、3D 模型、Excalidraw、draw.io、EPUB、UMD、Markdown、代码、日志、配置文件、音视频、字体、PSD、SQLite、WASM、Parquet、Avro 和 WebArchive；PPTX 对组合图形、主题背景和 EMF 图片做了专门增强。</p>
</article>
<article class="doc-card">
<h3>阅读质感有兜底</h3>
<p>Word 保留白色纸张和灰色页面底，PDF 具备缩放、页码、页面/目录导航和宽度自适应，PPTX 会尽量保留模板背景、组合元素和矢量插图。</p>
</article>
<article class="doc-card">
<h3>接入边界清晰</h3>
<p>Vue3、Vue2.7、React、纯 JS、jQuery 和 Svelte 都有明确示例，URL、File、Blob 转 File 等输入路径也已写明。</p>
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

<div class="doc-path-grid">
<a class="doc-path-card" href="/guide/quickstart-vue3">
<strong>Vue 3 项目</strong>
<span>安装 @flyfish-group/file-viewer3@2.0.0，使用 createApp(App).use(FileViewer)，样式会随安装器自动带入。</span>
</a>
<a class="doc-path-card" href="/guide/quickstart-vue2">
<strong>Vue2.7 项目</strong>
<span>安装 @flyfish-group/file-viewer@2.0.0，使用 Vue.use(FileViewer)，安装器会自动带上样式。</span>
</a>
<a class="doc-path-card" href="/guide/quickstart-react">
<strong>React 项目</strong>
<span>安装 @file-viewer/react@2.0.0，使用原生 React 组件挂载完整预览器。</span>
</a>
<a class="doc-path-card" href="/guide/quickstart-web">
<strong>纯 JS 页面</strong>
<span>安装 @file-viewer/web@2.0.0，用 mountViewer 直接挂载到目标 DOM。</span>
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
官方文档是 <a href="https://doc.flyfish.dev">doc.flyfish.dev</a>，
在线预览是 <a href="https://viewer.flyfish.dev">viewer.flyfish.dev</a>，
开源总仓库是 <a href="https://github.com/flyfish-dev/file-viewer">github.com/flyfish-dev/file-viewer</a>，
Gitee 镜像是 <a href="https://gitee.com/flyfish-dev/file-viewer">gitee.com/flyfish-dev/file-viewer</a>。
React 和纯 JS 组件默认在业务页面内原生挂载预览器，不会把官网 Demo 地址作为内置依赖。
</p>
</div>
<a class="doc-action doc-action-primary" href="/guide/">进入文档导览</a>
</section>
</main>

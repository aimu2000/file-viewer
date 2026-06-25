---
layout: page
title: Flyfish Viewer
titleTemplate: false
---

<main class="doc-home doc-home-v2">
<nav class="doc-home-anchor" aria-label="文档首页导航">
<a href="#quickstart">快速开始</a>
<a href="#demo">Demo</a>
<a href="#presets">预设选择</a>
<a href="#ecosystem">生态接入</a>
<a href="#formats">格式能力</a>
<a href="#delivery">部署分发</a>
</nav>

<section id="quickstart" class="doc-start">
<div class="doc-start-copy">
<span class="doc-eyebrow">Documentation Hub</span>
<h1>企业级文件预览，从第一行代码开始。</h1>
<p>
Flyfish Viewer 为业务系统提供浏览器端文件预览能力。组件包保持轻量，格式能力通过 renderer 与 preset 模块化装配，适合从单一 PDF/Office 预览逐步扩展到完整附件中心。
</p>
<div class="doc-home-actions">
<a class="doc-action doc-action-primary" href="/guide/quickstart">进入快速开始</a>
<a class="doc-action" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">体验 Demo</a>
<a class="doc-action" href="/guide/on-demand-renderers">查看模块化装配</a>
</div>
<div class="doc-start-stats" aria-label="Flyfish Viewer 核心能力">
<div><strong>206</strong><span>扩展名映射</span></div>
<div><strong>24</strong><span>预览链路</span></div>
<div><strong>50</strong><span>npm 发布目标</span></div>
</div>
</div>

<div class="doc-install-panel" aria-label="推荐安装方式">
<div class="doc-panel-top">
<span></span><span></span><span></span>
<strong>recommended setup</strong>
</div>
<div class="doc-install-block">
<span>1. 选择生态组件</span>
<pre><code>pnpm add @file-viewer/vue3</code></pre>
</div>
<div class="doc-install-block">
<span>2. 追加业务需要的格式能力</span>
<pre><code>pnpm add @file-viewer/preset-office</code></pre>
</div>
<div class="doc-install-block">
<span>3. 通过 options.preset 注入</span>
<pre><code>import officePreset from '@file-viewer/preset-office'
const options = { preset: officePreset }</code></pre>
</div>
<div class="doc-install-note">
<strong>组件包保持轻量。</strong>
<span><code>@file-viewer/vue3</code>、<code>@file-viewer/react</code>、<code>@file-viewer/web</code> 等负责原生接入体验；Office、CAD、EDA、Typst、压缩包等能力由 preset 或 renderer 提供。Webpack、Rspack、Rollup、Umi、传统多页应用都可以直接用 <code>options.preset</code>；Vite 项目注册 <code>@file-viewer/vite-plugin</code> 后可自动发现已安装 preset。</span>
</div>
</div>
</section>

<section id="demo" class="doc-demo-stage">
<div class="doc-section-heading">
<span>Live Experience</span>
<h2>先看真实预览，再决定接入范围。</h2>
<p>Demo 使用真实样例、按需 renderer、移动端布局、文档比对和离线资源路径，适合直接验证业务场景。</p>
</div>
<div class="doc-demo-layout">
<figure class="doc-demo-visual">
<img src="/_media/flyfish-viewer-demo.gif" alt="Flyfish Viewer 在线 Demo 动图，展示多格式文件预览与文档比对" />
<figcaption>真实浏览器 Demo 覆盖 Word、PDF、PPTX、压缩包、图纸、图表和文档比对。</figcaption>
</figure>
<div class="doc-demo-actions">
<a class="doc-path-card" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">
<strong>主 Demo</strong>
<span>打开示例文件、上传本地文件、切换移动端视口并验证工具栏体验。</span>
</a>
<a class="doc-path-card" href="https://demo.file-viewer.app/compare.html" target="_blank" rel="noreferrer">
<strong>文档比对</strong>
<span>左右并排预览、同步滚动、搜索定位和 PDF 工具栏隐藏。</span>
</a>
<a class="doc-path-card" href="/guide/demo">
<strong>Demo 说明</strong>
<span>查看样例覆盖、部署边界和常见验证路径。</span>
</a>
</div>
</div>
</section>

<section id="presets" class="doc-section doc-section-muted doc-preset-section">
<div class="doc-section-heading">
<span>Install Strategy</span>
<h2>先选组件，再选能力。避免把全量格式一次塞进业务页。</h2>
<p>生产项目优先从轻量组件包开始，再按业务选择 preset 或单 renderer。<code>preset-all</code> 覆盖最完整，但体积最大，更适合完整文件工作台或内部验证环境。</p>
</div>
<div class="doc-preset-grid">
<article class="doc-card doc-preset-card">
<strong>轻附件</strong>
<h3>@file-viewer/preset-lite</h3>
<p>图片、文本、Markdown、代码、媒体等常见轻量附件。</p>
</article>
<article class="doc-card doc-preset-card">
<strong>办公文档</strong>
<h3>@file-viewer/preset-office</h3>
<p>PDF、Word、Excel、PowerPoint、OFD、RTF 和 OpenDocument 办公链路。</p>
</article>
<article class="doc-card doc-preset-card">
<strong>工程资料</strong>
<h3>@file-viewer/preset-engineering</h3>
<p>CAD、EDA、3D、地理数据、绘图和结构化工程文件。</p>
</article>
<article class="doc-card doc-preset-card">
<strong>完整工作台</strong>
<h3>@file-viewer/preset-all</h3>
<p>全格式体验与验收场景使用。业务端建议评估体量后再引入。</p>
</article>
</div>
<div class="doc-callout doc-callout-compact">
<strong>安装边界:</strong> 只安装 <code>@file-viewer/vue3</code>、<code>@file-viewer/react</code> 或 <code>@file-viewer/web</code> 是最轻的组件接入方式，但不会自动带入全部格式能力。需要预览文件时，请安装对应 preset 或 renderer。
</div>
<div class="doc-callout doc-callout-compact">
<strong>全量一键:</strong> 重度用户、内部附件中心或验收环境可以直接安装 <code>@file-viewer/preset-all</code>，再使用同一份 <code>fileViewerRenderers({ copyAssets:true })</code> 配置，最快获得官方 Demo 的完整格式能力。
<pre><code>pnpm add @file-viewer/vue3 @file-viewer/preset-all
pnpm add -D @file-viewer/vite-plugin # Vite 项目可选</code></pre>
</div>
</section>

<section id="ecosystem" class="doc-section">
<div class="doc-section-heading">
<span>Native Ecosystem</span>
<h2>每个技术栈都有原生组件，不以 iframe 作为核心路径。</h2>
<p>所有生态组件共享 core 能力、options、事件、搜索、缩放、打印、导出和生命周期钩子，同时保持各框架自己的接入方式。</p>
</div>
<div class="doc-path-grid doc-ecosystem-grid">
<a class="doc-path-card" href="/guide/quickstart-web"><strong>Vanilla JS / Web Component</strong><span>一行 HTML 或 mountViewer 命令式挂载，适合任意页面。</span></a>
<a class="doc-path-card" href="/guide/quickstart-vue3"><strong>Vue 3</strong><span>插件安装、组件 props、事件、ref/controller 和工具栏定制。</span></a>
<a class="doc-path-card" href="/guide/quickstart-vue2"><strong>Vue 2.7 / Vue 2.6</strong><span>兼容旧系统，保留与 Vue3 一致的参数模型。</span></a>
<a class="doc-path-card" href="/guide/quickstart-react"><strong>React / React Legacy</strong><span>Hooks、refs、事件回调和 legacy React 项目接入。</span></a>
<a class="doc-path-card" href="/guide/ecosystem#svelte"><strong>Svelte</strong><span>组件与 action 双路径，适合 SvelteKit 和轻应用。</span></a>
<a class="doc-path-card" href="/guide/ecosystem#jquery"><strong>jQuery</strong><span>传统后台可用 <code>$(el).fileViewer(options)</code> 接入。</span></a>
</div>
</section>

<section id="formats" class="doc-section doc-format-panel">
<div class="doc-section-heading">
<span>Format Matrix</span>
<h2>覆盖业务附件的主流类型，也保留可扩展边界。</h2>
<p>核心格式按模块维护，重型解析库、worker、wasm 和离线 vendor 资源仅在命中文件类型时加载。</p>
</div>
<div class="doc-format-grid">
<div><strong>Office</strong><span>DOCX / XLSX / PPTX / PDF / OFD / Typst</span></div>
<div><strong>Engineering</strong><span>DWG / DXF / DWF / 3D / GIS / EDA / OLB / DRA</span></div>
<div><strong>Knowledge</strong><span>Markdown / Code / Git patch / Git bundle / Mermaid / PlantUML</span></div>
<div><strong>Assets</strong><span>PSD / Images / HEIC / Audio / Video / Fonts / SQLite / Parquet</span></div>
<div><strong>Containers</strong><span>ZIP / RAR / 7Z / TAR / GZIP and nested preview</span></div>
<div><strong>Collaboration</strong><span>EML / MSG / XMind / draw.io / Excalidraw / EPUB / UMD</span></div>
</div>
<div class="doc-link-row">
<a href="/guide/formats">查看完整格式矩阵</a>
<a href="/guide/format-fidelity">查看格式完整度说明</a>
</div>
</section>

<section id="delivery" class="doc-final-band doc-final-band-v2">
<div>
<span>Delivery</span>
<h2>面向内网、私有化和开源分发的完整交付链路。</h2>
<p>
文档站、Demo、官网、npm 包、Docker 镜像、GitHub 开源总仓库和 Release 产物同步维护。需要更高还原度和极致性能的商业版，可从官网进入商业版说明与支持入口。
</p>
</div>
<div class="doc-final-actions">
<a class="doc-action doc-action-primary" href="/guide/distribution">发布与分发</a>
<a class="doc-action" href="/guide/docker">Docker 部署</a>
<a class="doc-action" href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub</a>
</div>
</section>
</main>

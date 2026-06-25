---
layout: page
title: Flyfish Viewer
titleTemplate: false
---

<main class="doc-home doc-home-v2">
<nav class="doc-home-anchor" aria-label="Documentation home navigation">
<a href="#quickstart">Quickstart</a>
<a href="#demo">Demo</a>
<a href="#presets">Presets</a>
<a href="#ecosystem">Ecosystem</a>
<a href="#formats">Formats</a>
<a href="#delivery">Delivery</a>
</nav>

<section id="quickstart" class="doc-start">
<div class="doc-start-copy">
<span class="doc-eyebrow">Documentation Hub</span>
<h1>Start with one line. Scale to enterprise file preview.</h1>
<p>
Flyfish Viewer brings browser-side file preview into product workflows. Component packages stay lightweight, while renderer and preset packages add only the document capabilities each product needs.
</p>
<div class="doc-home-actions">
<a class="doc-action doc-action-primary" href="/en/guide/quickstart">Open quickstart</a>
<a class="doc-action" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">Try the demo</a>
<a class="doc-action" href="/en/guide/on-demand-renderers">Modular Integration</a>
</div>
<div class="doc-start-stats" aria-label="Flyfish Viewer capability metrics">
<div><strong>206</strong><span>extension mappings</span></div>
<div><strong>24</strong><span>preview pipelines</span></div>
<div><strong>50</strong><span>npm targets</span></div>
</div>
</div>

<div class="doc-install-panel" aria-label="Recommended installation">
<div class="doc-panel-top">
<span></span><span></span><span></span>
<strong>recommended setup</strong>
</div>
<div class="doc-install-block">
<span>1. Choose the native component</span>
<pre><code>pnpm add @file-viewer/vue3</code></pre>
</div>
<div class="doc-install-block">
<span>2. Add the required document capability</span>
<pre><code>pnpm add @file-viewer/preset-office</code></pre>
</div>
<div class="doc-install-block">
<span>3. Inject it through options.preset</span>
<pre><code>import officePreset from '@file-viewer/preset-office'
const options = { preset: officePreset }</code></pre>
</div>
<div class="doc-install-note">
<strong>Component packages are intentionally light.</strong>
<span><code>@file-viewer/vue3</code>, <code>@file-viewer/react</code>, and <code>@file-viewer/web</code> provide native integration. Office, CAD, EDA, Typst, archive, and other heavy capabilities come from presets or renderers. Webpack, Rspack, Rollup, Umi, and classic apps can use <code>options.preset</code>; Vite projects can register <code>@file-viewer/vite-plugin</code> to auto-discover installed presets.</span>
</div>
</div>
</section>

<section id="demo" class="doc-demo-stage">
<div class="doc-section-heading">
<span>Live Experience</span>
<h2>Validate the viewer before choosing your integration surface.</h2>
<p>The demo uses real samples, lazy renderers, responsive controls, document comparison, and offline asset paths that mirror production deployment.</p>
</div>
<div class="doc-demo-layout">
<figure class="doc-demo-visual">
<img src="/_media/flyfish-viewer-demo.gif" alt="Flyfish Viewer live demo showing document preview and comparison" />
<figcaption>Live browser demo covering Word, PDF, PPTX, archives, drawings, charts, and side-by-side comparison.</figcaption>
</figure>
<div class="doc-demo-actions">
<a class="doc-path-card" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">
<strong>Main Demo</strong>
<span>Open samples, upload local files, test mobile viewports, and verify toolbar behavior.</span>
</a>
<a class="doc-path-card" href="https://demo.file-viewer.app/compare.html" target="_blank" rel="noreferrer">
<strong>Document Compare</strong>
<span>Side-by-side preview, synchronized scrolling, search navigation, and PDF toolbar hiding.</span>
</a>
<a class="doc-path-card" href="/en/guide/demo">
<strong>Demo Guide</strong>
<span>Review sample coverage, deployment boundaries, and common verification flows.</span>
</a>
</div>
</div>
</section>

<section id="presets" class="doc-section doc-section-muted doc-preset-section">
<div class="doc-section-heading">
<span>Install Strategy</span>
<h2>Install the component first. Add document capabilities deliberately.</h2>
<p>Production apps should start from the native component package, then add the smallest preset or renderer set that matches the product. <code>preset-all</code> is complete, but intentionally heavier.</p>
</div>
<div class="doc-preset-grid">
<article class="doc-card doc-preset-card">
<strong>Light attachments</strong>
<h3>@file-viewer/preset-lite</h3>
<p>Images, text, Markdown, code, and common media files.</p>
</article>
<article class="doc-card doc-preset-card">
<strong>Office workflows</strong>
<h3>@file-viewer/preset-office</h3>
<p>PDF, Word, Excel, PowerPoint, OFD, RTF, and OpenDocument workflows.</p>
</article>
<article class="doc-card doc-preset-card">
<strong>Engineering files</strong>
<h3>@file-viewer/preset-engineering</h3>
<p>CAD, EDA, 3D, geospatial, drawing, and structured engineering assets.</p>
</article>
<article class="doc-card doc-preset-card">
<strong>Full workbench</strong>
<h3>@file-viewer/preset-all</h3>
<p>Use for full-format workbenches and release validation. Evaluate size before using in business pages.</p>
</article>
</div>
<div class="doc-callout doc-callout-compact">
<strong>Installation boundary:</strong> installing <code>@file-viewer/vue3</code>, <code>@file-viewer/react</code>, or <code>@file-viewer/web</code> is the lightest integration path, but it does not include every renderer. Add the preset or renderer package for the formats you need.
</div>
<div class="doc-callout doc-callout-compact">
<strong>Full one-shot setup:</strong> heavy users, internal attachment centers, and validation environments can install <code>@file-viewer/preset-all</code>, keep the same <code>fileViewerRenderers({ copyAssets:true })</code> config, and get the complete official demo capability set immediately.
<pre><code>pnpm add @file-viewer/vue3 @file-viewer/preset-all
pnpm add -D @file-viewer/vite-plugin # optional for Vite</code></pre>
</div>
</section>

<section id="ecosystem" class="doc-section">
<div class="doc-section-heading">
<span>Native Ecosystem</span>
<h2>Native packages for every stack. iframe remains an integration option, not the core path.</h2>
<p>Every package shares the same core capabilities, options, events, search, zoom, print, export, and lifecycle hooks while keeping framework-native ergonomics.</p>
</div>
<div class="doc-path-grid doc-ecosystem-grid">
<a class="doc-path-card" href="/en/guide/quickstart-web"><strong>Vanilla JS / Web Component</strong><span>One HTML tag or command-style mount for any page.</span></a>
<a class="doc-path-card" href="/en/guide/quickstart-vue3"><strong>Vue 3</strong><span>Plugin install, component props, events, refs/controllers, and toolbar customization.</span></a>
<a class="doc-path-card" href="/en/guide/quickstart-vue2"><strong>Vue 2.7 / Vue 2.6</strong><span>Legacy-friendly packages with the same option model as Vue 3.</span></a>
<a class="doc-path-card" href="/en/guide/quickstart-react"><strong>React / React Legacy</strong><span>Hooks, refs, event callbacks, and legacy React support.</span></a>
<a class="doc-path-card" href="/en/guide/ecosystem#svelte"><strong>Svelte</strong><span>Component and action-based integration for SvelteKit and lightweight apps.</span></a>
<a class="doc-path-card" href="/en/guide/ecosystem#jquery"><strong>jQuery</strong><span>Use <code>$(el).fileViewer(options)</code> in traditional admin systems.</span></a>
</div>
</section>

<section id="formats" class="doc-section doc-format-panel">
<div class="doc-section-heading">
<span>Format Matrix</span>
<h2>Broad business-file coverage with clear extension points.</h2>
<p>Heavy parsers, workers, WASM files, and offline vendor assets load only when the active file type needs them.</p>
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
<a href="/en/guide/formats">Open the format matrix</a>
<a href="/en/guide/format-fidelity">Review fidelity notes</a>
</div>
</section>

<section id="delivery" class="doc-final-band doc-final-band-v2">
<div>
<span>Delivery</span>
<h2>A complete delivery path for intranet, private deployment, and open-source distribution.</h2>
<p>
Docs, demo, official site, npm packages, Docker images, GitHub source aggregation, and release artifacts are maintained together. For higher fidelity and extreme performance, follow the official site to the commercial native document engine.
</p>
</div>
<div class="doc-final-actions">
<a class="doc-action doc-action-primary" href="/en/guide/distribution">Distribution</a>
<a class="doc-action" href="/en/guide/docker">Docker</a>
<a class="doc-action" href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub</a>
</div>
</section>
</main>

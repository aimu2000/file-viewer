---
layout: page
title: Flyfish Viewer
titleTemplate: false
---

<main class="doc-home">
<section class="doc-home-hero">
<div class="doc-home-hero-inner">
<div class="doc-eyebrow">Offline-first file preview for web apps</div>
<h1>Flyfish Viewer</h1>
<p>
Preview Office documents, PDF/OFD, CAD and EDA files, archives, email, EPUB, XMind, diagrams, 3D models, code, media, and structured data directly in the browser.
No document conversion backend, no Office server, no iframe-only black box.
</p>
<div class="doc-home-actions">
<a class="doc-action doc-action-primary" href="/en/guide/quickstart">Quickstart</a>
<a class="doc-action" href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">Live Demo</a>
<a class="doc-action" href="https://demo.file-viewer.app/compare.html" target="_blank" rel="noreferrer">Compare Demo</a>
<a class="doc-action" href="https://github.com/flyfish-dev/file-viewer" target="_blank" rel="noreferrer">GitHub</a>
</div>
</div>
</section>

<section class="doc-home-metrics" aria-label="Flyfish Viewer key metrics">
<div>
<strong>206</strong>
<span>registered extensions</span>
</div>
<div>
<strong>24</strong>
<span>preview pipelines</span>
</div>
<div>
<strong>15+</strong>
<span>npm package entry points</span>
</div>
<div>
<strong>Native</strong>
<span>Vue, React, Svelte, jQuery, Web Components</span>
</div>
</section>

<section class="doc-section">
<div class="doc-section-heading">
<span>Demo</span>
<h2>A real viewer, not only a format list</h2>
<p>
The demo opens real sample files, switches renderers on demand, keeps toolbar operations format-aware, and includes a side-by-side document comparison page.
</p>
</div>

<div class="doc-showcase">
<figure>
<img src="/_media/flyfish-viewer-demo.gif" alt="Flyfish Viewer demo showing Word, PDF, PPTX, and document comparison" />
<figcaption>The browser demo switches between Word, PDF, PPTX, and document comparison without a server-side conversion service.</figcaption>
</figure>
<div class="doc-showcase-list">
<article>
<span>01</span>
<h3>Frontend-first preview</h3>
<p>Parsing and rendering happen in the browser. That removes a conversion queue from many attachment centers, intranet tools, support portals, and knowledge-base systems.</p>
</article>
<article>
<span>02</span>
<h3>Lazy renderer packages</h3>
<p>Heavy PDF, Office, CAD, EDA, Typst, archive, email, EPUB, XMind, media, and code dependencies load only when the active file type needs them.</p>
</article>
<article>
<span>03</span>
<h3>Native framework packages</h3>
<p>Use a Web Component, Vue 3, Vue 2.7/2.6, React, React legacy, jQuery, or Svelte package without nesting another framework inside your app.</p>
</article>
<article>
<span>04</span>
<h3>Self-hostable assets</h3>
<p>Workers, WASM files, PDF assets, CAD assets, and offline diagram viewers can be copied into your own static directory for intranet and strict-CSP deployments.</p>
</article>
</div>
</div>
</section>

<section class="doc-section doc-demo-embed">
<div class="doc-section-heading">
<span>Live Workbench</span>
<h2>Try the full demo without leaving the docs</h2>
<p>
The frame below embeds the production <code>demo.file-viewer.app</code> experience. It keeps the full sample matrix, upload preview, and comparison entry in an isolated iframe, while the standalone demo remains available for large-viewport validation.
</p>
</div>
<div class="doc-demo-frame-shell">
<div class="doc-demo-frame-bar">
<span></span>
<span></span>
<span></span>
<strong>demo.file-viewer.app</strong>
<a href="https://demo.file-viewer.app" target="_blank" rel="noreferrer">Open standalone</a>
</div>
<iframe
  src="https://demo.file-viewer.app/?embed=docs-home"
  title="Flyfish File Viewer live demo"
  loading="lazy"
></iframe>
</div>
</section>

<section class="doc-section doc-section-muted">
<div class="doc-section-heading">
<span>Use Cases</span>
<h2>Built for attachment-heavy products</h2>
<p>
Flyfish Viewer is useful when users need to inspect many file types inside a product workflow instead of downloading every attachment.
</p>
</div>

<div class="doc-value-grid">
<article class="doc-card">
<h3>OA and approval systems</h3>
<p>Preview contracts, spreadsheets, slides, invoices, archives, and supporting material without leaving the approval page.</p>
</article>
<article class="doc-card">
<h3>Knowledge bases</h3>
<p>Open Word, PDF, Markdown, code, diagrams, and media attachments directly inside internal documentation and support portals.</p>
</article>
<article class="doc-card">
<h3>Self-hosted intranets</h3>
<p>Ship static viewer assets with your deployment and avoid sending private files to a third-party conversion service.</p>
</article>
<article class="doc-card">
<h3>Engineering workflows</h3>
<p>Give users a first-pass preview for CAD, EDA, 3D, geospatial, archives, logs, and structured data files before they open specialist tools.</p>
</article>
</div>
</section>

<section class="doc-final-band">
<div>
<span>Start</span>
<h2>Install a package for your stack</h2>
<p>
New integrations should prefer the standard <code>@file-viewer/*</code> package names.
The old <code>@flyfish-group/*</code> package names remain synchronized for compatibility.
</p>
</div>
<a class="doc-action doc-action-primary" href="/en/guide/quickstart">Open quickstart</a>
</section>
</main>

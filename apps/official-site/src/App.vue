<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import type { Mesh, Object3D, Scene, WebGLRenderer } from 'three'
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  Building2,
  Cloud,
  Cpu,
  Download,
  ExternalLink,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Gem,
  HandCoins,
  HeartHandshake,
  Languages,
  Layers3,
  LockKeyhole,
  Mail,
  MonitorPlay,
  PackageCheck,
  PanelTop,
  QrCode,
  Radar,
  Rocket,
  SearchCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Wrench,
  Zap
} from '@lucide/vue'

type Locale = 'zh' | 'en'

type LinkItem = {
  label: string
  href: string
  note: string
  icon: Component
  featured?: boolean
}

type MetricItem = {
  title: string
  value: string
  detail: string
  tone: string
}

type FormatGroup = {
  label: string
  count: string
  examples: string
  icon: Component
  tone: string
}

type Scenario = {
  title: string
  summary: string
  icon: Component
}

type Capability = {
  title: string
  detail: string
  icon: Component
}

type QrItem = {
  label: string
  note: string
  image: string
}

type QuickStartItem = {
  label: string
  packageName: string
  install: string
  title: string
  summary: string
  language: string
  code: string
  href: string
  tone: string
  icon: Component
}

const docsUrl = 'https://doc.file-viewer.app/'
const demoUrl = 'https://demo.file-viewer.app/'
const compareUrl = 'https://demo.file-viewer.app/compare.html'
const githubUrl = 'https://github.com/flyfish-dev/file-viewer'
const releasesUrl = 'https://github.com/flyfish-dev/file-viewer/releases'
const dockerDocsUrl = `${docsUrl}guide/docker`
const shopUrl = 'https://dev.flyfish.group/shop'
const studioUrl = 'https://flyfish.dev/'
const commercialUrl = 'https://product.flyfish.group/'
const commercialDemoUrl = 'https://office.flyfish.dev/'

const locale = ref<Locale>('zh')
const localeStorageKey = 'flyfish-file-viewer-site-locale'
const heroCanvas = ref<HTMLCanvasElement | null>(null)
const demoReveal = ref<HTMLElement | null>(null)
const quickStartSection = ref<HTMLElement | null>(null)
const quickStartTrack = ref<HTMLElement | null>(null)
const demoRevealActive = ref(false)
const demoFrameLoaded = ref(false)
const quickStartSectionActive = ref(false)
const activeQuickStartIndex = ref(0)
const isZh = computed(() => locale.value === 'zh')
const nextLocaleLabel = computed(() => (isZh.value ? 'EN' : '中文'))

const copy = {
  zh: {
    nav: {
      formats: '支持矩阵',
      solutions: '应用落地',
      ecosystem: '生态组件',
      commercial: '商业版',
      delivery: '部署分发',
      support: '打赏支持',
      docs: '文档',
      demo: '在线体验'
    },
    hero: {
      eyebrow: '浏览器原生文件预览超级组件',
      title: '把复杂文件，变成产品里的即时体验。',
      subtitle:
        'Flyfish File Viewer 以纯 TypeScript core 为底座，把 Office、PDF、OFD、Typst、XMind、CAD、EDA、压缩包、邮件、电子书、Mermaid、PlantUML、Git patch/bundle、PSD 图层、代码、媒体、3D 与数据资产带进浏览器。XMind 与绘图类格式支持拖拽平移和缩放，标准 GDSII 支持 SVG 版图预览；Vanilla JS / Pure Web、Vue、React、jQuery、Svelte 等标准组件保持同一套参数、事件、搜索、缩放、打印、导出、水印与私有化部署体验，并可通过 lite / office / engineering / all preset 按产品形态装配。',
      primary: '立即体验',
      secondary: '阅读文档',
      commercial: '了解商业版',
      proof: ['206 个扩展名', '24 条预览链路', '多框架原生组件', 'Apache-2.0 开源']
    },
    matrixTitle: '覆盖广，不等于粗糙。每条链路都面向真实业务。',
    matrixIntro:
      '格式识别、资源加载、Worker/WASM、主题、水印、搜索、缩放、打印和导出都由预览器内部统一适配；PPTX 已由独立开源的 @file-viewer/pptx 原生引擎承接，业务侧可以选 preset-lite、preset-office、preset-engineering 或单 renderer 精确裁剪。',
    formatsTitle: '支持矩阵',
    solutionsTitle: '适合长期运行在企业系统里',
    solutionsIntro:
      '从 OA 审批到工程图纸，从客服工单到 AI 文档工作台，File Viewer 更关注真实文件、复杂网络、私有化部署和用户每天都会遇到的细节。',
    ecosystemTitle: 'Core 负责底层预览能力，标准组件负责原生体验。',
    ecosystemIntro:
      '一个组件，一行代码，快速集成。2.x 架构不再以 iframe 作为核心路径。每个标准组件都只依赖 @file-viewer/core，并提供对应生态里的 props、hooks、ref/controller、事件和完整类型。',
    demoTitle: '无需跳转，直接在官网体验完整 Demo。',
    demoIntro:
      'Demo 站与产品主页同属 file-viewer.app 域名体系，支持示例矩阵、上传预览、文档比对和生产构建验证。需要深入接入时，再进入文档站查看 API 与部署说明。',
    docsTitle: '文档站与产品门户保持同一套信息架构。',
    docsIntro:
      'doc.file-viewer.app 覆盖快速开始、生态组件、格式支持、主题水印、搜索定位、打印导出、Docker、Release 与私有化部署。主页负责决策入口，文档负责落地细节。',
    commercialTitle: '需要更高还原度和极致性能？选择商业版原生文档引擎。',
    commercialIntro:
      '商业版来自本地 office 产品线，采用自研原生文档引擎，面向严肃企业场景提供 Word、Excel、PowerPoint 的高还原渲染、Worker 解析、分页布局、虚拟滚动和更稳定的大文件体验。',
    commercialCta: '查看商业版',
    supportTitle: '喜欢这个项目，或者需要优先支持？请请我们喝杯柠檬水。',
    supportIntro:
      '开源版会持续维护；如果你需要更快响应、商业选型建议、私有化落地或定制能力，欢迎打赏后通过客服二维码联系我们。',
    releaseTitle: '从 npm 到静态部署，交付方式都准备好了。',
    footer:
      'Apache-2.0 开源。由 Flyfish Dev 持续维护，适合需要可靠浏览器原生文件预览的产品团队。'
  },
  en: {
    nav: {
      formats: 'Format Matrix',
      solutions: 'Use Cases',
      ecosystem: 'Components',
      commercial: 'Commercial',
      delivery: 'Delivery',
      support: 'Sponsor',
      docs: 'Docs',
      demo: 'Live Demo'
    },
    hero: {
      eyebrow: 'Browser-native file preview super component',
      title: 'Turn complex files into instant product experiences.',
      subtitle:
        'Flyfish File Viewer uses a framework-neutral TypeScript core to bring Office, PDF, OFD, Typst, XMind, CAD, EDA, archives, email, ebooks, Mermaid, PlantUML, Git patch/bundle, PSD layers, code, media, 3D models, and data assets into the browser. XMind and diagram formats support drag panning and zooming, standard GDSII gets an SVG layout preview, and Vanilla JavaScript / Pure Web, Vue, React, jQuery, and Svelte components share the same options, events, search, zoom, print, export, watermark, and self-hosted deployment model with lite / office / engineering / all presets.',
      primary: 'Try the Demo',
      secondary: 'Read the Docs',
      commercial: 'Commercial Edition',
      proof: ['206 extensions', '24 preview pipelines', 'Native component packages', 'Apache-2.0 open source']
    },
    matrixTitle: 'Broad coverage, without treating fidelity as optional.',
    matrixIntro:
      'Format detection, assets, Worker/WASM loading, themes, watermarking, search, zoom, print, and export are adapted inside the viewer. PPTX is handled by the standalone open-source @file-viewer/pptx native engine, and applications can choose preset-lite, preset-office, preset-engineering, or exact single-renderer cuts.',
    formatsTitle: 'Format matrix',
    solutionsTitle: 'Built for long-running enterprise workspaces',
    solutionsIntro:
      'From approvals to engineering drawings, support tickets, and AI document workflows, File Viewer focuses on real files, private networks, self-hosted delivery, and the details users meet every day.',
    ecosystemTitle: 'Core owns preview capability. Standard components own native framework experience.',
    ecosystemIntro:
      'One component, one line of code, fast integration. The 2.x architecture no longer treats iframe integration as the primary path. Every standard component depends only on @file-viewer/core and exposes idiomatic props, hooks, refs/controllers, events, and complete types for its ecosystem.',
    demoTitle: 'Try the complete demo without leaving the product site.',
    demoIntro:
      'The demo and product portal share the file-viewer.app domain family. It includes the sample matrix, upload preview, document comparison, and production build verification. Use the docs when you are ready to integrate deeply.',
    docsTitle: 'The docs site and product portal share one information architecture.',
    docsIntro:
      'doc.file-viewer.app covers quick start, component packages, format support, themes, watermarking, search anchors, print/export, Docker, Release downloads, and self-hosted deployment.',
    commercialTitle: 'Need higher fidelity and extreme performance? Choose the commercial native document engine.',
    commercialIntro:
      'The commercial edition is powered by the local office product line: a self-developed native document engine for serious enterprise Word, Excel, and PowerPoint rendering, Worker parsing, pagination, virtual scrolling, and stable large-file performance.',
    commercialCta: 'View Commercial Edition',
    supportTitle: 'If File Viewer helps, sponsor the project and contact us for priority support.',
    supportIntro:
      'The open-source edition will keep moving. For faster response, commercial evaluation, private deployment, or custom work, sponsor the project and reach us through the support QR code.',
    releaseTitle: 'From npm to static deployment, distribution is ready.',
    footer:
      'Apache-2.0 open source. Maintained by Flyfish Dev for product teams that need reliable browser-native file preview.'
  }
} satisfies Record<Locale, Record<string, any>>

const metrics = computed<MetricItem[]>(() =>
  isZh.value
    ? [
        { title: '文件扩展名', value: '206', detail: '覆盖业务附件、脑图、工程资产、绘图、媒体与数据文件', tone: 'green' },
        { title: '预览链路', value: '24', detail: '按格式异步加载，避免首屏被拖慢', tone: 'blue' },
        { title: 'Preset 层级', value: '4', detail: 'lite、office、engineering、all 按产品形态装配', tone: 'violet' },
        { title: '分发形态', value: '4', detail: 'npm、Release、Docker、静态资源私有化', tone: 'amber' }
      ]
    : [
        { title: 'Extensions', value: '206', detail: 'Business attachments, mind maps, engineering files, diagrams, media, and data assets', tone: 'green' },
        { title: 'Pipelines', value: '24', detail: 'Lazy renderer loading by matched file type', tone: 'blue' },
        { title: 'Preset tiers', value: '4', detail: 'lite, office, engineering, and all product-shaped bundles', tone: 'violet' },
        { title: 'Delivery paths', value: '4', detail: 'npm, GitHub Release, Docker, and static self-hosting', tone: 'amber' }
      ]
)

const formatGroups = computed<FormatGroup[]>(() =>
  isZh.value
    ? [
        {
          label: 'Office 与版式文档',
          count: 'Word / Excel / PPT / PDF / OFD / Typst',
          examples: 'docx、doc、xlsx、xls、pptx、pdf、ofd、typ',
          icon: FileText,
          tone: 'emerald'
        },
        {
          label: '工程与设计资产',
          count: 'CAD / EDA / 3D / Mind Maps',
          examples: 'dwg、dxf、dwf、dwfx、olb、dra、gds、oas、oasis、xmind、step、stl、excalidraw、drawio',
          icon: Layers3,
          tone: 'cyan'
        },
        {
          label: '归档与沟通文件',
          count: 'Archives / Email / Ebooks',
          examples: 'zip、7z、rar、tar、eml、msg、mbox、epub、umd',
          icon: FileArchive,
          tone: 'orange'
        },
        {
          label: '代码、数据与媒体',
          count: 'Code / Data / Media / Geo',
          examples: 'md、json、ts、py、sqlite、parquet、mp4、mp3、geojson、kml',
          icon: FileCode2,
          tone: 'indigo'
        }
      ]
    : [
        {
          label: 'Office and fixed-layout documents',
          count: 'Word / Excel / PPT / PDF / OFD / Typst',
          examples: 'docx, doc, xlsx, xls, pptx, pdf, ofd, typ',
          icon: FileText,
          tone: 'emerald'
        },
        {
          label: 'Engineering and design assets',
          count: 'CAD / EDA / 3D / Mind maps',
          examples: 'dwg, dxf, dwf, dwfx, olb, dra, gds, oas, oasis, xmind, step, stl, excalidraw, drawio',
          icon: Layers3,
          tone: 'cyan'
        },
        {
          label: 'Archives and communication files',
          count: 'Archives / Email / Ebooks',
          examples: 'zip, 7z, rar, tar, eml, msg, mbox, epub, umd',
          icon: FileArchive,
          tone: 'orange'
        },
        {
          label: 'Code, data, media, and geo',
          count: 'Code / Data / Media / Geo',
          examples: 'md, json, ts, py, sqlite, parquet, mp4, mp3, geojson, kml',
          icon: FileCode2,
          tone: 'indigo'
        }
      ]
)

const scenarios = computed<Scenario[]>(() =>
  isZh.value
    ? [
        {
          title: 'OA 审批与合同归档',
          summary: 'PDF、Word、OFD、图片和压缩包直接在审批流里打开，减少下载和外部应用跳转。',
          icon: ShieldCheck
        },
        {
          title: '知识库与附件中心',
          summary: '文档、表格、演示稿、代码片段和媒体附件在同一阅读体验中被检索、定位和复用。',
          icon: SearchCheck
        },
        {
          title: '工程图纸协同',
          summary: 'CAD/DWG/DXF/DWF、EDA 和 3D 模型进入浏览器，适合工程、制造和图纸审核。',
          icon: Radar
        },
        {
          title: '客服与工单平台',
          summary: '邮件、附件包、截图、录音和文档在线预览，帮助团队快速判断问题来源。',
          icon: Mail
        },
        {
          title: '私有化与离线部署',
          summary: '前端静态资源即可运行，支持 npm、Docker、Release tarball 和内网静态站。',
          icon: LockKeyhole
        },
        {
          title: 'AI 文档工作台',
          summary: '搜索、高亮、定位、导出 HTML 和文本切片为溯源、向量化与知识提取留好接口。',
          icon: Sparkles
        }
      ]
    : [
        {
          title: 'Approvals and contract archives',
          summary: 'Open PDF, Word, OFD, images, and archives directly in approval flows without downloads or external apps.',
          icon: ShieldCheck
        },
        {
          title: 'Knowledge bases and attachment hubs',
          summary: 'Documents, spreadsheets, decks, snippets, and media attachments become searchable and reusable in one reading surface.',
          icon: SearchCheck
        },
        {
          title: 'Engineering drawing collaboration',
          summary: 'Bring CAD/DWG/DXF/DWF, EDA assets, and 3D models into browser workflows for review and manufacturing teams.',
          icon: Radar
        },
        {
          title: 'Support and ticketing systems',
          summary: 'Preview email, attachment bundles, screenshots, recordings, and documents to identify issues quickly.',
          icon: Mail
        },
        {
          title: 'Private and offline deployment',
          summary: 'Run from static assets with npm, Docker, GitHub Release tarballs, or internal static hosting.',
          icon: LockKeyhole
        },
        {
          title: 'AI document workspaces',
          summary: 'Search, highlights, anchors, HTML export, and text chunks prepare the ground for citation and vector workflows.',
          icon: Sparkles
        }
      ]
)

const capabilities = computed<Capability[]>(() =>
  isZh.value
    ? [
        { title: '统一搜索与定位', detail: 'Ctrl/Command + F 调出浮层搜索，命中高亮、上一条/下一条和行级/页级定位可复用。', icon: SearchCheck },
        { title: '高保真打印导出', detail: 'PDF、Word、Markdown、图片等按渲染链路动态启用打印与 HTML 导出，避免只打印当前视口。', icon: Download },
        { title: '主题与水印', detail: 'light、dark、system 可控，文字/图片水印通过 options 统一注入。', icon: PanelTop },
        { title: '分层按需装配', detail: 'preset-lite、preset-office、preset-engineering 和 preset-all 覆盖不同产品形态，极致裁剪时再安装单个 renderer。', icon: Boxes }
      ]
    : [
        { title: 'Unified search and anchors', detail: 'Ctrl/Command + F opens focused search with highlights, next/previous navigation, and reusable page/line anchors.', icon: SearchCheck },
        { title: 'High-fidelity print and export', detail: 'PDF, Word, Markdown, images, and other printable renderers expose print and HTML export only when the output is trustworthy.', icon: Download },
        { title: 'Theme and watermark options', detail: 'light, dark, and system themes are controlled by options; text and image watermarks use one contract.', icon: PanelTop },
        { title: 'Tiered on-demand assembly', detail: 'preset-lite, preset-office, preset-engineering, and preset-all cover product-shaped bundles; install single renderers only for exact custom cuts.', icon: Boxes }
      ]
)

const portalLinks = computed<LinkItem[]>(() =>
  isZh.value
    ? [
        { label: '在线 Demo', href: demoUrl, note: '体验主预览器、上传预览和完整样例矩阵', icon: MonitorPlay, featured: true },
        { label: '官方文档', href: docsUrl, note: 'doc.file-viewer.app，接入、格式、部署与 API', icon: BookOpen, featured: true },
        { label: '文档比对', href: compareUrl, note: '左右并排预览、同步滚动、搜索定位', icon: PanelTop, featured: true },
        { label: 'GitHub 开源总仓', href: githubUrl, note: '源码、Release 下载、构建产物和 issue', icon: GitHubMark, featured: true },
        { label: 'npm 生态包', href: 'https://www.npmjs.com/search?q=%40file-viewer', note: 'core、renderer、preset 与标准组件包', icon: PackageCheck },
        { label: 'Docker 部署', href: dockerDocsUrl, note: 'amd64 / arm64 一键部署文档与示例', icon: Cloud },
        { label: '商业版引擎', href: commercialUrl, note: '自研原生 Office 引擎，高还原与极致性能', icon: Gem },
        { label: '飞鱼小铺', href: shopUrl, note: '打赏项目，并获得优先技术支持', icon: HandCoins },
        { label: '飞鱼开源工作室', href: studioUrl, note: '了解 Flyfish Dev 的产品与服务', icon: Building2 }
      ]
    : [
        { label: 'Live demo', href: demoUrl, note: 'Try the main viewer, uploads, and the full sample matrix', icon: MonitorPlay, featured: true },
        { label: 'Documentation', href: docsUrl, note: 'doc.file-viewer.app for integration, formats, deployment, and APIs', icon: BookOpen, featured: true },
        { label: 'Compare demo', href: compareUrl, note: 'Side-by-side preview with sync scroll, search, and anchors', icon: PanelTop, featured: true },
        { label: 'GitHub monorepo', href: githubUrl, note: 'Source, releases, artifacts, and issues', icon: GitHubMark, featured: true },
        { label: 'npm packages', href: 'https://www.npmjs.com/search?q=%40file-viewer', note: 'core, renderer, preset, and standard component packages', icon: PackageCheck },
        { label: 'Docker deployment', href: dockerDocsUrl, note: 'amd64 / arm64 deployment for docs and examples', icon: Cloud },
        { label: 'Commercial engine', href: commercialUrl, note: 'Native Office engine for high fidelity and extreme performance', icon: Gem },
        { label: 'Support shop', href: shopUrl, note: 'Sponsor the project and receive priority technical support', icon: HandCoins },
        { label: 'Flyfish Dev', href: studioUrl, note: 'Explore Flyfish Dev products and services', icon: Building2 }
      ]
)

const ecosystem = [
  '@file-viewer/core',
  '@file-viewer/preset-lite',
  '@file-viewer/preset-office',
  '@file-viewer/preset-engineering',
  '@file-viewer/preset-all',
  '@file-viewer/web',
  '@file-viewer/vue3',
  '@file-viewer/vue2.7',
  '@file-viewer/vue2.6',
  '@file-viewer/react',
  '@file-viewer/react-legacy',
  '@file-viewer/jquery',
  '@file-viewer/svelte'
]

function snippetImport(statement: string) {
  return `im${'port'} ${statement}`
}

const quickStartItems = computed<QuickStartItem[]>(() => [
  {
    label: isZh.value ? 'Vanilla JS' : 'Vanilla JS',
    packageName: '@file-viewer/web',
    install: 'npm install @file-viewer/web',
    title: isZh.value ? '无框架页面也有原生组件' : 'Native components for framework-free pages',
    summary: isZh.value
      ? 'Custom Element、命令式 controller 和 script 标签入口都走同一套 core 能力，最适合快速标准化接入。'
      : 'Custom Element, imperative controller, and script-tag entry all share the same core for the fastest standard integration path.',
    language: 'HTML',
    href: `${docsUrl}guide/quickstart-web`,
    tone: 'violet',
    icon: MonitorPlay,
    code: `<flyfish-file-viewer
  id="viewer"
  src="/files/drawing.dwg"
  theme="light"
  toolbar-position="bottom-right"
></flyfish-file-viewer>

${snippetImport("{ defineFileViewerElement } from '@file-viewer/web'")}

defineFileViewerElement()

const viewer = document.getElementById('viewer')
viewer.addEventListener('viewer-load-complete', event => {
  console.log('loaded', event.detail.payload.fileName)
})
viewer.zoomIn()`
  },
  {
    label: isZh.value ? 'Vue 3' : 'Vue 3',
    packageName: '@file-viewer/vue3',
    install: 'npm install vue @file-viewer/vue3',
    title: isZh.value ? '插件安装后直接使用原生组件' : 'Install the plugin and use the native component',
    summary: isZh.value
      ? '适合 Vue 3 业务系统，props、事件、ref/controller 和完整类型都保持原生体验。'
      : 'For Vue 3 products with native props, events, refs/controllers, and complete types.',
    language: 'Vue SFC',
    href: `${docsUrl}guide/quickstart-vue3`,
    tone: 'green',
    icon: PanelTop,
    code: `${snippetImport("{ createApp } from 'vue'")}
${snippetImport("FileViewer from '@file-viewer/vue3'")}
${snippetImport("'@file-viewer/vue3/dist/file-viewer3.css'")}

createApp(App).use(FileViewer).mount('#app')

<file-viewer
  url="/files/contract.pdf"
  :options="{
    theme: 'light',
    toolbar: { position: 'bottom-right', zoom: true },
    watermark: { text: 'Internal Preview' }
  }"
  @load-complete="handleLoadComplete"
/>`
  },
  {
    label: isZh.value ? 'Vue 2' : 'Vue 2',
    packageName: '@file-viewer/vue2.7 / vue2.6',
    install: 'npm install vue@2.7 @file-viewer/vue2.7',
    title: isZh.value ? 'Vue.use 接入，能力与 Vue3 对齐' : 'Use Vue.use with the same capability set as Vue 3',
    summary: isZh.value
      ? 'Vue 2.7 与 Vue 2.6 分线维护，适合仍在运行的传统后台和存量业务系统。'
      : 'Separate Vue 2.7 and Vue 2.6 packages for legacy business systems that still need the full viewer.',
    language: 'Vue 2',
    href: `${docsUrl}guide/quickstart-vue2`,
    tone: 'blue',
    icon: Layers3,
    code: `${snippetImport("Vue from 'vue'")}
${snippetImport("FileViewerPlugin from '@file-viewer/vue2.7'")}

Vue.use(FileViewerPlugin)

export default {
  methods: {
    handleViewerEvent(event) {
      console.log(event.type, event.payload)
    }
  }
}

<FileViewer
  ref="viewer"
  url="/files/report.docx"
  :options="{ theme: 'light', toolbar: { position: 'bottom-right' } }"
  @viewer-event="handleViewerEvent"
/>`
  },
  {
    label: 'React',
    packageName: '@file-viewer/react',
    install: 'npm install react react-dom @file-viewer/react',
    title: isZh.value ? 'React 组件与 ref API 原生可控' : 'Native React component with ref APIs',
    summary: isZh.value
      ? 'React 18/19 使用标准包，React 16.8/17 使用 legacy 包，业务侧无需 Vue 或 iframe 转接。'
      : 'Use the standard package for React 18/19 and the legacy package for React 16.8/17 without Vue or iframe bridges.',
    language: 'TSX',
    href: `${docsUrl}guide/quickstart-react`,
    tone: 'cyan',
    icon: Boxes,
    code: `${snippetImport("{ useRef } from 'react'")}
${snippetImport("FileViewer, { type FileViewerHandle } from '@file-viewer/react'")}

export function Preview() {
  const viewerRef = useRef<FileViewerHandle>(null)

  return (
    <section style={{ height: '100vh' }}>
      <FileViewer
        ref={viewerRef}
        url="/files/quarterly.pptx"
        options={{
          theme: 'light',
          toolbar: { position: 'bottom-right', zoom: true }
        }}
      />
    </section>
  )
}`
  },
  {
    label: 'jQuery',
    packageName: '@file-viewer/jquery',
    install: 'npm install jquery @file-viewer/jquery',
    title: isZh.value ? '传统系统保持插件式调用' : 'Plugin-style API for classic systems',
    summary: isZh.value
      ? '保留 jQuery 项目熟悉的调用方式，同时底层不牺牲搜索、缩放、打印和导出能力。'
      : 'Keeps the familiar jQuery API while preserving search, zoom, print, and export support.',
    language: 'jQuery',
    href: `${docsUrl}guide/ecosystem#jquery`,
    tone: 'amber',
    icon: Wrench,
    code: `${snippetImport("$ from 'jquery'")}
${snippetImport("{ installJQueryFileViewer } from '@file-viewer/jquery'")}

installJQueryFileViewer($)

$('#viewer').fileViewer({
  url: '/files/archive.zip',
  options: {
    theme: 'light',
    toolbar: { position: 'bottom-right' }
  }
})

$('#viewer').fileViewer('update', {
  url: '/files/mail.eml'
})`
  },
  {
    label: 'Svelte',
    packageName: '@file-viewer/svelte',
    install: 'npm install @file-viewer/svelte',
    title: isZh.value ? '组件和 action 两种原生入口' : 'Native component and action entry points',
    summary: isZh.value
      ? 'Svelte 项目可以用组件，也可以用 action 挂载到已有 DOM，SSR 下只在浏览器端运行。'
      : 'Use either the component or the action; SSR projects mount only in the browser.',
    language: 'Svelte',
    href: `${docsUrl}guide/ecosystem#svelte`,
    tone: 'rose',
    icon: FileCode2,
    code: `<script lang="ts">
  ${snippetImport("FileViewer from '@file-viewer/svelte'")}

  let viewer: FileViewer
${'<'}\/script>

<section style="height: 100vh">
  <FileViewer
    bind:this={viewer}
    url="/files/manual.ofd"
    options={{ theme: 'light', toolbar: { position: 'bottom-right' } }}
    on:viewerEvent={(event) => console.log(event.detail.payload)}
  />
</section>`
  }
])

const activeQuickStart = computed(() => {
  const items = quickStartItems.value
  return items[activeQuickStartIndex.value] ?? items[0]!
})

const commercialFeatures = computed<Capability[]>(() =>
  isZh.value
    ? [
        { title: '自研原生版式引擎', detail: '面向 Word、Excel、PowerPoint 的结构解析、分页和绘制链路，不依赖系统 Office。', icon: Cpu },
        { title: '大文件性能优先', detail: 'Worker 解析、异步渲染、虚拟滚动和窗口化数据链路，减少主线程卡顿。', icon: Zap },
        { title: '严肃商用支持', detail: '适合合同归档、报表中心、知识库和需要更高还原度的企业产品。', icon: HeartHandshake }
      ]
    : [
        { title: 'Self-developed native layout engine', detail: 'Structural parsing, pagination, and rendering for Word, Excel, and PowerPoint without relying on system Office.', icon: Cpu },
        { title: 'Large-file performance first', detail: 'Worker parsing, asynchronous rendering, virtual scrolling, and windowed data paths reduce main-thread blocking.', icon: Zap },
        { title: 'Serious commercial support', detail: 'For contract archives, report centers, knowledge bases, and enterprise products that demand stronger fidelity.', icon: HeartHandshake }
      ]
)

const qrItems = computed<QrItem[]>(() =>
  isZh.value
    ? [
        { label: '微信打赏', note: '请我们喝杯柠檬水', image: '/donate-wx.jpg' },
        { label: '支付宝打赏', note: '支持开源持续迭代', image: '/donate-alipay.jpg' },
        { label: '客服微信', note: '优先支持与商业沟通', image: '/contact.jpg' },
        { label: '公众号', note: '关注更新与实践文章', image: '/wechat-mp.png' },
        { label: '交流群', note: '加入用户交流群', image: '/community-qr.png' }
      ]
    : [
        { label: 'WeChat Sponsor', note: 'Buy us a lemonade', image: '/donate-wx.jpg' },
        { label: 'Alipay Sponsor', note: 'Support open-source work', image: '/donate-alipay.jpg' },
        { label: 'Support Contact', note: 'Priority support and business inquiries', image: '/contact.jpg' },
        { label: 'Official Account', note: 'Updates and engineering notes', image: '/wechat-mp.png' },
        { label: 'Community Group', note: 'Join the user community', image: '/community-qr.png' }
      ]
)

const currentCopy = computed(() => copy[locale.value])

function resolveInitialLocale(): Locale {
  const stored = window.localStorage.getItem(localeStorageKey)
  if (stored === 'zh' || stored === 'en') {
    return stored
  }

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language].filter(Boolean)
  return languages.some(language => language.toLowerCase().startsWith('zh')) ? 'zh' : 'en'
}

function toggleLocale() {
  locale.value = isZh.value ? 'en' : 'zh'
  window.localStorage.setItem(localeStorageKey, locale.value)
}

function selectQuickStart(index: number) {
  activeQuickStartIndex.value = index
  const track = quickStartTrack.value
  const target = track?.children.item(index) as HTMLElement | null
  if (!track || !target) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  track.scrollTo({
    left: target.offsetLeft - track.offsetLeft,
    behavior: reduceMotion ? 'auto' : 'smooth'
  })
}

let quickStartScrollFrame = 0

function syncQuickStartFromScroll() {
  const track = quickStartTrack.value
  if (!track) return

  window.cancelAnimationFrame(quickStartScrollFrame)
  quickStartScrollFrame = window.requestAnimationFrame(() => {
    const panels = Array.from(track.children) as HTMLElement[]
    const trackCenter = track.scrollLeft + track.clientWidth / 2
    let nextIndex = activeQuickStartIndex.value
    let nearestDistance = Number.POSITIVE_INFINITY

    panels.forEach((panel, index) => {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2
      const distance = Math.abs(panelCenter - trackCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nextIndex = index
      }
    })

    activeQuickStartIndex.value = nextIndex
  })
}

function handleQuickStartKeydown(event: KeyboardEvent, index: number) {
  const lastIndex = quickStartItems.value.length - 1
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault()
    selectQuickStart(Math.max(0, index - 1))
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault()
    selectQuickStart(Math.min(lastIndex, index + 1))
  } else if (event.key === 'Home') {
    event.preventDefault()
    selectQuickStart(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    selectQuickStart(lastIndex)
  }
}

function scrollInitialHashIntoView() {
  const hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : ''
  const target = hashId ? document.getElementById(hashId) : null
  if (!target) return

  window.requestAnimationFrame(() => {
    if (hashId === 'ecosystem') {
      quickStartSectionActive.value = true
    }
    const top = target.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top, behavior: 'auto' })
  })
}

function scrollToSection(event: MouseEvent, id: string) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const top = target.getBoundingClientRect().top + window.scrollY
  if (id === 'ecosystem') {
    quickStartSectionActive.value = true
  }
  window.history.replaceState(null, '', `#${id}`)
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
}

const GitHubMark = {
  name: 'GitHubMark',
  render: () =>
    h(
      'svg',
      {
        class: 'github-mark',
        viewBox: '0 0 24 24',
        'aria-hidden': 'true',
        fill: 'currentColor'
      },
      [
        h('path', {
          d: 'M12 1.7C6.3 1.7 1.7 6.3 1.7 12c0 4.6 3 8.5 7.2 9.8.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.7-1.3-2.3-.3-4.7-1.2-4.7-5.1 0-1.1.4-2.1 1.1-2.8-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 2-1.4 2.9-1.1 2.9-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.8 0 4-2.4 4.8-4.7 5.1.4.3.8 1 .8 2v3c0 .3.2.6.8.5 4.2-1.3 7.2-5.2 7.2-9.8C22.3 6.3 17.7 1.7 12 1.7Z'
        })
      ]
    )
} satisfies Component

function disposeScene(scene: Scene, renderer: WebGLRenderer) {
  scene.traverse((child: Object3D) => {
    const mesh = child as Mesh
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const material = mesh.material
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose())
    } else if (material) {
      material.dispose()
    }
  })
  renderer.dispose()
}

async function initHeroScene() {
  const THREE = await import('three')
  const canvas = heroCanvas.value
  const stage = canvas?.parentElement
  if (!canvas || !stage) return () => {}

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0.7, 7.4)

  const ambient = new THREE.AmbientLight(0xffffff, 1.5)
  const key = new THREE.DirectionalLight(0xefffff, 3.2)
  key.position.set(3.8, 4.8, 5.4)
  const rim = new THREE.PointLight(0x22d3ee, 3.2, 14)
  rim.position.set(-3.7, 1.6, 3.4)
  const warm = new THREE.PointLight(0xffc766, 1.8, 12)
  warm.position.set(2.8, -2.2, 2.8)
  scene.add(ambient, key, rim, warm)

  const rig = new THREE.Group()
  scene.add(rig)

  const pageGeometry = new THREE.BoxGeometry(2.78, 3.72, 0.032, 16, 16, 1)
  const pageMaterials = [
    new THREE.MeshPhysicalMaterial({ color: 0xf8fffb, roughness: 0.52, metalness: 0.04, transparent: true, opacity: 0.9 }),
    new THREE.MeshPhysicalMaterial({ color: 0xe9f9ff, roughness: 0.5, metalness: 0.06, transparent: true, opacity: 0.86 }),
    new THREE.MeshPhysicalMaterial({ color: 0xfaf6ff, roughness: 0.54, metalness: 0.05, transparent: true, opacity: 0.84 })
  ]
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x8ae6d0, transparent: true, opacity: 0.38 })
  const pages: Mesh[] = []

  for (let index = 0; index < 8; index += 1) {
    const page = new THREE.Mesh(pageGeometry, pageMaterials[index % pageMaterials.length])
    page.position.set((index - 3.5) * 0.13, 0.14 - index * 0.035, -index * 0.22)
    page.rotation.set(-0.08 + index * 0.012, -0.38 + index * 0.02, -0.08)
    pages.push(page)
    rig.add(page)

    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(pageGeometry), edgeMaterial)
    edge.position.copy(page.position)
    edge.rotation.copy(page.rotation)
    edge.scale.copy(page.scale)
    rig.add(edge)
  }

  const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x10243a, roughness: 0.42, metalness: 0.18 })
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x25d692, transparent: true, opacity: 0.58 })
  const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x37d6f3, transparent: true, opacity: 0.62 })
  const violetMaterial = new THREE.MeshBasicMaterial({ color: 0x8b7cf6, transparent: true, opacity: 0.52 })
  const amberMaterial = new THREE.MeshBasicMaterial({ color: 0xf3b24f, transparent: true, opacity: 0.62 })
  const panelItems = [
    { x: -0.62, y: 0.82, z: 0.1, w: 0.92, h: 0.18, material: glowMaterial },
    { x: 0.42, y: 0.36, z: 0.12, w: 1.18, h: 0.14, material: cyanMaterial },
    { x: -0.35, y: -0.22, z: 0.14, w: 1.42, h: 0.16, material: violetMaterial },
    { x: 0.58, y: -0.78, z: 0.16, w: 0.86, h: 0.16, material: amberMaterial }
  ]

  panelItems.forEach((item) => {
    const block = new THREE.Mesh(new THREE.BoxGeometry(item.w, item.h, 0.04), item.material)
    block.position.set(item.x, item.y, item.z)
    block.rotation.set(-0.08, -0.35, -0.08)
    rig.add(block)
  })

  const railGroup = new THREE.Group()
  rig.add(railGroup)

  const railMaterial = new THREE.LineBasicMaterial({ color: 0x6de5ff, transparent: true, opacity: 0.46 })
  const railPoints = [
    new THREE.Vector3(-2.3, -1.55, -0.22),
    new THREE.Vector3(-1.5, -1.04, 0),
    new THREE.Vector3(-0.6, -1.35, 0.16),
    new THREE.Vector3(0.4, -1.08, 0.26),
    new THREE.Vector3(1.58, -1.46, 0.02),
    new THREE.Vector3(2.34, -0.92, -0.28)
  ]
  const rail = new THREE.Line(new THREE.BufferGeometry().setFromPoints(railPoints), railMaterial)
  railGroup.add(rail)

  const nodeGeometry = new THREE.SphereGeometry(0.065, 20, 12)
  const nodeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x28d989 }),
    new THREE.MeshBasicMaterial({ color: 0x39d8ff }),
    new THREE.MeshBasicMaterial({ color: 0xf0bb45 })
  ]
  const nodes = railPoints.map((point, index) => {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterials[index % nodeMaterials.length])
    node.position.copy(point)
    railGroup.add(node)
    return node
  })

  const ringGroup = new THREE.Group()
  scene.add(ringGroup)
  const ringOne = new THREE.Mesh(
    new THREE.TorusGeometry(2.36, 0.012, 10, 120),
    new THREE.MeshBasicMaterial({ color: 0x1fbf8a, transparent: true, opacity: 0.36 })
  )
  const ringTwo = new THREE.Mesh(
    new THREE.TorusGeometry(3.06, 0.008, 10, 144),
    new THREE.MeshBasicMaterial({ color: 0x55d7ff, transparent: true, opacity: 0.28 })
  )
  ringOne.rotation.set(1.08, 0.36, -0.44)
  ringTwo.rotation.set(1.22, -0.28, 0.35)
  ringGroup.add(ringOne, ringTwo)

  const particles = new THREE.BufferGeometry()
  const particleCount = 96
  const positions = new Float32Array(particleCount * 3)
  for (let index = 0; index < particleCount; index += 1) {
    const angle = index * 1.618
    const radius = 2.15 + ((index % 13) / 13) * 1.38
    positions[index * 3] = Math.cos(angle) * radius
    positions[index * 3 + 1] = -1.82 + ((index * 37) % 100) / 28
    positions[index * 3 + 2] = Math.sin(angle) * radius * 0.42 - 0.6
  }
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particleField = new THREE.Points(
    particles,
    new THREE.PointsMaterial({ color: 0x8ee8d2, size: 0.022, transparent: true, opacity: 0.66 })
  )
  scene.add(particleField)

  let frameId = 0
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  const resize = () => {
    const width = Math.max(320, stage.clientWidth)
    const height = Math.max(420, stage.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stage)
  resize()

  const animate = (time: number) => {
    const speed = motionQuery.matches ? 0.16 : 1
    const elapsed = time * 0.001 * speed
    rig.rotation.y = Math.sin(elapsed * 0.45) * 0.12
    rig.rotation.x = Math.sin(elapsed * 0.32) * 0.035
    ringGroup.rotation.z = elapsed * 0.1
    ringGroup.rotation.y = Math.sin(elapsed * 0.28) * 0.06
    railGroup.position.y = Math.sin(elapsed * 1.1) * 0.045
    particleField.rotation.y = elapsed * 0.06
    particleField.rotation.z = Math.sin(elapsed * 0.25) * 0.045

    pages.forEach((page, index) => {
      page.position.z = -index * 0.22 + Math.sin(elapsed * 0.7 + index * 0.72) * 0.018
      page.rotation.z = -0.08 + Math.sin(elapsed * 0.5 + index) * 0.012
    })
    nodes.forEach((node, index) => {
      const pulse = 1 + Math.sin(elapsed * 2.2 + index * 0.7) * 0.18
      node.scale.setScalar(pulse)
    })

    renderer.render(scene, camera)
    frameId = window.requestAnimationFrame(animate)
  }

  frameId = window.requestAnimationFrame(animate)

  return () => {
    window.cancelAnimationFrame(frameId)
    resizeObserver.disconnect()
    disposeScene(scene, renderer)
  }
}

let disposeHeroScene: (() => void) | undefined
let heroSceneDisposed = false
let demoRevealObserver: IntersectionObserver | undefined
let quickStartObserver: IntersectionObserver | undefined

onMounted(async () => {
  locale.value = resolveInitialLocale()
  await nextTick()
  if (window.location.hash === '#ecosystem') {
    quickStartSectionActive.value = true
  }
  scrollInitialHashIntoView()
  if (demoReveal.value) {
    demoRevealObserver = new IntersectionObserver(
      ([entry]) => {
        const active = entry.isIntersecting && entry.intersectionRatio > 0.18
        demoRevealActive.value = active
        if (active) {
          demoFrameLoaded.value = true
        }
      },
      {
        rootMargin: '-12% 0px -18% 0px',
        threshold: [0, 0.18, 0.4, 0.72]
      }
    )
    demoRevealObserver.observe(demoReveal.value)
  }

  if (quickStartSection.value) {
    quickStartObserver = new IntersectionObserver(
      ([entry]) => {
        quickStartSectionActive.value =
          window.location.hash === '#ecosystem' || (entry.isIntersecting && entry.intersectionRatio > 0.16)
      },
      {
        rootMargin: '-14% 0px -18% 0px',
        threshold: [0, 0.16, 0.42, 0.72]
      }
    )
    quickStartObserver.observe(quickStartSection.value)
  }

  const dispose = await initHeroScene()
  if (heroSceneDisposed) {
    dispose()
    return
  }
  disposeHeroScene = dispose
})

onBeforeUnmount(() => {
  heroSceneDisposed = true
  demoRevealObserver?.disconnect()
  quickStartObserver?.disconnect()
  window.cancelAnimationFrame(quickStartScrollFrame)
  disposeHeroScene?.()
})
</script>

<template>
  <main class="site-shell" :lang="locale">
    <nav class="topbar" aria-label="Primary navigation">
      <a class="brand" href="#top" aria-label="Flyfish File Viewer" @click="scrollToSection($event, 'top')">
        <img src="/logo.png" alt="" />
        <span>File Viewer</span>
      </a>
      <div class="topbar-links">
        <a href="#formats" @click="scrollToSection($event, 'formats')">{{ currentCopy.nav.formats }}</a>
        <a href="#solutions" @click="scrollToSection($event, 'solutions')">{{ currentCopy.nav.solutions }}</a>
        <a href="#ecosystem" @click="scrollToSection($event, 'ecosystem')">{{ currentCopy.nav.ecosystem }}</a>
        <a href="#commercial" @click="scrollToSection($event, 'commercial')">{{ currentCopy.nav.commercial }}</a>
        <a href="#delivery" @click="scrollToSection($event, 'delivery')">{{ currentCopy.nav.delivery }}</a>
        <a href="#support" @click="scrollToSection($event, 'support')">{{ currentCopy.nav.support }}</a>
      </div>
      <div class="topbar-actions">
        <a class="nav-icon-button" :href="githubUrl" target="_blank" rel="noreferrer" aria-label="GitHub repository">
          <GitHubMark />
        </a>
        <button class="language-toggle" type="button" @click="toggleLocale">
          <Languages :size="16" />
          {{ nextLocaleLabel }}
        </button>
        <a class="topbar-action" :href="demoUrl" target="_blank" rel="noreferrer">
          {{ currentCopy.nav.demo }}
          <ArrowRight :size="16" />
        </a>
      </div>
    </nav>

    <section id="top" class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">
          <Sparkles :size="17" />
          {{ currentCopy.hero.eyebrow }}
        </p>
        <h1>
          <template v-if="isZh">
            <span class="hero-title-line">把复杂文件，</span>
            <span class="hero-title-line">变成产品里的即时体验。</span>
          </template>
          <template v-else>{{ currentCopy.hero.title }}</template>
        </h1>
        <p class="hero-subtitle">{{ currentCopy.hero.subtitle }}</p>
        <div class="hero-actions">
          <a class="button primary" :href="demoUrl" target="_blank" rel="noreferrer">
            <span>{{ currentCopy.hero.primary }}</span>
            <MonitorPlay :size="18" />
          </a>
          <a class="button secondary" :href="docsUrl" target="_blank" rel="noreferrer">
            <span>{{ currentCopy.hero.secondary }}</span>
            <BookOpen :size="18" />
          </a>
          <a class="button tertiary" :href="commercialUrl" target="_blank" rel="noreferrer">
            <span>{{ currentCopy.hero.commercial }}</span>
            <Gem :size="18" />
          </a>
        </div>
        <div class="hero-badges" aria-label="Highlights">
          <span v-for="item in currentCopy.hero.proof" :key="item">
            <BadgeCheck :size="15" />
            {{ item }}
          </span>
        </div>
      </div>

      <div class="hero-visual" aria-label="Flyfish File Viewer 3D product preview">
        <div class="hero-stage">
          <canvas ref="heroCanvas" class="three-canvas" aria-hidden="true"></canvas>
          <div class="hero-signal hero-signal-top">
            <FileSpreadsheet :size="18" />
            <span>{{ isZh ? '统一预览链路' : 'Unified preview pipeline' }}</span>
          </div>
          <div class="hero-signal hero-signal-bottom">
            <Boxes :size="18" />
            <span>{{ isZh ? 'Worker / WASM 按需加载' : 'Worker / WASM on demand' }}</span>
          </div>
          <div class="hero-engine-card">
            <strong>{{ isZh ? 'Core Renderer' : 'Core Renderer' }}</strong>
            <span>{{ isZh ? '纯 TypeScript 底座' : 'framework-neutral TypeScript' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section id="formats" class="band band-light" aria-labelledby="formats-title">
      <div class="section-heading">
        <p class="section-kicker">Coverage matrix</p>
        <h2 id="formats-title">{{ currentCopy.matrixTitle }}</h2>
        <p>{{ currentCopy.matrixIntro }}</p>
      </div>
      <div class="metric-grid">
        <article v-for="item in metrics" :key="item.title" class="metric-card" :class="`metric-${item.tone}`">
          <span>{{ item.title }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.detail }}</p>
        </article>
      </div>
      <div class="format-grid" :aria-label="currentCopy.formatsTitle">
        <article v-for="group in formatGroups" :key="group.label" class="format-card" :class="`accent-${group.tone}`">
          <component :is="group.icon" :size="26" />
          <h3>{{ group.label }}</h3>
          <strong>{{ group.count }}</strong>
          <p>{{ group.examples }}</p>
        </article>
      </div>
    </section>

    <section
      ref="demoReveal"
      class="demo-reveal-section"
      :class="{ 'demo-reveal-active': demoRevealActive }"
      aria-labelledby="demo-title"
    >
      <div class="demo-reveal-stage">
        <div class="demo-reveal-copy">
          <div>
            <p class="section-kicker">Live workspace</p>
            <h2 id="demo-title">{{ currentCopy.demoTitle }}</h2>
            <p>{{ currentCopy.demoIntro }}</p>
          </div>
          <div class="inline-actions">
            <a class="button primary" :href="demoUrl" target="_blank" rel="noreferrer">
              <span>{{ currentCopy.nav.demo }}</span>
              <MonitorPlay :size="18" />
            </a>
            <a class="button secondary" :href="docsUrl" target="_blank" rel="noreferrer">
              <span>{{ currentCopy.nav.docs }}</span>
              <BookOpen :size="18" />
            </a>
          </div>
        </div>

        <div class="demo-reveal-window">
          <div class="demo-seam demo-seam-top">
            <span>{{ isZh ? '官网门户' : 'product portal' }}</span>
          </div>
          <div class="demo-browser demo-browser-wide">
            <div class="demo-browser-bar">
              <span />
              <span />
              <span />
              <strong>demo.file-viewer.app</strong>
            </div>
            <iframe
              v-if="demoFrameLoaded"
              :src="demoUrl"
              title="Flyfish File Viewer live demo"
              loading="lazy"
            ></iframe>
            <div v-else class="demo-frame-placeholder">
              <MonitorPlay :size="28" />
              <strong>{{ isZh ? '滚动到这里后加载完整 Demo' : 'Live demo loads when this section opens' }}</strong>
              <span>{{ isZh ? '避免首屏被独立站点资源拖慢' : 'Keeping the first view fast and focused' }}</span>
            </div>
          </div>
          <div class="demo-seam demo-seam-bottom">
            <span>{{ isZh ? '完整预览工作台' : 'complete preview workspace' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section id="solutions" class="band scenario-section" aria-labelledby="solutions-title">
      <div class="section-heading compact">
        <p class="section-kicker">In production</p>
        <h2 id="solutions-title">{{ currentCopy.solutionsTitle }}</h2>
        <p>{{ currentCopy.solutionsIntro }}</p>
      </div>
      <div class="scenario-grid">
        <article v-for="scenario in scenarios" :key="scenario.title" class="scenario-card">
          <component :is="scenario.icon" :size="24" />
          <h3>{{ scenario.title }}</h3>
          <p>{{ scenario.summary }}</p>
        </article>
      </div>
    </section>

    <section
      id="ecosystem"
      ref="quickStartSection"
      class="band ecosystem-section"
      :class="{ 'quickstart-active': quickStartSectionActive }"
      aria-labelledby="ecosystem-title"
    >
      <div class="ecosystem-copy">
        <p class="section-kicker">Native components</p>
        <h2 id="ecosystem-title">{{ currentCopy.ecosystemTitle }}</h2>
        <p>{{ currentCopy.ecosystemIntro }}</p>
        <div class="ecosystem-tags">
          <span v-for="item in ecosystem" :key="item">{{ item }}</span>
        </div>
        <div class="quickstart-tabs" role="tablist" aria-label="Ecosystem quick start examples">
          <button
            v-for="(item, index) in quickStartItems"
            :id="`quickstart-tab-${index}`"
            :key="item.packageName"
            class="quickstart-tab"
            :class="[`quickstart-tab-${item.tone}`, { 'is-active': index === activeQuickStartIndex }]"
            :style="{ transitionDelay: `${index * 55}ms` }"
            type="button"
            role="tab"
            :aria-selected="index === activeQuickStartIndex"
            :aria-controls="`quickstart-panel-${index}`"
            :tabindex="index === activeQuickStartIndex ? 0 : -1"
            @click="selectQuickStart(index)"
            @keydown="handleQuickStartKeydown($event, index)"
          >
            <span class="quickstart-tab-icon">
              <component :is="item.icon" :size="17" />
            </span>
            <span class="quickstart-tab-copy">
              <strong>{{ item.label }}</strong>
              <em>{{ item.packageName }}</em>
            </span>
          </button>
        </div>
      </div>

      <div class="quickstart-workbench" aria-label="Ecosystem quick start code">
        <div class="quickstart-header">
          <div>
            <span>{{ activeQuickStart.install }}</span>
            <strong>{{ activeQuickStart.title }}</strong>
          </div>
          <a :href="activeQuickStart.href" target="_blank" rel="noreferrer">
            {{ isZh ? '完整文档' : 'Full docs' }}
            <ArrowRight :size="15" />
          </a>
        </div>

        <div
          ref="quickStartTrack"
          class="quickstart-track"
          tabindex="0"
          aria-live="polite"
          @scroll.passive="syncQuickStartFromScroll"
        >
          <article
            v-for="(item, index) in quickStartItems"
            :id="`quickstart-panel-${index}`"
            :key="item.packageName"
            class="code-panel quickstart-panel"
            :class="`quickstart-panel-${item.tone}`"
            role="tabpanel"
            :aria-labelledby="`quickstart-tab-${index}`"
            :aria-hidden="index !== activeQuickStartIndex"
          >
            <div class="code-toolbar">
              <span />
              <span />
              <span />
              <strong>{{ item.language }}</strong>
            </div>
            <pre><code>{{ item.code }}</code></pre>
          </article>
        </div>

        <div class="quickstart-footer">
          <span>{{ activeQuickStart.summary }}</span>
          <div class="quickstart-dots" aria-label="Quick start slides">
            <button
              v-for="(item, index) in quickStartItems"
              :key="`dot-${item.packageName}`"
              type="button"
              :class="{ 'is-active': index === activeQuickStartIndex }"
              :aria-label="`${isZh ? '切换到' : 'Show'} ${item.label}`"
              @click="selectQuickStart(index)"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="band architecture-section" aria-labelledby="architecture-title">
      <div class="section-heading compact">
        <p class="section-kicker">Architecture</p>
        <h2 id="architecture-title">{{ currentCopy.docsTitle }}</h2>
        <p>{{ currentCopy.docsIntro }}</p>
      </div>
      <div class="capability-grid">
        <article v-for="capability in capabilities" :key="capability.title" class="capability-card">
          <component :is="capability.icon" :size="24" />
          <h3>{{ capability.title }}</h3>
          <p>{{ capability.detail }}</p>
        </article>
      </div>
    </section>

    <section id="commercial" class="commercial-section" aria-labelledby="commercial-title">
      <div class="commercial-copy">
        <p class="section-kicker">Commercial edition</p>
        <h2 id="commercial-title">{{ currentCopy.commercialTitle }}</h2>
        <p>{{ currentCopy.commercialIntro }}</p>
        <div class="inline-actions">
          <a class="button primary" :href="commercialUrl" target="_blank" rel="noreferrer">
            <span>{{ currentCopy.commercialCta }}</span>
            <ShoppingCart :size="18" />
          </a>
          <a class="button secondary" :href="commercialDemoUrl" target="_blank" rel="noreferrer">
            <span>{{ isZh ? '商业版 Demo' : 'Commercial Demo' }}</span>
            <ExternalLink :size="18" />
          </a>
        </div>
      </div>
      <div class="commercial-grid">
        <article v-for="item in commercialFeatures" :key="item.title" class="commercial-card">
          <component :is="item.icon" :size="24" />
          <h3>{{ item.title }}</h3>
          <p>{{ item.detail }}</p>
        </article>
      </div>
    </section>

    <section id="delivery" class="band portal-section" aria-labelledby="portal-title">
      <div class="section-heading compact">
        <p class="section-kicker">Portal</p>
        <h2 id="portal-title">{{ isZh ? '一个入口，找到所有必备站点。' : 'One portal for every essential destination.' }}</h2>
      </div>
      <div class="portal-grid">
        <a
          v-for="link in portalLinks"
          :key="link.href + link.label"
          class="portal-card"
          :class="{ 'primary-card': link.featured }"
          :href="link.href"
          target="_blank"
          rel="noreferrer"
        >
          <component :is="link.icon" :size="22" />
          <strong>{{ link.label }}</strong>
          <span>{{ link.note }}</span>
        </a>
      </div>
    </section>

    <section class="release-strip" aria-label="Downloads and deployment">
      <div>
        <p class="section-kicker">Ship anywhere</p>
        <h2>{{ currentCopy.releaseTitle }}</h2>
      </div>
      <div class="release-actions">
        <a :href="releasesUrl" target="_blank" rel="noreferrer">
          <Download :size="19" />
          <span>Release</span>
        </a>
        <a :href="githubUrl" target="_blank" rel="noreferrer">
          <GitHubMark />
          <span>GitHub</span>
        </a>
        <a :href="dockerDocsUrl" target="_blank" rel="noreferrer">
          <Wrench :size="19" />
          <span>Docker</span>
        </a>
      </div>
    </section>

    <footer id="support" class="support-footer">
      <div class="support-copy">
        <div class="footer-brand">
          <img src="/logo.png" alt="" />
          <strong>Flyfish File Viewer</strong>
        </div>
        <h2>{{ currentCopy.supportTitle }}</h2>
        <p>{{ currentCopy.supportIntro }}</p>
        <div class="footer-links">
          <a :href="shopUrl" target="_blank" rel="noreferrer">
            <HandCoins :size="16" />
            {{ isZh ? '飞鱼小铺' : 'Support shop' }}
          </a>
          <a :href="studioUrl" target="_blank" rel="noreferrer">
            <Rocket :size="16" />
            Flyfish Dev
          </a>
          <a :href="githubUrl" target="_blank" rel="noreferrer">
            <GitHubMark />
            GitHub
          </a>
        </div>
      </div>
      <div class="qr-grid">
        <article v-for="item in qrItems" :key="item.label" class="qr-card">
          <div class="qr-image">
            <img :src="item.image" :alt="item.label" />
          </div>
          <strong>
            <QrCode :size="15" />
            {{ item.label }}
          </strong>
          <span>{{ item.note }}</span>
        </article>
      </div>
      <div class="footer-bottom">
        <p>{{ currentCopy.footer }}</p>
      </div>
    </footer>
  </main>
</template>

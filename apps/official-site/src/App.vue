<script setup lang="ts">
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import type { Mesh, Object3D, Scene, WebGLRenderer } from 'three'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
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
  GitBranch,
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
  Replace,
  Rocket,
  Scale,
  SearchCheck,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Wrench,
  Zap
} from '@lucide/vue'

type Locale = 'zh' | 'en'
type HighlightLanguage = 'bash' | 'javascript' | 'typescript' | 'xml'

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

type CommercialComparisonItem = {
  dimension: string
  openSource: string
  commercial: string
  icon: Component
}

type CommercialRouteStep = {
  label: string
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
  highlightLanguage: HighlightLanguage
  code: string
  href: string
  tone: string
  icon: Component
}

type NavAnchorId =
  | 'formats'
  | 'demo'
  | 'solutions'
  | 'ecosystem'
  | 'docs'
  | 'commercial'
  | 'delivery'
  | 'support'

type SectionId = 'top' | NavAnchorId

type NavItem = {
  id: NavAnchorId
  label: string
}

const docsUrl = 'https://doc.file-viewer.app/'
const docsQuickstartUrl = `${docsUrl}guide/quickstart`
const demoUrl = 'https://demo.file-viewer.app/'
const compareUrl = 'https://demo.file-viewer.app/compare.html'
const githubUrl = 'https://github.com/flyfish-dev/file-viewer'
const githubApiUrl = 'https://api.github.com/repos/flyfish-dev/file-viewer'
const githubStarCountFallback = 739
const releasesUrl = 'https://github.com/flyfish-dev/file-viewer/releases'
const dockerDocsUrl = `${docsUrl}guide/docker`
const sponsorUrl = 'https://dev.flyfish.group/sponsor?source=github'
const studioUrl = 'https://flyfish.dev/'
const commercialUrl = 'https://product.flyfish.group/'
const commercialDemoUrl = 'https://office.flyfish.dev/'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)

const locale = ref<Locale>('zh')
const localeStorageKey = 'flyfish-file-viewer-site-locale'
const topbar = ref<HTMLElement | null>(null)
const heroCanvas = ref<HTMLCanvasElement | null>(null)
const demoReveal = ref<HTMLElement | null>(null)
const quickStartSection = ref<HTMLElement | null>(null)
const quickStartTrack = ref<HTMLElement | null>(null)
const isTopbarPinned = ref(false)
const activeSectionId = ref<SectionId>('top')
const demoRevealActive = ref(false)
const demoFrameLoaded = ref(false)
const quickStartSectionActive = ref(false)
const activeQuickStartIndex = ref(0)
const githubStarCount = ref(githubStarCountFallback)
const isZh = computed(() => locale.value === 'zh')
const nextLocaleLabel = computed(() => (isZh.value ? 'EN' : '中文'))
const githubStarsLabel = computed(() => formatStarCount(githubStarCount.value))
const githubStarsAriaLabel = computed(() =>
  isZh.value
    ? `GitHub 开源总仓，${githubStarsLabel.value} stars`
    : `GitHub repository, ${githubStarsLabel.value} stars`
)

function formatStarCount(count: number) {
  if (count >= 1000000) {
    return `${Number((count / 1000000).toFixed(1))}m`
  }
  if (count >= 1000) {
    return `${Number((count / 1000).toFixed(1))}k`
  }
  return `${count}`
}

async function loadGithubStarCount() {
  try {
    const response = await fetch(githubApiUrl, {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    })
    if (!response.ok) {
      return
    }
    const payload = (await response.json()) as { stargazers_count?: unknown }
    if (typeof payload.stargazers_count === 'number' && Number.isFinite(payload.stargazers_count)) {
      githubStarCount.value = payload.stargazers_count
    }
  } catch {
    // Keep the baked-in count when GitHub is unavailable or rate limited.
  }
}

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
      proof: ['206 个文件扩展名', '24 条预览链路', '多框架原生组件', 'Apache-2.0 开源']
    },
    matrixTitle: '覆盖广，不等于粗糙。每条链路都面向真实业务。',
    matrixIntro:
      '格式识别、资源加载、Worker/WASM、主题、水印、搜索、缩放、打印和导出都由预览器内部统一适配；PPTX 已由独立开源的 @file-viewer/pptx 原生引擎承接，业务侧可以选 preset-lite、preset-office、preset-engineering 或单 renderer 精确裁剪。',
    formatsTitle: '支持矩阵',
    solutionsTitle: '适合长期运行在企业系统里',
    solutionsIntro:
      '从 OA 审批到工程图纸，从客服工单到 AI 文档工作台，File Viewer 更关注真实文件、复杂网络、私有化部署和用户每天都会遇到的细节。',
    ecosystemTitle: '原生组件接入，统一参数与事件。',
    ecosystemIntro:
      '一个组件，一行代码，快速集成。Vanilla JS、Vue、React、Svelte、jQuery 与 Vue2 均提供独立接入示例；非 Vite 项目通过 options.preset 稳定注入能力，Vite 项目可注册插件自动发现已安装 preset。',
    demoTitle: '在线 Demo，直接验证真实预览体验。',
    demoIntro:
      '打开完整样例矩阵，验证 Word、PDF、PPTX、CAD、Typst、压缩包、图形、代码、媒体、上传预览与文档比对等核心场景。',
    docsTitle: '接入文档，快速参阅关键能力。',
    docsIntro:
      '从快速开始进入，集中查阅模块化装配、格式矩阵、组件参数、主题水印、搜索定位、打印导出、Docker、Release 与私有化部署。',
    commercialTitle: '免费组件与商业版的边界，一眼看清。',
    commercialIntro:
      '开源 File Viewer 负责浏览器原生、多格式、可离线部署的通用预览；商业版来自 Flyfish Office 自研原生文档引擎，专注 Word、Excel、PowerPoint 的高还原、大文件性能、授权交付和优先支持。两者不是二选一：商业版可以作为可替换的 Office 能力接入现有 File Viewer 组件，获得 file-viewer-pro 体验。',
    commercialCta: '了解商业授权',
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
      proof: ['206 file extensions', '24 preview pipelines', 'Native component packages', 'Apache-2.0 open source']
    },
    matrixTitle: 'Broad coverage, without treating fidelity as optional.',
    matrixIntro:
      'Format detection, assets, Worker/WASM loading, themes, watermarking, search, zoom, print, and export are adapted inside the viewer. PPTX is handled by the standalone open-source @file-viewer/pptx native engine, and applications can choose preset-lite, preset-office, preset-engineering, or exact single-renderer cuts.',
    formatsTitle: 'Format matrix',
    solutionsTitle: 'Built for long-running enterprise workspaces',
    solutionsIntro:
      'From approvals to engineering drawings, support tickets, and AI document workflows, File Viewer focuses on real files, private networks, self-hosted delivery, and the details users meet every day.',
    ecosystemTitle: 'Native integrations with one options and event model.',
    ecosystemIntro:
      'One component, one line of code, fast integration. Vanilla JS, Vue, React, Svelte, jQuery, and Vue 2 each get a dedicated entry path; non-Vite apps use options.preset, while Vite apps can register the plugin to auto-discover installed presets.',
    demoTitle: 'Live demo for real preview validation.',
    demoIntro:
      'Open the complete sample matrix to validate Word, PDF, PPTX, CAD, Typst, archives, diagrams, code, media, upload preview, and document comparison flows.',
    docsTitle: 'Integration docs for fast technical reference.',
    docsIntro:
      'Start from quickstart and jump into modular assembly, format matrix, component options, themes, watermarks, search anchors, print/export, Docker, Release downloads, and self-hosted deployment.',
    commercialTitle: 'Open-source component or commercial edition? Make the boundary obvious.',
    commercialIntro:
      'The open-source File Viewer focuses on browser-native, multi-format, offline-ready preview. The commercial edition comes from the Flyfish Office product line and focuses on Word, Excel, and PowerPoint fidelity, large-file performance, licensed delivery, and priority support. They are not mutually exclusive: the commercial engine can replace the Office capability inside the same File Viewer integration to deliver a file-viewer-pro experience.',
    commercialCta: 'Commercial Licensing',
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
        { title: '模块化按需装配', detail: 'core、renderer、preset 和生态组件职责分离；options.preset 覆盖所有构建工具，Vite 插件可自动发现已安装 preset，重度用户可用 preset-all 一键获得完整能力。', icon: Boxes }
      ]
    : [
        { title: 'Unified search and anchors', detail: 'Ctrl/Command + F opens focused search with highlights, next/previous navigation, and reusable page/line anchors.', icon: SearchCheck },
        { title: 'High-fidelity print and export', detail: 'PDF, Word, Markdown, images, and other printable renderers expose print and HTML export only when the output is trustworthy.', icon: Download },
        { title: 'Theme and watermark options', detail: 'light, dark, and system themes are controlled by options; text and image watermarks use one contract.', icon: PanelTop },
        { title: 'Modular on-demand assembly', detail: 'Core, renderer packages, presets, and native component packages keep separate responsibilities; options.preset works with every bundler, the Vite plugin can auto-discover installed presets, and preset-all gives heavy users the full one-step capability set.', icon: Boxes }
      ]
)

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
        { label: '打赏支持', href: sponsorUrl, note: '打赏项目，并获得优先技术支持', icon: HandCoins },
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
        { label: 'Sponsor', href: sponsorUrl, note: 'Sponsor the project and receive priority technical support', icon: HandCoins },
        { label: 'Flyfish Dev', href: studioUrl, note: 'Explore Flyfish Dev products and services', icon: Building2 }
      ]
)

function snippetImport(statement: string) {
  return `im${'port'} ${statement}`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function highlightSnippet(code: string, language: HighlightLanguage) {
  try {
    return hljs.highlight(code, { language, ignoreIllegals: true }).value
  } catch {
    return escapeHtml(code)
  }
}

const quickStartItems = computed<QuickStartItem[]>(() => [
  {
    label: isZh.value ? 'Vanilla JS Full' : 'Vanilla JS Full',
    packageName: '@file-viewer/web-full',
    install: 'CDN: @file-viewer/web-full',
    title: isZh.value ? '无需组件，脚本标签即可完整预览' : 'Complete preview from a script tag',
    summary: isZh.value
      ? 'CDN full 包默认启用完整格式矩阵，也保留命令式 mountViewer，适合传统页面、POC 和低门槛接入。'
      : 'The CDN full bundle enables the complete matrix by default and keeps an imperative mountViewer API for classic pages and POCs.',
    language: 'HTML',
    highlightLanguage: 'xml',
    href: `${docsUrl}guide/quickstart-web`,
    tone: 'violet',
    icon: MonitorPlay,
    code: `<div id="viewer" style="height:720px"></div>
<script src="https://cdn.jsdelivr.net/npm/@file-viewer/web-full@latest/dist/flyfish-file-viewer-web-full.iife.js"></${'script'}>

<script>
const controller = FlyfishFileViewerWebFull.mountViewer(
  document.getElementById('viewer'),
  {
    url: '/files/drawing.dwg',
    options: {
      theme: 'light',
      toolbar: { position: 'bottom-right' }
    },
    onEvent(event) {
      console.log(event.type, event.payload)
    }
  }
)

controller.zoomIn()
</${'script'}>`
  },
  {
    label: 'Vue 3',
    packageName: '@file-viewer/vue3-full',
    install: 'npm install @file-viewer/vue3-full',
    title: isZh.value ? 'Vue 3 一步获得完整能力' : 'Vue 3 with complete capability',
    summary: isZh.value
      ? 'full 包默认启用完整矩阵，仍保持 Vue 插件、组件 props、事件和 ref/controller 的原生体验。'
      : 'The full package enables the complete matrix while keeping native Vue plugin, props, events, and ref/controller APIs.',
    language: 'Vue SFC',
    highlightLanguage: 'typescript',
    href: `${docsUrl}guide/quickstart-vue3`,
    tone: 'green',
    icon: PanelTop,
    code: `${snippetImport("{ createApp } from 'vue'")}
${snippetImport("FileViewer from '@file-viewer/vue3-full'")}

const viewerOptions = {
  theme: 'light',
  toolbar: { position: 'bottom-right', zoom: true }
}

createApp(App).use(FileViewer).mount('#app')

<file-viewer
  url="/files/contract.pdf"
  :options="viewerOptions"
  @load-complete="handleLoadComplete"
/>`
  },
  {
    label: isZh.value ? 'Vue 3 按需' : 'Vue 3 On Demand',
    packageName: '@file-viewer/vue3',
    install: 'npm install @file-viewer/vue3 @file-viewer/preset-office',
    title: isZh.value ? 'Vue 3 标准包按需装配' : 'Vue 3 standard package with presets',
    summary: isZh.value
      ? '标准包保持最轻入口，格式能力通过 preset 或单 renderer 注入，适合控制安装体积。'
      : 'The standard package stays light; presets or single renderers control the installed capability set.',
    language: 'Vue SFC',
    highlightLanguage: 'typescript',
    href: `${docsUrl}guide/quickstart-vue3`,
    tone: 'green',
    icon: PanelTop,
    code: `${snippetImport("{ createApp } from 'vue'")}
${snippetImport("FileViewer from '@file-viewer/vue3'")}
${snippetImport("officePreset from '@file-viewer/preset-office'")}

const viewerOptions = {
  preset: officePreset,
  rendererMode: 'replace',
  theme: 'light',
  toolbar: { position: 'bottom-right', zoom: true }
}

createApp(App).use(FileViewer).mount('#app')

<file-viewer
  url="/files/contract.pdf"
  :options="viewerOptions"
/>`
  },
  {
    label: 'React',
    packageName: '@file-viewer/react-full',
    install: 'npm install @file-viewer/react-full',
    title: isZh.value ? 'React full 包一行接入' : 'React full package in one line',
    summary: isZh.value
      ? '默认完整矩阵，同时保留 React 组件、hooks、事件回调和 ref/controller，便于组合权限和业务工具栏。'
      : 'Complete matrix by default, with React components, hooks, callbacks, and ref/controller APIs for business toolbars.',
    language: 'TSX',
    highlightLanguage: 'typescript',
    href: `${docsUrl}guide/quickstart-react`,
    tone: 'blue',
    icon: Rocket,
    code: `${snippetImport("FileViewer, { useFileViewer } from '@file-viewer/react-full'")}

export function Preview() {
  const viewer = useFileViewer({
    url: '/files/report.docx',
    options: {
      theme: 'light',
      toolbar: { position: 'bottom-right' }
    },
    onEvent: event => console.log(event.type)
  })

  return (
    <FileViewer
      ref={viewer.ref}
      {...viewer.props}
    />
  )
}`
  },
  {
    label: 'Svelte',
    packageName: '@file-viewer/svelte-full',
    install: 'npm install @file-viewer/svelte-full',
    title: isZh.value ? 'Svelte full 包完整接入' : 'Svelte full package with the complete matrix',
    summary: isZh.value
      ? 'Svelte 组件独立依赖 core，full 包默认启用完整矩阵，并保留同样的 options、事件、主题、搜索、缩放和打印导出能力。'
      : 'The Svelte component depends directly on core; the full package enables the complete matrix and keeps the same options, events, themes, search, zoom, print, and export APIs.',
    language: 'Svelte',
    highlightLanguage: 'xml',
    href: `${docsUrl}guide/quickstart-svelte`,
    tone: 'cyan',
    icon: Zap,
    code: `<script lang="ts">
  ${snippetImport("FileViewer from '@file-viewer/svelte-full'")}

  const options = {
    theme: 'light',
    toolbar: { position: 'bottom-right', zoom: true }
  }
${'<\\/script>'}

<FileViewer
  url="/files/deck.pptx"
  {options}
  on:viewerEvent={event => console.log(event.detail.type)}
/>`
  },
  {
    label: 'Vue 2',
    packageName: '@file-viewer/vue2.7-full',
    install: 'npm install @file-viewer/vue2.7-full',
    title: isZh.value ? 'Vue 2.7 / 2.6 项目平滑接入' : 'Smooth Vue 2.7 / 2.6 integration',
    summary: isZh.value
      ? 'Vue legacy 组件保持同样的 props、事件和样式入口，适合存量 Vue2 系统逐步升级预览能力。'
      : 'Vue legacy packages keep the same props, events, and style entry for existing Vue 2 systems.',
    language: 'Vue 2',
    highlightLanguage: 'javascript',
    href: `${docsUrl}guide/quickstart-vue2`,
    tone: 'amber',
    icon: Layers3,
    code: `${snippetImport("Vue from 'vue'")}
${snippetImport("FileViewer from '@file-viewer/vue2.7-full'")}

Vue.use(FileViewer)

new Vue({
  template: \`
    <file-viewer
      url="/files/archive.zip"
      :options="viewerOptions"
      @viewer-event="handleViewerEvent"
    />
  \`,
  data: () => ({
    viewerOptions: {
      theme: 'light',
      toolbar: true
    }
  })
}).$mount('#app')`
  },
  {
    label: 'jQuery',
    packageName: '@file-viewer/jquery',
    install: 'npm install @file-viewer/jquery @file-viewer/preset-office',
    title: isZh.value ? '传统页面使用命令式挂载' : 'Imperative mounting for classic pages',
    summary: isZh.value
      ? '面向传统多页应用和渐进式改造，保留 controller、事件解绑、销毁和运行时更新能力。'
      : 'For classic multi-page apps and progressive migration, with controller, event cleanup, destroy, and runtime updates.',
    language: 'JavaScript',
    highlightLanguage: 'javascript',
    href: `${docsUrl}guide/ecosystem#jquery`,
    tone: 'orange',
    icon: Wrench,
    code: `${snippetImport("{ mountViewer } from '@file-viewer/jquery'")}
${snippetImport("officePreset from '@file-viewer/preset-office'")}

const controller = mountViewer(document.getElementById('viewer'), {
  url: '/files/sheet.xlsx',
  options: {
    preset: officePreset,
    rendererMode: 'replace',
    theme: 'light',
    toolbar: { zoom: true }
  },
  onEvent(event) {
    console.log(event.type)
  }
})

controller.load({ url: '/files/contract.pdf' })`
  },
  {
    label: isZh.value ? 'Vite 自动装配' : 'Vite Auto',
    packageName: '@file-viewer/vite-plugin',
    install: isZh.value
      ? 'npm install @file-viewer/vue3 @file-viewer/preset-office && npm install -D @file-viewer/vite-plugin'
      : 'npm install @file-viewer/vue3 @file-viewer/preset-office && npm install -D @file-viewer/vite-plugin',
    title: isZh.value ? '注册一次插件，自动发现已安装 preset' : 'Register once, auto-discover installed presets',
    summary: isZh.value
      ? 'Vite 不会仅因安装包而自动运行插件；在 vite.config.ts 注册后，插件会免手写 import 激活已安装 preset。'
      : 'Vite will not run a plugin just because it is installed; after vite.config.ts registration, installed presets activate without manual imports.',
    language: 'Vite',
    highlightLanguage: 'typescript',
    href: `${docsUrl}guide/on-demand-renderers`,
    tone: 'blue',
    icon: Layers3,
    code: `${snippetImport("{ defineConfig } from 'vite'")}
${snippetImport("{ fileViewerRenderers } from '@file-viewer/vite-plugin'")}

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      copyAssets: true
    })
  ]
})

// Installed @file-viewer/preset-office auto-activates with no preset option.
// Heavy users can install @file-viewer/preset-all and keep this config.
// Custom cuts can add formats, scan, chunkStrategy, or inject:false.`
  },
  {
    label: isZh.value ? '离线部署' : 'Offline',
    packageName: 'file-viewer-copy-assets',
    install: isZh.value ? '复制 worker / wasm / font / vendor 资产' : 'Copy worker / wasm / font / vendor assets',
    title: isZh.value ? '企业内网和严格 CSP 场景可自托管' : 'Self-host assets for intranet and strict CSP',
    summary: isZh.value
      ? 'PDF、CAD、Typst、Archive、Draw.io、DOCX、表格和 SQLite 等资源都可复制到业务自己的静态目录。'
      : 'PDF, CAD, Typst, Archive, Draw.io, DOCX, spreadsheet, and SQLite assets can live under your own static path.',
    language: 'Shell',
    highlightLanguage: 'bash',
    href: `${docsUrl}guide/distribution`,
    tone: 'cyan',
    icon: Boxes,
    code: `npx file-viewer-copy-assets ./public/file-viewer

# Then serve these files from your own domain.
# Configure paths only when your static prefix is custom:
# options.typst.compilerWasmUrl
# options.pdf.workerUrl
# options.archive.wasmUrl
# options.drawing.viewerScriptUrl`
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

const commercialComparison = computed<CommercialComparisonItem[]>(() =>
  isZh.value
    ? [
        {
          dimension: '文件格式',
          openSource:
            '覆盖 206 个扩展名，包含 PDF/OFD、Office、CAD、Typst、压缩包、邮件、绘图、媒体、3D 和数据资产；通过 lite / office / engineering / all preset 按需启用。',
          commercial:
            '重点增强 Word、Excel、PowerPoint 深水区，可替换 office preset 中的 Word / Spreadsheet / Presentation 能力；PDF、OFD、CAD、Archive 等其它格式继续由开源 renderer 承接。',
          icon: FileText
        },
        {
          dimension: '还原度',
          openSource:
            '目标是可读、可搜索、可打印、可嵌入业务系统；DOCX 当前偏流式阅读，Excel/PPTX 覆盖常见业务预览，不承诺原生 Office 逐像素一致。',
          commercial:
            '自研原生文档引擎面向分页、字体、表格、图形、页眉页脚、批注修订和复杂演示布局，适合合同、报告、档案和正式交付预览。',
          icon: Scale
        },
        {
          dimension: '性能',
          openSource:
            '轻 core + renderer 按需加载，Worker/WASM 懒加载，适合大多数附件中心和在线预览；极端大文件需要结合真实样本做回归。',
          commercial:
            '针对大文档、大表格和复杂 PPT 做 Worker 解析、分页/分块渲染、虚拟滚动、缓存和内存调优，优先保障主线程流畅。',
          icon: Zap
        },
        {
          dimension: '授权与支持',
          openSource:
            'Apache-2.0 开源，可用于商业项目；社区 issue、打赏和优先支持可协助定位，但上线验收与兼容性风险由项目自行把控。',
          commercial:
            '商业授权、私有交付、优先技术支持、样本回归和定制兼容路线，适合需要明确责任边界、交付周期和企业支持的场景。',
          icon: ShieldCheck
        }
      ]
    : [
        {
          dimension: 'Formats',
          openSource:
            'Covers 206 extensions across PDF/OFD, Office, CAD, Typst, archives, email, diagrams, media, 3D, and data assets through lite / office / engineering / all presets.',
          commercial:
            'Strengthens the Word, Excel, and PowerPoint deep end. It can replace the Word / Spreadsheet / Presentation capability in the office preset while PDF, OFD, CAD, Archive, and other formats continue to use open-source renderers.',
          icon: FileText
        },
        {
          dimension: 'Fidelity',
          openSource:
            'Optimized for readable, searchable, printable previews embedded in business systems. DOCX is currently flow-first, and Excel/PPTX target common preview needs rather than native Office pixel parity.',
          commercial:
            'The self-developed native document engine targets pagination, fonts, tables, shapes, headers/footers, comments/revisions, and complex deck layouts for contracts, reports, archives, and formal delivery.',
          icon: Scale
        },
        {
          dimension: 'Performance',
          openSource:
            'A light core plus lazy renderer loading keeps most attachment centers responsive. Worker/WASM assets load on demand, while extreme large files should be validated with real samples.',
          commercial:
            'Large documents, large spreadsheets, and complex decks get Worker parsing, paginated or chunked rendering, virtual scrolling, caching, and memory tuning to keep the main thread smooth.',
          icon: Zap
        },
        {
          dimension: 'Licensing and support',
          openSource:
            'Apache-2.0 open source and usable in commercial products. Community issues, sponsorship, and priority support can help, but final launch validation remains with the product team.',
          commercial:
            'Commercial licensing, private delivery, priority support, sample regression, and custom compatibility work for teams that need clear ownership, delivery timelines, and enterprise support.',
          icon: ShieldCheck
        }
      ]
)

const commercialRouteSteps = computed<CommercialRouteStep[]>(() =>
  isZh.value
    ? [
        {
          label: 'Step 01',
          title: '保留现有组件入口',
          detail: 'Vue、React、Svelte、jQuery、Web Component 或 Vanilla JS 接入方式不变，业务仍使用同一套 options、事件和 controller。',
          icon: PanelTop
        },
        {
          label: 'Step 02',
          title: '替换 Office 能力',
          detail: '将开源 office preset 中的 Word、Spreadsheet、Presentation renderer 替换为商业版 Office preset / renderer。',
          icon: Replace
        },
        {
          label: 'Step 03',
          title: '继续组合其它格式',
          detail: 'PDF、OFD、CAD、Archive、Email、Drawing、3D、Data 等仍可通过开源 preset 或单 renderer 与商业 Office 能力并列装配。',
          icon: GitBranch
        },
        {
          label: 'Step 04',
          title: '获得 file-viewer-pro 效果',
          detail: '同一个 FileViewer 外壳内获得商业版 Office 高还原、大文件性能、授权交付和优先支持体验。',
          icon: Sparkles
        }
      ]
    : [
        {
          label: 'Step 01',
          title: 'Keep the same component entry',
          detail: 'Vue, React, Svelte, jQuery, Web Component, and Vanilla JS integrations keep the same options, events, and controller contract.',
          icon: PanelTop
        },
        {
          label: 'Step 02',
          title: 'Replace the Office capability',
          detail: 'Swap the open-source Word, Spreadsheet, and Presentation renderers from the office preset with the commercial Office preset or renderer set.',
          icon: Replace
        },
        {
          label: 'Step 03',
          title: 'Keep composing other formats',
          detail: 'PDF, OFD, CAD, Archive, Email, Drawing, 3D, Data, and other formats can still be assembled through open-source presets or single renderers.',
          icon: GitBranch
        },
        {
          label: 'Step 04',
          title: 'Deliver a file-viewer-pro experience',
          detail: 'The same FileViewer shell gains commercial Office fidelity, large-file performance, licensed delivery, and priority support.',
          icon: Sparkles
        }
      ]
)

const commercialRouteCode = computed(() =>
  isZh.value
    ? `${snippetImport("FileViewer from '@file-viewer/vue3'")}
${snippetImport("engineeringPreset from '@file-viewer/preset-engineering'")}
${snippetImport("{ commercialOfficePreset } from './vendor/file-viewer-pro-office'")}

const viewerOptions = {
  rendererMode: 'replace',
  preset: [
    commercialOfficePreset,
    engineeringPreset
  ],
  theme: 'light'
}

<FileViewer
  url="/files/report.docx"
  :options="viewerOptions"
/>`
    : `${snippetImport("FileViewer from '@file-viewer/vue3'")}
${snippetImport("engineeringPreset from '@file-viewer/preset-engineering'")}
${snippetImport("{ commercialOfficePreset } from './vendor/file-viewer-pro-office'")}

const viewerOptions = {
  rendererMode: 'replace',
  preset: [
    commercialOfficePreset,
    engineeringPreset
  ],
  theme: 'light'
}

<FileViewer
  url="/files/report.docx"
  :options="viewerOptions"
/>`
)

const qrItems = computed<QrItem[]>(() =>
  isZh.value
    ? [
        { label: '微信打赏', note: '请我们喝杯柠檬水', image: '/donate-wx.jpg' },
        { label: '支付宝打赏', note: '支持开源持续迭代', image: '/donate-alipay.jpg' },
        { label: '客服微信', note: '优先支持与商业沟通', image: '/contact.jpg' },
        { label: '公众号', note: '关注更新与实践文章', image: '/wechat-mp.png' },
        { label: '交流群', note: '加入用户交流群', image: '/invite.webp' }
      ]
    : [
        { label: 'WeChat Sponsor', note: 'Buy us a lemonade', image: '/donate-wx.jpg' },
        { label: 'Alipay Sponsor', note: 'Support open-source work', image: '/donate-alipay.jpg' },
        { label: 'Support Contact', note: 'Priority support and business inquiries', image: '/contact.jpg' },
        { label: 'Official Account', note: 'Updates and engineering notes', image: '/wechat-mp.png' },
        { label: 'Community Group', note: 'Join the user community', image: '/invite.webp' }
      ]
)

const currentCopy = computed(() => copy[locale.value])

const pageSectionIds: readonly SectionId[] = [
  'top',
  'formats',
  'demo',
  'solutions',
  'ecosystem',
  'docs',
  'commercial',
  'delivery',
  'support'
]

const primaryNavItems = computed<NavItem[]>(() => [
  { id: 'formats', label: currentCopy.value.nav.formats },
  { id: 'demo', label: currentCopy.value.nav.demo },
  { id: 'solutions', label: currentCopy.value.nav.solutions },
  { id: 'ecosystem', label: currentCopy.value.nav.ecosystem },
  { id: 'docs', label: currentCopy.value.nav.docs },
  { id: 'commercial', label: currentCopy.value.nav.commercial },
  { id: 'delivery', label: currentCopy.value.nav.delivery },
  { id: 'support', label: currentCopy.value.nav.support }
])

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
let pageScrollFrame = 0

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

function isPageSectionId(id: string): id is SectionId {
  return pageSectionIds.includes(id as SectionId)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getTopbarScrollOffset() {
  const rect = topbar.value?.getBoundingClientRect()
  const height = rect?.height ?? 72
  const top = rect ? Math.max(8, rect.top) : 14
  return Math.ceil(height + top + 62)
}

function updateAnchorOffsetVariable() {
  const rect = topbar.value?.getBoundingClientRect()
  const styles = topbar.value ? window.getComputedStyle(topbar.value) : null
  const marginTop = styles ? Number.parseFloat(styles.marginTop) || 0 : 14
  const marginBottom = styles ? Number.parseFloat(styles.marginBottom) || 0 : 32
  const topbarSpace = Math.ceil((rect?.height ?? 72) + marginTop + marginBottom)
  document.documentElement.style.setProperty('--site-anchor-offset', `${getTopbarScrollOffset()}px`)
  document.documentElement.style.setProperty('--site-topbar-space', `${topbarSpace}px`)
}

function resolveActiveSection() {
  const anchorY = window.scrollY + getTopbarScrollOffset() + 6
  let nextSection: SectionId = 'top'

  pageSectionIds.forEach((id) => {
    const section = document.getElementById(id)
    if (section && section.offsetTop <= anchorY) {
      nextSection = id
    }
  })

  const pageBottom = window.scrollY + window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  if (pageBottom >= documentHeight - 8) {
    nextSection = 'support'
  }

  return nextSection
}

function updatePageNavStateNow() {
  isTopbarPinned.value = window.scrollY > 24
  updateAnchorOffsetVariable()
  activeSectionId.value = resolveActiveSection()
}

function requestPageNavStateUpdate() {
  window.cancelAnimationFrame(pageScrollFrame)
  pageScrollFrame = window.requestAnimationFrame(updatePageNavStateNow)
}

function scrollInitialHashIntoView() {
  const hashId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : ''
  const target = hashId ? document.getElementById(hashId) : null
  if (!target) return

  window.requestAnimationFrame(() => {
    if (hashId === 'ecosystem') {
      quickStartSectionActive.value = true
    }
    if (isPageSectionId(hashId)) {
      activeSectionId.value = hashId
    }
    const top =
      hashId === 'top'
        ? 0
        : Math.max(0, target.getBoundingClientRect().top + window.scrollY - getTopbarScrollOffset())
    window.scrollTo({ top, behavior: 'auto' })
    updatePageNavStateNow()
  })
}

function scrollToSection(event: MouseEvent, id: SectionId) {
  event.preventDefault()
  const target = document.getElementById(id)
  if (!target) return

  const top =
    id === 'top'
      ? 0
      : Math.max(0, target.getBoundingClientRect().top + window.scrollY - getTopbarScrollOffset())
  if (id === 'ecosystem') {
    quickStartSectionActive.value = true
  }
  activeSectionId.value = id
  window.history.replaceState(null, '', `#${id}`)
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

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
let topbarResizeObserver: ResizeObserver | undefined

onMounted(async () => {
  locale.value = resolveInitialLocale()
  void loadGithubStarCount()
  await nextTick()
  topbarResizeObserver = new ResizeObserver(requestPageNavStateUpdate)
  if (topbar.value) {
    topbarResizeObserver.observe(topbar.value)
  }
  window.addEventListener('scroll', requestPageNavStateUpdate, { passive: true })
  window.addEventListener('resize', requestPageNavStateUpdate)
  updatePageNavStateNow()
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
  window.removeEventListener('scroll', requestPageNavStateUpdate)
  window.removeEventListener('resize', requestPageNavStateUpdate)
  demoRevealObserver?.disconnect()
  quickStartObserver?.disconnect()
  topbarResizeObserver?.disconnect()
  window.cancelAnimationFrame(quickStartScrollFrame)
  window.cancelAnimationFrame(pageScrollFrame)
  disposeHeroScene?.()
})
</script>

<template>
  <main class="site-shell" :class="{ 'has-pinned-nav': isTopbarPinned }" :lang="locale">
    <nav
      ref="topbar"
      class="topbar"
      :class="{ 'is-pinned': isTopbarPinned }"
      aria-label="Primary navigation"
    >
      <a class="brand" href="#top" aria-label="Flyfish File Viewer" @click="scrollToSection($event, 'top')">
        <img src="/logo.png" alt="" />
        <span>File Viewer</span>
      </a>
      <div class="topbar-links">
        <a
          v-for="item in primaryNavItems"
          :key="item.id"
          :href="`#${item.id}`"
          :class="{ 'is-active': activeSectionId === item.id }"
          :aria-current="activeSectionId === item.id ? 'location' : undefined"
          @click="scrollToSection($event, item.id)"
        >
          {{ item.label }}
        </a>
      </div>
      <div class="topbar-actions">
        <a
          class="nav-icon-button github-star-button"
          :href="githubUrl"
          target="_blank"
          rel="noreferrer"
          :aria-label="githubStarsAriaLabel"
        >
          <GitHubMark />
          <span class="github-star-badge" aria-hidden="true">
            <Star :size="9" fill="currentColor" :stroke-width="2.5" />
            <span>{{ githubStarsLabel }}</span>
          </span>
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
      id="demo"
      ref="demoReveal"
      class="demo-reveal-section"
      :class="{ 'demo-reveal-active': demoRevealActive }"
      aria-labelledby="demo-title"
    >
      <div class="demo-reveal-stage">
        <div class="demo-reveal-copy">
          <div>
            <p class="section-kicker">Live demo</p>
            <h2 id="demo-title">{{ currentCopy.demoTitle }}</h2>
            <p>{{ currentCopy.demoIntro }}</p>
          </div>
          <div class="inline-actions">
            <a class="button primary" :href="demoUrl" target="_blank" rel="noreferrer">
              <span>{{ currentCopy.nav.demo }}</span>
              <MonitorPlay :size="18" />
            </a>
            <a class="button secondary" :href="compareUrl" target="_blank" rel="noreferrer">
              <span>{{ isZh ? '文档比对' : 'Compare Demo' }}</span>
              <PanelTop :size="18" />
            </a>
          </div>
        </div>

        <div class="demo-reveal-window">
          <div class="demo-seam demo-seam-top">
            <span>{{ isZh ? '完整预览器' : 'full viewer' }}</span>
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
              <strong>{{ isZh ? '在线 Demo' : 'Live demo' }}</strong>
              <span>{{ isZh ? '完整预览器即将加载' : 'Full viewer loading' }}</span>
            </div>
          </div>
          <div class="demo-seam demo-seam-bottom">
            <span>{{ isZh ? '真实样例矩阵' : 'real sample matrix' }}</span>
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
              <em>{{ item.title }}</em>
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
            <pre><code
              class="hljs"
              :class="`language-${item.highlightLanguage}`"
              v-html="highlightSnippet(item.code, item.highlightLanguage)"
            ></code></pre>
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

    <section id="docs" class="band docs-section" aria-labelledby="docs-title">
      <div class="section-heading compact">
        <p class="section-kicker">Documentation</p>
        <h2 id="docs-title">{{ currentCopy.docsTitle }}</h2>
        <p>{{ currentCopy.docsIntro }}</p>
      </div>
      <div class="docs-quick-nav" aria-label="Documentation shortcuts">
        <a :href="docsQuickstartUrl" target="_blank" rel="noreferrer">{{ isZh ? '快速开始' : 'Quickstart' }}</a>
        <a :href="`${docsUrl}guide/on-demand-renderers`" target="_blank" rel="noreferrer">{{ isZh ? '按需装配' : 'On-demand' }}</a>
        <a :href="`${docsUrl}guide/formats`" target="_blank" rel="noreferrer">{{ isZh ? '支持格式' : 'Formats' }}</a>
        <a :href="`${docsUrl}guide/usage`" target="_blank" rel="noreferrer">{{ isZh ? '组件参数' : 'Options' }}</a>
        <a :href="`${docsUrl}guide/distribution`" target="_blank" rel="noreferrer">{{ isZh ? '部署分发' : 'Distribution' }}</a>
      </div>
      <div class="docs-frame-card">
        <div class="demo-browser-bar">
          <span />
          <span />
          <span />
          <strong>doc.file-viewer.app / guide / quickstart</strong>
        </div>
        <iframe
          :src="docsQuickstartUrl"
          title="Flyfish File Viewer quickstart documentation"
          loading="lazy"
        ></iframe>
      </div>
    </section>

    <section class="band architecture-section" aria-labelledby="architecture-title">
      <div class="section-heading compact">
        <p class="section-kicker">Architecture</p>
        <h2 id="architecture-title">{{ isZh ? '架构边界清晰，长期维护才稳。' : 'Clear boundaries keep the project maintainable.' }}</h2>
        <p>{{ isZh ? 'core、renderer、preset、组件包和静态资产各司其职，避免把框架、重型引擎或资源路径揉进同一个入口。' : 'Core, renderers, presets, component packages, and static assets stay separated so framework code, heavy engines, and resource paths do not collapse into one entry point.' }}</p>
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
      <div class="commercial-heading">
        <div>
          <p class="section-kicker">Commercial edition</p>
          <h2 id="commercial-title">{{ currentCopy.commercialTitle }}</h2>
          <p>{{ currentCopy.commercialIntro }}</p>
        </div>
        <div class="commercial-heading-actions">
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

      <div class="commercial-summary-grid" aria-label="Edition summary">
        <article class="commercial-summary-card open-source-card">
          <span>{{ isZh ? '免费开源组件' : 'Open-source component' }}</span>
          <strong>{{ isZh ? '多格式覆盖，前端原生，Apache-2.0' : 'Multi-format, browser-native, Apache-2.0' }}</strong>
          <p>{{ isZh ? '适合业务附件中心、内网预览、轻量集成和需要私有化部署的通用文件查看。' : 'Best for attachment centers, intranet preview, lightweight integration, and self-hosted general file viewing.' }}</p>
        </article>
        <article class="commercial-summary-card pro-card">
          <span>{{ isZh ? '商业版 Office 引擎' : 'Commercial Office engine' }}</span>
          <strong>{{ isZh ? '替换 Office 能力，获得 file-viewer-pro 效果' : 'Replace Office capability for a file-viewer-pro experience' }}</strong>
          <p>{{ isZh ? '适合高还原合同、报表、演示稿、大文件、企业授权和需要优先技术支持的严肃场景。' : 'Best for high-fidelity contracts, reports, decks, large files, enterprise licensing, and priority support.' }}</p>
        </article>
      </div>

      <div class="commercial-comparison" :aria-label="isZh ? '免费版与商业版对比' : 'Open-source and commercial comparison'">
        <div class="comparison-row comparison-row-head" aria-hidden="true">
          <span>{{ isZh ? '维度' : 'Dimension' }}</span>
          <span>{{ isZh ? '免费 File Viewer 组件' : 'Open-source File Viewer' }}</span>
          <span>{{ isZh ? '商业版 / file-viewer-pro 路线' : 'Commercial / file-viewer-pro path' }}</span>
        </div>
        <article v-for="item in commercialComparison" :key="item.dimension" class="comparison-row">
          <div class="comparison-dimension">
            <component :is="item.icon" :size="22" />
            <strong>{{ item.dimension }}</strong>
          </div>
          <p>
            <span class="comparison-mobile-label">{{ isZh ? '免费组件' : 'Open source' }}</span>
            {{ item.openSource }}
          </p>
          <p class="comparison-pro">
            <span class="comparison-mobile-label">{{ isZh ? '商业版' : 'Commercial' }}</span>
            {{ item.commercial }}
          </p>
        </article>
      </div>

      <div class="commercial-route">
        <div class="route-copy">
          <p class="section-kicker">Replacement path</p>
          <h3>{{ isZh ? '不推翻现有接入，只替换 Office 引擎。' : 'Do not rebuild the integration. Replace the Office engine.' }}</h3>
          <p>{{ isZh ? '商业版交付时提供可插拔的 Office preset / renderer。业务保留 FileViewer 组件、主题、水印、工具栏、搜索、事件和其它格式能力，只把 Word、Excel、PowerPoint 的渲染链路切到商业引擎。' : 'Commercial delivery provides a pluggable Office preset or renderer set. The product keeps the FileViewer component, themes, watermarks, toolbar, search, events, and non-Office renderers while Word, Excel, and PowerPoint switch to the commercial engine.' }}</p>
        </div>
        <div class="route-steps">
          <article v-for="step in commercialRouteSteps" :key="step.label" class="route-step">
            <span>{{ step.label }}</span>
            <component :is="step.icon" :size="22" />
            <h4>{{ step.title }}</h4>
            <p>{{ step.detail }}</p>
          </article>
        </div>
        <div class="commercial-code-panel">
          <div class="code-toolbar">
            <span />
            <span />
            <span />
            <strong>{{ isZh ? '替换路线示例' : 'Replacement example' }}</strong>
          </div>
          <pre><code
            class="hljs language-typescript"
            v-html="highlightSnippet(commercialRouteCode, 'typescript')"
          ></code></pre>
          <p>{{ isZh ? '实际包名和交付方式以商业授权交付为准；这里展示的是稳定的 File Viewer preset 替换模式。' : 'The actual package name and delivery channel depend on the commercial license; this shows the stable File Viewer preset replacement pattern.' }}</p>
        </div>
      </div>

      <div class="commercial-grid commercial-feature-grid">
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
          <a :href="sponsorUrl" target="_blank" rel="noreferrer">
            <HandCoins :size="16" />
            {{ isZh ? '打赏支持' : 'Sponsor' }}
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

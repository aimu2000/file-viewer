<script setup lang='ts'>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileSearch,
  Link2,
  MoreHorizontal,
  RotateCcw,
  Search,
  Upload,
  X,
  ZoomIn,
  ZoomOut
} from '@lucide/vue'
import { DEFAULT_FILE_VIEWER_ARCHIVE_WORKER_PATH } from '@file-viewer/core'
import { allRenderers } from '@file-viewer/preset-all'
import { listenForFile } from '@/components/utils'
import type {
  FileViewerFileRef as FileRef,
  FileViewerOperationAvailability,
  FileViewerOptions,
  FileViewerPublicApi as FileViewerExpose,
  FileViewerSearchState,
  FileViewerZoomState
} from '@file-viewer/core'
import brandLogo from '@/assets/logo.png'

const hidden = ref(false)
const input = ref(true)
const filename = ref('')
const file = ref<FileRef | undefined>()
type DemoLocale = 'zh-CN' | 'en-US'

const DEMO_LOCALE_STORAGE_KEY = 'file-viewer-demo-locale'
const DEFAULT_DEMO_URL_BY_LOCALE: Record<DemoLocale, string> = {
  'zh-CN': '/example/word.docx',
  'en-US': '/example/en/calibre-demo.docx'
}

const normalizeDemoLocale = (value?: string | null): DemoLocale => {
  return String(value || '').toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US'
}

const resolveInitialDemoLocale = (): DemoLocale => {
  const query = new URLSearchParams(window.location.search)
  const explicitLocale = query.get('locale') || query.get('lang')
  if (explicitLocale) {
    return normalizeDemoLocale(explicitLocale)
  }
  const storedLocale = window.localStorage.getItem(DEMO_LOCALE_STORAGE_KEY)
  if (storedLocale) {
    return normalizeDemoLocale(storedLocale)
  }
  return normalizeDemoLocale(navigator.languages?.[0] || navigator.language)
}

const demoLocale = ref<DemoLocale>(resolveInitialDemoLocale())
const url = ref(DEFAULT_DEMO_URL_BY_LOCALE[demoLocale.value])
const preview = ref('')
const scenarioPickerOpen = ref(false)
const samplePickerOpen = ref(false)
const expandedSampleGroupIndex = ref<number | null>(0)
const scenarioPickerRef = ref<HTMLElement | null>(null)
const samplePickerRef = ref<HTMLElement | null>(null)
const controlPanelRef = ref<HTMLElement | null>(null)
const sampleMenuPlacement = ref<'bottom' | 'top'>('bottom')
const sampleMenuMaxHeight = ref('min(52vh, 520px)')
const watermarkEnabled = ref(false)
const runtimeOptions = shallowRef<FileViewerOptions>({})
const mobileControlsOpen = ref(false)
const mobileActionsOpen = ref(false)
const viewerSearchOpen = ref(false)
const viewerSearchQuery = ref('')
const viewerSearchInputRef = ref<HTMLInputElement | null>(null)
const snippetCopied = ref(false)
const viewerSearchState = ref<FileViewerSearchState>({
  query: '',
  total: 0,
  currentIndex: -1,
  current: null,
  matches: []
})

type ViewerAction = 'download' | 'print' | 'exportHtml' | 'zoomIn' | 'zoomOut' | 'resetZoom'

const fileViewerRef = ref<FileViewerExpose | null>(null)
const viewerAvailability = ref<FileViewerOperationAvailability>({
  download: false,
  print: false,
  exportHtml: false,
  zoom: false,
  zoomIn: false,
  zoomOut: false,
  zoomReset: false
})
const viewerZoomState = ref<FileViewerZoomState>({
  scale: 1,
  label: '100%',
  canZoomIn: false,
  canZoomOut: false,
  canReset: false
})

type PresetFile = {
  name: string
  url: string
}

type SampleGroup = {
  title: string
  description: string
  family: string
  items: PresetFile[]
}

type ScenarioPick = {
  title: string
  description: string
  url: string
  family: string
}

const demoCopyMap: Record<DemoLocale, Record<string, string>> = {
  'zh-CN': {
    pageTitle: 'Flyfish File Viewer 在线预览器 Vue3',
    pureWeb: 'Pure Web',
    local: '本地',
    link: '链接',
    upload: '上传',
    samples: '样例',
    search: '搜索',
    more: '更多',
    quickSamples: '快速试用',
    quickSamplesHint: '常用格式一键打开',
    sampleFile: '示例文件',
    collapse: '收起',
    open: '打开',
    address: '地址',
    addressPlaceholder: '输入文件地址',
    preview: '预览',
    closePanel: '关闭操作面板',
    chooseFile: '点击选择文件',
    openLocal: '从本机打开',
    unselected: '未选择文件',
    previewActions: '预览操作',
    zoomOut: '缩小预览',
    zoomIn: '放大预览',
    resetZoom: '还原比例',
    download: '下载',
    downloadTitle: '下载原始文件',
    print: '打印',
    printTitle: '打印完整渲染内容',
    exportHtml: 'HTML',
    exportHtmlTitle: '导出当前渲染后的 HTML',
    watermark: '水印',
    watermarkTitle: '切换水印',
    searchDocument: '文档搜索',
    searchPlaceholder: '搜索当前文档',
    previousResult: '上一个搜索结果',
    nextResult: '下一个搜索结果',
    closeSearch: '关闭搜索',
    closeMobileControls: '关闭移动端操作面板',
    openLinkSettings: '打开链接设置',
    openSamples: '打开示例文件',
    uploadLocalFile: '上传本地文件',
    searchCurrentDocument: '搜索当前文档',
    openMoreActions: '打开更多操作',
    reset: '还原',
    auto: 'AUTO',
    language: '语言',
    integrationSnippet: '接入代码',
    copySnippet: '复制代码',
    copiedSnippet: '已复制'
  },
  'en-US': {
    pageTitle: 'Flyfish File Viewer Demo for Vue 3',
    pureWeb: 'Pure Web',
    local: 'Local',
    link: 'URL',
    upload: 'Upload',
    samples: 'Samples',
    search: 'Search',
    more: 'More',
    quickSamples: 'Quick samples',
    quickSamplesHint: 'Open common formats',
    sampleFile: 'Sample file',
    collapse: 'Collapse',
    open: 'Open',
    address: 'URL',
    addressPlaceholder: 'Paste a file URL',
    preview: 'Preview',
    closePanel: 'Close control panel',
    chooseFile: 'Choose a file',
    openLocal: 'Open from this device',
    unselected: 'No file selected',
    previewActions: 'Preview actions',
    zoomOut: 'Zoom out',
    zoomIn: 'Zoom in',
    resetZoom: 'Reset zoom',
    download: 'Download',
    downloadTitle: 'Download original file',
    print: 'Print',
    printTitle: 'Print complete rendered content',
    exportHtml: 'HTML',
    exportHtmlTitle: 'Export rendered HTML',
    watermark: 'Watermark',
    watermarkTitle: 'Toggle watermark',
    searchDocument: 'Document search',
    searchPlaceholder: 'Search this document',
    previousResult: 'Previous search result',
    nextResult: 'Next search result',
    closeSearch: 'Close search',
    closeMobileControls: 'Close mobile controls',
    openLinkSettings: 'Open URL settings',
    openSamples: 'Open sample files',
    uploadLocalFile: 'Upload a local file',
    searchCurrentDocument: 'Search this document',
    openMoreActions: 'Open more actions',
    reset: 'Reset',
    auto: 'AUTO',
    language: 'Language',
    integrationSnippet: 'Integration code',
    copySnippet: 'Copy code',
    copiedSnippet: 'Copied'
  }
}

const demoCopy = computed(() => demoCopyMap[demoLocale.value])

const sampleGroupsZh: SampleGroup[] = [
  {
    title: '文档',
    description: 'Word / PDF / OFD / Typst',
    family: 'word',
    items: [
      { name: 'DOC', url: '/example/test.doc' },
      { name: 'DOCX 中文长文档', url: '/example/word.docx' },
      { name: 'DOT 模板', url: '/example/template.dot' },
      { name: 'RTF', url: '/example/sample.rtf' },
      { name: 'ODT', url: '/example/document.odt' },
      { name: 'PDF 技术说明', url: '/example/pdf.pdf' },
      { name: 'OFD', url: '/example/ofd.ofd' },
      { name: 'Typst', url: '/example/report.typ' }
    ]
  },
  {
    title: '表格',
    description: 'Excel / CSV / ODS',
    family: 'sheet',
    items: [
      { name: 'XLSX', url: '/example/excel.xlsx' },
      { name: 'XLSM', url: '/example/excel.xlsm' },
      { name: 'XLSB', url: '/example/excel.xlsb' },
      { name: 'XLS', url: '/example/excel.xls' },
      { name: 'CSV', url: '/example/table.csv' },
      { name: 'ODS', url: '/example/excel.ods' },
      { name: 'FODS', url: '/example/excel.fods' },
      { name: 'Numbers', url: '/example/excel.numbers' }
    ]
  },
  {
    title: '演示与图纸',
    description: 'PPTX / CAD',
    family: 'cad',
    items: [
      { name: 'NASA 月球战略 PPTX', url: '/example/ppt.pptx' },
      { name: 'ODP', url: '/example/slides.odp' },
      { name: 'DXF', url: '/example/drawing.dxf' },
      { name: 'DWG', url: '/example/sample.dwg' },
      { name: 'DWF Blocks/Tables', url: '/example/samples/apache/blocks_and_tables.dwf' },
      { name: 'DWFx House', url: '/example/samples/autodesk/house.dwfx' },
      { name: 'DWFx RobotArm', url: '/example/samples/autodesk/robot-arm.dwfx' }
    ]
  },
  {
    title: '脑图与绘图',
    description: 'XMind / Mermaid / PlantUML / draw.io',
    family: 'drawing',
    items: [
      { name: 'XMind 脑图', url: '/example/mindmap.xmind' },
      { name: 'Mermaid 架构图', url: '/example/architecture.mermaid' },
      { name: 'PlantUML 时序图', url: '/example/sequence.plantuml' },
      { name: 'Excalidraw', url: '/example/flow.excalidraw' },
      { name: 'draw.io', url: '/example/process.drawio' }
    ]
  },
  {
    title: '3D 模型和地理数据',
    description: 'GLTF / OBJ / STL / GeoJSON / KML / GPX',
    family: 'model',
    items: [
      { name: 'GLTF', url: '/example/model.gltf' },
      { name: 'OBJ', url: '/example/model.obj' },
      { name: 'STL', url: '/example/model.stl' },
      { name: 'PLY', url: '/example/model.ply' },
      { name: 'STEP', url: '/example/model.step' },
      { name: 'GeoJSON', url: '/example/map.geojson' },
      { name: 'KML', url: '/example/route.kml' },
      { name: 'GPX', url: '/example/track.gpx' }
    ]
  },
  {
    title: '电子书',
    description: 'EPUB / UMD',
    family: 'ebook',
    items: [
      { name: 'EPUB', url: '/example/book.epub' },
      { name: 'UMD', url: '/example/book.umd' }
    ]
  },
  {
    title: '压缩包',
    description: 'ZIP / TAR.GZ / 加密',
    family: 'archive',
    items: [
      { name: 'ZIP', url: '/example/archive.zip' },
      { name: 'TAR.GZ', url: '/example/archive.tar.gz' },
      { name: '加密 ZIP（密码 flyfish）', url: '/example/encrypted.zip' }
    ]
  },
  {
    title: '邮件与 EDA',
    description: 'EML / MSG / OLB / DRA / GDS / OASIS',
    family: 'email',
    items: [
      { name: 'EML', url: '/example/sample.eml' },
      { name: 'MSG', url: '/example/sample.msg' },
      { name: 'MBOX', url: '/example/sample.mbox' },
      { name: 'OLB', url: '/example/sample.olb' },
      { name: 'DRA', url: '/example/sample.dra' },
      { name: 'GDSII', url: '/example/layout.gds' },
      { name: 'OAS', url: '/example/layout.oas' },
      { name: 'OASIS', url: '/example/layout.oasis' }
    ]
  },
  {
    title: '文本',
    description: 'Markdown / TXT / Log',
    family: 'text',
    items: [
      { name: 'MD', url: '/example/markdown.md' },
      { name: 'MARKDOWN', url: '/example/notes.markdown' },
      { name: 'TXT', url: '/example/text.txt' },
      { name: 'Log', url: '/example/app.log' }
    ]
  },
  {
    title: '前端与数据',
    description: 'JS / TS / Vue / Data',
    family: 'code',
    items: [
      { name: 'JSON', url: '/example/data.json' },
      { name: 'JSONC', url: '/example/data.jsonc' },
      { name: 'JSON5', url: '/example/data.json5' },
      { name: 'IPYNB', url: '/example/notebook.ipynb' },
      { name: 'JS', url: '/example/code.js' },
      { name: 'MJS', url: '/example/code.mjs' },
      { name: 'CJS', url: '/example/code.cjs' },
      { name: 'TS', url: '/example/code.ts' },
      { name: 'TSX', url: '/example/code.tsx' },
      { name: 'JSX', url: '/example/code.jsx' },
      { name: 'CSS', url: '/example/code.css' },
      { name: 'HTML', url: '/example/page.html' },
      { name: 'HTM', url: '/example/page.htm' },
      { name: 'XML', url: '/example/data.xml' },
      { name: 'VUE', url: '/example/component.vue' },
      { name: 'React', url: '/example/component.react' },
      { name: 'YAML', url: '/example/config.yaml' },
      { name: 'YML', url: '/example/config.yml' },
      { name: 'TOML', url: '/example/config.toml' },
      { name: 'INI', url: '/example/settings.ini' },
      { name: 'PROTO', url: '/example/service.proto' },
      { name: 'HCL', url: '/example/infrastructure.hcl' },
      { name: 'TeX', url: '/example/formula.tex' },
      { name: 'Graphviz', url: '/example/graph.gv' },
      { name: 'HTTP', url: '/example/request.http' },
      { name: 'DIFF', url: '/example/change.diff' },
      { name: 'PATCH 左右比对', url: '/example/change.patch' },
      { name: 'Git Bundle', url: '/example/repository.bundle' }
    ]
  },
  {
    title: '后端与系统',
    description: 'Shell / SQL / C / Go',
    family: 'code',
    items: [
      { name: 'SH', url: '/example/script.sh' },
      { name: 'BASH', url: '/example/script.bash' },
      { name: 'SQL', url: '/example/query.sql' },
      { name: 'GO', url: '/example/main.go' },
      { name: 'RS', url: '/example/main.rs' },
      { name: 'PHP', url: '/example/index.php' },
      { name: 'C', url: '/example/main.c' },
      { name: 'CPP', url: '/example/main.cpp' },
      { name: 'CC', url: '/example/module.cc' },
      { name: 'H', url: '/example/main.h' },
      { name: 'HPP', url: '/example/main.hpp' },
      { name: 'CS', url: '/example/program.cs' },
      { name: 'Java', url: '/example/code.java' },
      { name: 'Python', url: '/example/code.py' },
      { name: 'Ruby', url: '/example/code.rb' },
      { name: 'Swift', url: '/example/code.swift' },
      { name: 'Kotlin', url: '/example/Main.kt' }
    ]
  },
  {
    title: '资产与数据',
    description: 'SQLite / WASM / ICO',
    family: 'data',
    items: [
      { name: 'SQLite', url: '/example/sample.sqlite' },
      { name: 'WASM', url: '/example/module.wasm' },
      { name: 'PSD 图层', url: '/example/design.psd' },
      { name: 'ICO', url: '/example/icon.ico' }
    ]
  },
  {
    title: '媒体',
    description: 'Image / Audio / Video',
    family: 'image',
    items: [
      { name: 'PNG', url: '/example/pic.png' },
      { name: 'JPG', url: '/example/pic.jpg' },
      { name: 'JPEG', url: '/example/pic.jpeg' },
      { name: 'GIF', url: '/example/pic.gif' },
      { name: 'BMP', url: '/example/pic.bmp' },
      { name: 'TIFF', url: '/example/pic.tiff' },
      { name: 'TIF', url: '/example/pic.tif' },
      { name: 'SVG', url: '/example/vector.svg' },
      { name: 'WEBP', url: '/example/pic.webp' },
      { name: 'MP3', url: '/example/audio.mp3' },
      { name: 'OGG', url: '/example/audio.ogg' },
      { name: 'MIDI', url: '/example/melody.mid' },
      { name: 'MP4', url: '/example/video.mp4' }
    ]
  }
]

const englishGroupCopy: Array<Pick<SampleGroup, 'title' | 'description'>> = [
  { title: 'Documents', description: 'Word / PDF / OFD / Typst' },
  { title: 'Spreadsheets', description: 'Excel / CSV / ODS' },
  { title: 'Slides & CAD', description: 'PPTX / CAD' },
  { title: 'Mindmaps & Diagrams', description: 'XMind / Mermaid / PlantUML / draw.io' },
  { title: '3D Models & Geospatial Data', description: 'GLTF / OBJ / STL / GeoJSON / KML / GPX' },
  { title: 'Ebooks', description: 'EPUB / UMD' },
  { title: 'Archives', description: 'ZIP / TAR.GZ / Encrypted' },
  { title: 'Email & EDA', description: 'EML / MSG / OLB / DRA / GDS / OASIS' },
  { title: 'Text', description: 'Markdown / TXT / Log' },
  { title: 'Frontend & Data', description: 'JS / TS / Vue / Data' },
  { title: 'Backend & System', description: 'Shell / SQL / C / Go' },
  { title: 'Assets & Data', description: 'SQLite / WASM / PSD / ICO' },
  { title: 'Media', description: 'Image / Audio / Video' }
]

const englishSampleUrlMap: Record<string, string> = {
  '/example/word.docx': '/example/en/calibre-demo.docx',
  '/example/excel.xlsx': '/example/en/financial-sample.xlsx',
  '/example/pdf.pdf': '/example/en/prince-sample.pdf',
  '/example/ppt.pptx': '/example/en/sample-presentation.pptx',
  '/example/archive.zip': '/example/en/archive.zip',
  '/example/archive.tar.gz': '/example/en/archive.tar.gz',
  '/example/encrypted.zip': '/example/encrypted.zip',
  '/example/model.gltf': '/example/en/model.gltf',
  '/example/map.geojson': '/example/en/map.geojson',
  '/example/markdown.md': '/example/en/markdown.md',
  '/example/notes.markdown': '/example/en/notes.markdown',
  '/example/text.txt': '/example/en/text.txt',
  '/example/app.log': '/example/en/app.log',
  '/example/table.csv': '/example/en/table.csv',
  '/example/data.json': '/example/en/data.json',
  '/example/data.jsonc': '/example/en/data.jsonc',
  '/example/data.json5': '/example/en/data.json5',
  '/example/code.ts': '/example/en/code.ts',
  '/example/code.js': '/example/en/code.js'
}

const englishSampleNameMap: Record<string, string> = {
  '/example/test.doc': 'DOC legacy document',
  '/example/en/calibre-demo.docx': 'DOCX rich English document',
  '/example/template.dot': 'DOT template',
  '/example/sample.rtf': 'RTF document',
  '/example/document.odt': 'ODT document',
  '/example/en/prince-sample.pdf': 'PDF technical sample',
  '/example/ofd.ofd': 'OFD layout document',
  '/example/report.typ': 'Typst report',
  '/example/en/financial-sample.xlsx': 'XLSX financial workbook',
  '/example/excel.xlsm': 'XLSM macro workbook',
  '/example/excel.xlsb': 'XLSB binary workbook',
  '/example/excel.xls': 'XLS legacy workbook',
  '/example/table.csv': 'CSV table',
  '/example/excel.ods': 'ODS spreadsheet',
  '/example/excel.fods': 'Flat ODS spreadsheet',
  '/example/excel.numbers': 'Numbers workbook',
  '/example/en/sample-presentation.pptx': 'NASA lunar strategy PPTX',
  '/example/slides.odp': 'ODP presentation',
  '/example/drawing.dxf': 'DXF drawing',
  '/example/sample.dwg': 'DWG Autodesk sample',
  '/example/samples/apache/blocks_and_tables.dwf': 'DWF blocks and tables',
  '/example/samples/autodesk/house.dwfx': 'DWFx house drawing',
  '/example/samples/autodesk/robot-arm.dwfx': 'DWFx robot arm',
  '/example/mindmap.xmind': 'XMind mind map',
  '/example/architecture.mermaid': 'Mermaid architecture',
  '/example/sequence.plantuml': 'PlantUML sequence',
  '/example/flow.excalidraw': 'Excalidraw scene',
  '/example/process.drawio': 'draw.io process',
  '/example/book.epub': 'EPUB ebook',
  '/example/book.umd': 'UMD ebook',
  '/example/en/archive.zip': 'ZIP archive with English samples',
  '/example/en/archive.tar.gz': 'TAR.GZ archive with English samples',
  '/example/encrypted.zip': 'Encrypted ZIP (password: flyfish)',
  '/example/sample.eml': 'EML message',
  '/example/sample.msg': 'MSG Outlook message',
  '/example/sample.mbox': 'MBOX mailbox',
  '/example/sample.olb': 'OLB library',
  '/example/sample.dra': 'DRA design archive',
  '/example/layout.gds': 'GDSII layout',
  '/example/layout.oas': 'OAS layout',
  '/example/layout.oasis': 'OASIS layout',
  '/example/markdown.md': 'Markdown document',
  '/example/notes.markdown': 'Markdown notes',
  '/example/text.txt': 'Plain text',
  '/example/app.log': 'Application log',
  '/example/en/markdown.md': 'Markdown product guide',
  '/example/en/notes.markdown': 'Markdown support notes',
  '/example/en/text.txt': 'Plain text overview',
  '/example/en/app.log': 'Application log stream',
  '/example/en/table.csv': 'CSV revenue table',
  '/example/en/data.json': 'JSON capability data',
  '/example/en/data.jsonc': 'JSONC config sample',
  '/example/en/data.json5': 'JSON5 config sample',
  '/example/en/code.ts': 'TypeScript integration sample',
  '/example/en/code.js': 'JavaScript integration sample',
  '/example/en/model.gltf': 'glTF embedded model',
  '/example/en/map.geojson': 'GeoJSON Bay route',
  '/example/change.patch': 'Patch side-by-side diff',
  '/example/repository.bundle': 'Git bundle history',
  '/example/sample.sqlite': 'SQLite database',
  '/example/module.wasm': 'WASM module',
  '/example/design.psd': 'PSD layers',
  '/example/icon.ico': 'ICO image'
}

const sampleGroupsEn: SampleGroup[] = sampleGroupsZh.map((group, index) => ({
  ...group,
  ...(englishGroupCopy[index] || {}),
  items: group.items.map(item => {
    const nextUrl = englishSampleUrlMap[item.url] || item.url
    return {
      url: nextUrl,
      name: englishSampleNameMap[nextUrl] || englishSampleNameMap[item.url] || item.name
    }
  })
}))

const sampleGroups = computed(() => demoLocale.value === 'zh-CN' ? sampleGroupsZh : sampleGroupsEn)
const presetFiles = computed(() => sampleGroups.value.flatMap(group => group.items))
const allPresetFiles = [...sampleGroupsZh, ...sampleGroupsEn].flatMap(group => group.items)
const scenarioPicks = computed<ScenarioPick[]>(() => demoLocale.value === 'zh-CN'
  ? [
      { title: '试试 Word 合同', description: 'DOCX 长文档', url: '/example/word.docx', family: 'word' },
      { title: '试试 Excel 报表', description: '多 sheet 表格', url: '/example/excel.xlsx', family: 'sheet' },
      { title: '试试 NASA PPT', description: '专业演示稿', url: '/example/ppt.pptx', family: 'slide' },
      { title: '试试 DWG 图纸', description: '工程图纸', url: '/example/sample.dwg', family: 'cad' },
      { title: '试试 GeoJSON', description: '地理数据叠加层', url: '/example/map.geojson', family: 'model' },
      { title: '试试压缩包', description: '嵌套预览', url: '/example/archive.zip', family: 'archive' },
      { title: '试试邮件', description: 'EML 附件', url: '/example/sample.eml', family: 'email' }
    ]
  : [
      { title: 'Try Word doc', description: 'Rich DOCX', url: '/example/en/calibre-demo.docx', family: 'word' },
      { title: 'Try Excel report', description: 'Workbook', url: '/example/en/financial-sample.xlsx', family: 'sheet' },
      { title: 'Try NASA deck', description: 'Professional PPTX', url: '/example/en/sample-presentation.pptx', family: 'slide' },
      { title: 'Try DWG drawing', description: 'CAD sample', url: '/example/sample.dwg', family: 'cad' },
      { title: 'Try GeoJSON', description: 'Geospatial overlay', url: '/example/en/map.geojson', family: 'model' },
      { title: 'Try archive', description: 'Nested files', url: '/example/en/archive.zip', family: 'archive' },
      { title: 'Try email', description: 'EML message', url: '/example/sample.eml', family: 'email' }
    ])
const integrationSnippet = computed(() => {
  if (file.value) {
    return `import FileViewer from '@file-viewer/react-full'

export function Preview({ file }: { file: File }) {
  return <FileViewer file={file} style={{ height: 720 }} />
}`
  }
  const sampleUrl = preview.value || url.value || DEFAULT_DEMO_URL_BY_LOCALE[demoLocale.value]
  return `import FileViewer from '@file-viewer/react-full'

export function Preview() {
  return <FileViewer url="${sampleUrl}" style={{ height: 720 }} />
}`
})
const extraUploadExtensions = [
  'docm', 'dot', 'dotx', 'dotm', 'rtf', 'odt',
  'xlt', 'xltx', 'xltm',
  'pptm', 'potx', 'potm', 'ppsx', 'ppsm', 'odp',
  'avif', 'jxl', 'heic', 'heif', 'webm', 'm3u8', 'mpeg', 'wav', 'oga', 'opus', 'm4a', 'aac', 'flac', 'weba', 'midi',
  'glb', 'fbx', 'dae', '3ds', '3mf', 'amf', 'usd', 'usda', 'usdc', 'usdz', 'kmz',
  'step', 'stp', 'iges', 'igs', 'ifc', '3dm', 'pcd', 'wrl', 'vrml', 'xyz', 'vtk', 'vtp', 'shp',
  'zip', 'zipx', '7z', 'rar', 'tar', 'gz', 'gzip', 'tgz', 'bz2', 'bzip2', 'tbz', 'tbz2',
  'xz', 'txz', 'lzma', 'zst', 'tzst', 'cab', 'ar', 'cpio', 'iso', 'xar', 'lha', 'lzh',
  'jar', 'war', 'ear', 'apk', 'cbz', 'cbr', 'eml', 'msg', 'mbox', 'olb', 'dra', 'gds', 'oas', 'oasis', 'xmind', 'typst',
  'mermaid', 'mmd', 'plantuml', 'puml', 'patch', 'bundle', 'bdl',
  'ttf', 'otf', 'woff', 'woff2', 'psd', 'ai', 'eps', 'parquet', 'avro', 'webarchive'
]

const uploadAccept = Array.from(new Set([
  ...allPresetFiles.map(item => {
    const ext = item.url.split('.').pop()
    return ext ? `.${ext}` : ''
  }),
  ...extraUploadExtensions.map(ext => `.${ext}`)
]))
  .filter(Boolean)
  .join(',')

const fileIconMeta: Record<string, { icon: string; family: string }> = {
  doc: { icon: 'W', family: 'word' },
  docx: { icon: 'W', family: 'word' },
  docm: { icon: 'W', family: 'word' },
  dot: { icon: 'DOT', family: 'word' },
  dotx: { icon: 'DOT', family: 'word' },
  dotm: { icon: 'DOT', family: 'word' },
  rtf: { icon: 'RTF', family: 'word' },
  odt: { icon: 'ODT', family: 'word' },
  xlsx: { icon: 'XL', family: 'sheet' },
  xltx: { icon: 'XLT', family: 'sheet' },
  xlsm: { icon: 'XL', family: 'sheet' },
  xlsb: { icon: 'XL', family: 'sheet' },
  xls: { icon: 'XL', family: 'sheet' },
  xlt: { icon: 'XLT', family: 'sheet' },
  xltm: { icon: 'XLT', family: 'sheet' },
  csv: { icon: 'CSV', family: 'sheet' },
  ods: { icon: 'ODS', family: 'sheet' },
  fods: { icon: 'ODS', family: 'sheet' },
  numbers: { icon: 'NO', family: 'sheet' },
  pptx: { icon: 'P', family: 'slide' },
  pptm: { icon: 'P', family: 'slide' },
  potx: { icon: 'POT', family: 'slide' },
  potm: { icon: 'POT', family: 'slide' },
  ppsx: { icon: 'PPS', family: 'slide' },
  ppsm: { icon: 'PPS', family: 'slide' },
  odp: { icon: 'ODP', family: 'slide' },
  pdf: { icon: 'PDF', family: 'pdf' },
  ofd: { icon: 'OFD', family: 'layout' },
  typ: { icon: 'TYP', family: 'layout' },
  typst: { icon: 'TYP', family: 'layout' },
  dxf: { icon: 'CAD', family: 'cad' },
  dwg: { icon: 'CAD', family: 'cad' },
  dwf: { icon: 'DWF', family: 'cad' },
  dwfx: { icon: 'DWFx', family: 'cad' },
  xps: { icon: 'XPS', family: 'cad' },
  xmind: { icon: 'XM', family: 'drawing' },
  mermaid: { icon: 'MER', family: 'drawing' },
  mmd: { icon: 'MER', family: 'drawing' },
  plantuml: { icon: 'UML', family: 'drawing' },
  puml: { icon: 'UML', family: 'drawing' },
  glb: { icon: '3D', family: 'model' },
  gltf: { icon: '3D', family: 'model' },
  obj: { icon: 'OBJ', family: 'model' },
  stl: { icon: 'STL', family: 'model' },
  ply: { icon: 'PLY', family: 'model' },
  fbx: { icon: 'FBX', family: 'model' },
  dae: { icon: 'DAE', family: 'model' },
  '3ds': { icon: '3DS', family: 'model' },
  '3mf': { icon: '3MF', family: 'model' },
  amf: { icon: 'AMF', family: 'model' },
  usd: { icon: 'USD', family: 'model' },
  usda: { icon: 'USD', family: 'model' },
  usdc: { icon: 'USD', family: 'model' },
  usdz: { icon: 'USD', family: 'model' },
  kmz: { icon: 'KMZ', family: 'model' },
  geojson: { icon: 'GEO', family: 'model' },
  kml: { icon: 'KML', family: 'model' },
  gpx: { icon: 'GPX', family: 'model' },
  shp: { icon: 'SHP', family: 'model' },
  step: { icon: 'STEP', family: 'model' },
  stp: { icon: 'STEP', family: 'model' },
  iges: { icon: 'IGES', family: 'model' },
  igs: { icon: 'IGES', family: 'model' },
  ifc: { icon: 'IFC', family: 'model' },
  '3dm': { icon: '3DM', family: 'model' },
  pcd: { icon: 'PCD', family: 'model' },
  wrl: { icon: 'WRL', family: 'model' },
  vrml: { icon: 'VRML', family: 'model' },
  xyz: { icon: 'XYZ', family: 'model' },
  vtk: { icon: 'VTK', family: 'model' },
  vtp: { icon: 'VTP', family: 'model' },
  excalidraw: { icon: 'EX', family: 'drawing' },
  drawio: { icon: 'DIO', family: 'drawing' },
  dio: { icon: 'DIO', family: 'drawing' },
  epub: { icon: 'EPUB', family: 'ebook' },
  umd: { icon: 'UMD', family: 'ebook' },
  zip: { icon: 'ZIP', family: 'archive' },
  zipx: { icon: 'ZIP', family: 'archive' },
  '7z': { icon: '7Z', family: 'archive' },
  rar: { icon: 'RAR', family: 'archive' },
  tar: { icon: 'TAR', family: 'archive' },
  gz: { icon: 'GZ', family: 'archive' },
  gzip: { icon: 'GZ', family: 'archive' },
  tgz: { icon: 'TGZ', family: 'archive' },
  bz2: { icon: 'BZ2', family: 'archive' },
  bzip2: { icon: 'BZ2', family: 'archive' },
  tbz: { icon: 'TBZ', family: 'archive' },
  tbz2: { icon: 'TBZ', family: 'archive' },
  xz: { icon: 'XZ', family: 'archive' },
  txz: { icon: 'TXZ', family: 'archive' },
  lzma: { icon: 'LZ', family: 'archive' },
  zst: { icon: 'ZST', family: 'archive' },
  tzst: { icon: 'ZST', family: 'archive' },
  cab: { icon: 'CAB', family: 'archive' },
  ar: { icon: 'AR', family: 'archive' },
  cpio: { icon: 'CPIO', family: 'archive' },
  iso: { icon: 'ISO', family: 'archive' },
  xar: { icon: 'XAR', family: 'archive' },
  lha: { icon: 'LHA', family: 'archive' },
  lzh: { icon: 'LZH', family: 'archive' },
  jar: { icon: 'JAR', family: 'archive' },
  war: { icon: 'WAR', family: 'archive' },
  ear: { icon: 'EAR', family: 'archive' },
  apk: { icon: 'APK', family: 'archive' },
  cbz: { icon: 'CBZ', family: 'archive' },
  cbr: { icon: 'CBR', family: 'archive' },
  eml: { icon: 'EML', family: 'email' },
  msg: { icon: 'MSG', family: 'email' },
  mbox: { icon: 'MBOX', family: 'email' },
  olb: { icon: 'OLB', family: 'eda' },
  dra: { icon: 'DRA', family: 'eda' },
  gds: { icon: 'GDS', family: 'eda' },
  oas: { icon: 'OAS', family: 'eda' },
  oasis: { icon: 'OAS', family: 'eda' },
  md: { icon: 'MD', family: 'text' },
  markdown: { icon: 'MD', family: 'text' },
  txt: { icon: 'TXT', family: 'text' },
  json: { icon: '{}', family: 'code' },
  jsonc: { icon: '{}', family: 'code' },
  json5: { icon: 'J5', family: 'code' },
  ipynb: { icon: 'NB', family: 'code' },
  js: { icon: 'JS', family: 'code' },
  mjs: { icon: 'JS', family: 'code' },
  cjs: { icon: 'JS', family: 'code' },
  ts: { icon: 'TS', family: 'code' },
  tsx: { icon: 'TSX', family: 'code' },
  jsx: { icon: 'JSX', family: 'code' },
  css: { icon: 'CSS', family: 'code' },
  html: { icon: 'HTML', family: 'code' },
  htm: { icon: 'HTML', family: 'code' },
  xml: { icon: 'XML', family: 'code' },
  vue: { icon: 'VUE', family: 'code' },
  react: { icon: 'RE', family: 'code' },
  yaml: { icon: 'YML', family: 'code' },
  yml: { icon: 'YML', family: 'code' },
  toml: { icon: 'TOML', family: 'code' },
  ini: { icon: 'INI', family: 'code' },
  proto: { icon: 'PB', family: 'code' },
  hcl: { icon: 'HCL', family: 'code' },
  tex: { icon: 'TEX', family: 'code' },
  gv: { icon: 'GV', family: 'code' },
  http: { icon: 'HTTP', family: 'code' },
  sh: { icon: 'SH', family: 'code' },
  bash: { icon: 'SH', family: 'code' },
  sql: { icon: 'SQL', family: 'code' },
  go: { icon: 'GO', family: 'code' },
  rs: { icon: 'RS', family: 'code' },
  php: { icon: 'PHP', family: 'code' },
  c: { icon: 'C', family: 'code' },
  cpp: { icon: 'C++', family: 'code' },
  cc: { icon: 'C++', family: 'code' },
  h: { icon: 'H', family: 'code' },
  hpp: { icon: 'H++', family: 'code' },
  cs: { icon: 'CS', family: 'code' },
  diff: { icon: 'DIFF', family: 'code' },
  patch: { icon: 'PATCH', family: 'code' },
  bundle: { icon: 'GIT', family: 'code' },
  bdl: { icon: 'GIT', family: 'code' },
  java: { icon: 'JV', family: 'code' },
  py: { icon: 'PY', family: 'code' },
  rb: { icon: 'RB', family: 'code' },
  swift: { icon: 'SW', family: 'code' },
  kt: { icon: 'KT', family: 'code' },
  log: { icon: 'LOG', family: 'text' },
  png: { icon: 'IMG', family: 'image' },
  jpg: { icon: 'IMG', family: 'image' },
  jpeg: { icon: 'IMG', family: 'image' },
  gif: { icon: 'GIF', family: 'image' },
  bmp: { icon: 'IMG', family: 'image' },
  tiff: { icon: 'IMG', family: 'image' },
  tif: { icon: 'IMG', family: 'image' },
  svg: { icon: 'SVG', family: 'image' },
  webp: { icon: 'WEBP', family: 'image' },
  avif: { icon: 'AVIF', family: 'image' },
  ico: { icon: 'ICO', family: 'image' },
  heic: { icon: 'HEIC', family: 'image' },
  heif: { icon: 'HEIF', family: 'image' },
  jxl: { icon: 'JXL', family: 'image' },
  mp3: { icon: 'MP3', family: 'audio' },
  mpeg: { icon: 'MP3', family: 'audio' },
  wav: { icon: 'WAV', family: 'audio' },
  ogg: { icon: 'OGG', family: 'audio' },
  oga: { icon: 'OGG', family: 'audio' },
  opus: { icon: 'OPUS', family: 'audio' },
  m4a: { icon: 'M4A', family: 'audio' },
  aac: { icon: 'AAC', family: 'audio' },
  flac: { icon: 'FLAC', family: 'audio' },
  weba: { icon: 'WEBA', family: 'audio' },
  midi: { icon: 'MIDI', family: 'audio' },
  mid: { icon: 'MIDI', family: 'audio' },
  mp4: { icon: 'MP4', family: 'video' },
  webm: { icon: 'WEBM', family: 'video' },
  m3u8: { icon: 'HLS', family: 'video' },
  ttf: { icon: 'FONT', family: 'data' },
  otf: { icon: 'FONT', family: 'data' },
  woff: { icon: 'FONT', family: 'data' },
  woff2: { icon: 'FONT', family: 'data' },
  psd: { icon: 'PSD', family: 'data' },
  ai: { icon: 'AI', family: 'data' },
  eps: { icon: 'EPS', family: 'data' },
  sqlite: { icon: 'SQL', family: 'data' },
  wasm: { icon: 'WASM', family: 'data' },
  parquet: { icon: 'PARQ', family: 'data' },
  avro: { icon: 'AVRO', family: 'data' },
  webarchive: { icon: 'WEB', family: 'data' }
}

const extensionOf = (target: string) => {
  const clean = target.split(/[?#]/)[0] || target
  const dotIndex = clean.lastIndexOf('.')
  return dotIndex === -1 ? '' : clean.slice(dotIndex + 1).toLowerCase()
}

const sampleUrlKey = (target: string) => {
  const clean = target.split(/[?#]/)[0] || target
  try {
    return decodeURIComponent(new URL(clean, 'https://demo.file-viewer.app').pathname)
  } catch {
    const path = clean.startsWith('/') ? clean : `/${clean}`
    return decodeURIComponent(path)
  }
}

const legacyDemoUrlMap: Record<string, string> = {
  '/example/calibre-demo.docx': '/example/en/calibre-demo.docx'
}

const normalizeDemoUrl = (target: string) => {
  const normalizedPath = legacyDemoUrlMap[sampleUrlKey(target)]
  if (!normalizedPath) {
    return target
  }
  try {
    const parsed = new URL(target, window.location.origin)
    const isRelative = !/^[a-z][a-z\d+\-.]*:/i.test(target)
    const isDemoOrigin = parsed.origin === window.location.origin || parsed.hostname === 'demo.file-viewer.app'
    if (!isRelative && !isDemoOrigin) {
      return target
    }
    return `${normalizedPath}${parsed.search}${parsed.hash}`
  } catch {
    return normalizedPath
  }
}

const isSameSampleUrl = (left: string, right: string) => {
  return sampleUrlKey(left) === sampleUrlKey(right)
}

const fileNameOf = (target: string) => {
  const clean = target.split(/[?#]/)[0] || target
  return decodeURIComponent(clean.split('/').pop() || target)
}

const getFileIconMeta = (target: string) => {
  return fileIconMeta[extensionOf(target)] || { icon: 'FILE', family: 'generic' }
}

const activePreset = computed(() => {
  return presetFiles.value.find(item => isSameSampleUrl(item.url, url.value))
})

const activeSampleGroupIndex = computed(() => {
  const target = activePreset.value?.url || url.value || preview.value
  return sampleGroups.value.findIndex(group => group.items.some(item => isSameSampleUrl(item.url, target)))
})

const activeIconMeta = computed(() => {
  return getFileIconMeta(activePreset.value?.url || url.value)
})

const displayMode = computed(() => {
  return file.value ? demoCopy.value.local : demoCopy.value.link
})

const displayName = computed(() => {
  if (file.value && filename.value) {
    return filename.value
  }
  if (preview.value) {
    const name = preview.value.split('/').pop() || preview.value
    return decodeURIComponent(name)
  }
  return activePreset.value?.name || demoCopy.value.unselected
})

const displayPath = computed(() => {
  if (file.value && filename.value) {
    return filename.value
  }
  return preview.value || url.value || ''
})

const previewType = computed(() => {
  const name = displayName.value
  const ext = extensionOf(name)
  if (!ext) {
    return demoCopy.value.auto
  }
  return ext.toUpperCase()
})

const externalToolbar = computed(() => {
  const toolbar = runtimeOptions.value.toolbar
  if (toolbar === false) {
    return {
      download: false,
      print: false,
      exportHtml: false,
      zoom: false
    }
  }
  if (toolbar && typeof toolbar === 'object') {
    return {
      download: toolbar.download !== false,
      print: toolbar.print !== false,
      exportHtml: toolbar.exportHtml !== false,
      zoom: toolbar.zoom !== false
    }
  }
  return {
    download: true,
    print: true,
    exportHtml: true,
    zoom: true
  }
})

const visibleExternalToolbar = computed(() => {
  const toolbar = externalToolbar.value
  const availability = viewerAvailability.value
  return {
    download: toolbar.download && availability.download,
    print: toolbar.print && availability.print,
    exportHtml: toolbar.exportHtml && availability.exportHtml,
    zoom: toolbar.zoom && availability.zoom
  }
})

const showExternalToolbar = computed(() => {
  const toolbar = visibleExternalToolbar.value
  return toolbar.download || toolbar.print || toolbar.exportHtml || toolbar.zoom
})

const viewerActionDisabled = computed(() => !file.value && !preview.value)

const viewerSearchSummary = computed(() => {
  if (!viewerSearchQuery.value.trim()) {
    return '0/0'
  }
  const state = viewerSearchState.value
  return state.total ? `${state.currentIndex + 1}/${state.total}` : '0/0'
})

const viewerOptions = computed((): FileViewerOptions => {
  const runtime = runtimeOptions.value
  const options = { ...(runtime as Record<string, unknown>) } as FileViewerOptions
  options.renderers = runtime.renderers ?? allRenderers
  if (!options.locale && !options.i18n?.locale) {
    options.locale = demoLocale.value
  }

  options.archive = {
    workerUrl: `/${DEFAULT_FILE_VIEWER_ARCHIVE_WORKER_PATH}`,
    cache: true,
    ...runtime.archive
  }
  options.spreadsheet = {
    resizableColumns: true,
    resizableRows: true,
    ...runtime.spreadsheet
  }
  options.geo = {
    basemap: 'openfreemap-liberty',
    ...runtime.geo
  }
  options.drawing = { ...runtime.drawing }
  options.toolbar = hidden.value ? runtime.toolbar ?? true : false
  options.watermark = watermarkEnabled.value
    ? {
        text: 'Flyfish Viewer',
        opacity: 0.16,
        rotate: -24,
        color: '#1f7a58',
        ...(
          typeof runtime.watermark === 'object' && runtime.watermark
            ? runtime.watermark
            : {}
        )
      }
    : runtime.watermark

  return options
})

let copyResetTimer: number | undefined

async function copyIntegrationSnippet() {
  try {
    await navigator.clipboard.writeText(integrationSnippet.value)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = integrationSnippet.value
    textarea.setAttribute('readonly', 'true')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  snippetCopied.value = true
  if (copyResetTimer) {
    window.clearTimeout(copyResetTimer)
  }
  copyResetTimer = window.setTimeout(() => {
    snippetCopied.value = false
    copyResetTimer = undefined
  }, 1600)
}

function triggerViewerAction(action: ViewerAction) {
  mobileActionsOpen.value = false
  if (action === 'download') {
    void fileViewerRef.value?.downloadOriginalFile()
    return
  }
  if (action === 'print') {
    void fileViewerRef.value?.printRenderedHtml()
    return
  }
  if (action === 'exportHtml') {
    void fileViewerRef.value?.exportRenderedHtml()
    return
  }
  const nextAction = action === 'zoomIn'
    ? fileViewerRef.value?.zoomIn()
    : action === 'zoomOut'
      ? fileViewerRef.value?.zoomOut()
      : fileViewerRef.value?.resetZoom()
  void nextAction?.then(state => {
    viewerZoomState.value = state
    viewerAvailability.value = fileViewerRef.value?.getOperationAvailability() || viewerAvailability.value
  })
}

async function runViewerSearch() {
  const query = viewerSearchQuery.value.trim()
  if (!query) {
    viewerSearchState.value = await fileViewerRef.value?.clearDocumentSearch() || viewerSearchState.value
    return
  }
  viewerSearchState.value = await fileViewerRef.value?.searchDocument(query) || viewerSearchState.value
}

async function openViewerSearch() {
  mobileActionsOpen.value = false
  viewerSearchOpen.value = true
  await nextTick()
  viewerSearchInputRef.value?.focus()
  viewerSearchInputRef.value?.select()
}

async function closeViewerSearch() {
  viewerSearchOpen.value = false
  viewerSearchState.value = await fileViewerRef.value?.clearDocumentSearch() || viewerSearchState.value
}

function resetViewerSearch() {
  viewerSearchQuery.value = ''
  void closeViewerSearch()
}

async function openMobileControls(mode: 'link' | 'upload' | 'samples' = 'link') {
  input.value = mode !== 'upload'
  mobileControlsOpen.value = true
  mobileActionsOpen.value = false
  if (mode === 'samples') {
    samplePickerOpen.value = true
    expandedSampleGroupIndex.value = activeSampleGroupIndex.value >= 0 ? activeSampleGroupIndex.value : 0
    await nextTick()
    updateSampleMenuGeometry()
    return
  }
  samplePickerOpen.value = false
}

function closeMobileControls() {
  mobileControlsOpen.value = false
  samplePickerOpen.value = false
}

function toggleMobileActions() {
  mobileActionsOpen.value = !mobileActionsOpen.value
  if (mobileActionsOpen.value) {
    mobileControlsOpen.value = false
  }
}

function toggleWatermark() {
  watermarkEnabled.value = !watermarkEnabled.value
  mobileActionsOpen.value = false
}

async function nextViewerSearch() {
  if (!viewerSearchQuery.value.trim()) {
    return
  }
  if (viewerSearchState.value.query !== viewerSearchQuery.value.trim()) {
    await runViewerSearch()
    return
  }
  viewerSearchState.value = await fileViewerRef.value?.nextSearchResult() || viewerSearchState.value
}

async function previousViewerSearch() {
  if (!viewerSearchQuery.value.trim()) {
    return
  }
  if (viewerSearchState.value.query !== viewerSearchQuery.value.trim()) {
    await runViewerSearch()
    return
  }
  viewerSearchState.value = await fileViewerRef.value?.previousSearchResult() || viewerSearchState.value
}

function handleViewerAvailabilityChange(availability: FileViewerOperationAvailability) {
  viewerAvailability.value = availability
  viewerZoomState.value = fileViewerRef.value?.getZoomState() || viewerZoomState.value
}

function handleViewerSearchChange(state: FileViewerSearchState) {
  viewerSearchState.value = state
}

function handleViewerZoomChange(state: FileViewerZoomState) {
  viewerZoomState.value = state
}

listenForFile((body, target, options) => {
  hidden.value = true
  runtimeOptions.value = options || {}
  scenarioPickerOpen.value = false
  samplePickerOpen.value = false
  if (body) {
    filename.value = body.name && decodeURIComponent(body.name) || ''
    file.value = body
  }
  if (target) {
    const normalizedTarget = normalizeDemoUrl(target)
    url.value = normalizedTarget
    preview.value = normalizedTarget
  }
})

function syncDemoDocumentChrome(nextLocale = demoLocale.value) {
  document.documentElement.lang = nextLocale
  document.title = demoCopyMap[nextLocale].pageTitle
}

onMounted(() => {
  syncDemoDocumentChrome()
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
  window.addEventListener('resize', handleWindowResize)
  openUrlPreview(url.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
  window.removeEventListener('resize', handleWindowResize)
  if (copyResetTimer) {
    window.clearTimeout(copyResetTimer)
  }
})

function openUrlPreview(nextUrl = url.value) {
  const normalizedUrl = normalizeDemoUrl(nextUrl)
  input.value = true
  file.value = undefined
  resetViewerSearch()
  url.value = normalizedUrl
  preview.value = normalizedUrl
  scenarioPickerOpen.value = false
  samplePickerOpen.value = false
  mobileControlsOpen.value = false
  mobileActionsOpen.value = false
}

function setDemoLocale(nextLocale: DemoLocale) {
  if (demoLocale.value === nextLocale) {
    return
  }
  const previousDefaultUrl = DEFAULT_DEMO_URL_BY_LOCALE[demoLocale.value]
  demoLocale.value = nextLocale
  window.localStorage.setItem(DEMO_LOCALE_STORAGE_KEY, nextLocale)
  syncDemoDocumentChrome(nextLocale)
  if (!file.value && isSameSampleUrl(url.value || preview.value, previousDefaultUrl)) {
    const nextDefaultUrl = DEFAULT_DEMO_URL_BY_LOCALE[nextLocale]
    url.value = nextDefaultUrl
    openUrlPreview(nextDefaultUrl)
  }
}

function setInputMode(nextMode: boolean) {
  input.value = nextMode
  scenarioPickerOpen.value = false
  samplePickerOpen.value = false
}

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const value = target.files?.item(0)
  if (!value) {
    return
  }
  input.value = false
  scenarioPickerOpen.value = false
  samplePickerOpen.value = false
  mobileControlsOpen.value = false
  mobileActionsOpen.value = false
  resetViewerSearch()
  filename.value = value.name && decodeURIComponent(value.name) || ''
  file.value = value
}

async function toggleScenarioPicker() {
  scenarioPickerOpen.value = !scenarioPickerOpen.value
  if (scenarioPickerOpen.value) {
    samplePickerOpen.value = false
    await nextTick()
  }
}

async function toggleSamplePicker() {
  samplePickerOpen.value = !samplePickerOpen.value
  if (samplePickerOpen.value) {
    scenarioPickerOpen.value = false
    expandedSampleGroupIndex.value = activeSampleGroupIndex.value >= 0 ? activeSampleGroupIndex.value : 0
    await nextTick()
    updateSampleMenuGeometry()
  }
}

async function toggleSampleGroup(index: number) {
  expandedSampleGroupIndex.value = expandedSampleGroupIndex.value === index ? null : index
  await nextTick()
  updateSampleMenuGeometry()
}

function selectPreset(nextUrl: string) {
  const normalizedUrl = normalizeDemoUrl(nextUrl)
  const nextGroupIndex = sampleGroups.value.findIndex(group => group.items.some(item => isSameSampleUrl(item.url, normalizedUrl)))
  url.value = normalizedUrl
  expandedSampleGroupIndex.value = nextGroupIndex >= 0 ? nextGroupIndex : expandedSampleGroupIndex.value
  scenarioPickerOpen.value = false
  samplePickerOpen.value = false
  mobileControlsOpen.value = false
  mobileActionsOpen.value = false
  openUrlPreview(normalizedUrl)
}

function isActivePreset(item: PresetFile) {
  return !file.value && isSameSampleUrl(url.value, item.url)
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!samplePickerOpen.value && !scenarioPickerOpen.value) {
    return
  }
  const target = event.target
  if (
    mobileControlsOpen.value &&
    target instanceof Node &&
    controlPanelRef.value?.contains(target)
  ) {
    return
  }
  if (target instanceof Node && samplePickerRef.value?.contains(target)) {
    return
  }
  if (target instanceof Node && scenarioPickerRef.value?.contains(target)) {
    return
  }
  scenarioPickerOpen.value = false
  samplePickerOpen.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()
  if ((event.metaKey || event.ctrlKey) && !event.altKey && key === 'f') {
    event.preventDefault()
    event.stopPropagation()
    if (viewerSearchOpen.value) {
      void closeViewerSearch()
      return
    }
    void openViewerSearch()
    return
  }

  if (event.key === 'Escape') {
    scenarioPickerOpen.value = false
    samplePickerOpen.value = false
    mobileControlsOpen.value = false
    mobileActionsOpen.value = false
    if (viewerSearchOpen.value) {
      void closeViewerSearch()
    }
  }
}

function handleWindowResize() {
  updateSampleMenuGeometry()
}

function updateSampleMenuGeometry() {
  const picker = samplePickerRef.value
  if (!samplePickerOpen.value || !picker) {
    return
  }
  const rect = picker.getBoundingClientRect()
  if (window.matchMedia('(max-width: 720px)').matches) {
    sampleMenuPlacement.value = 'bottom'
    sampleMenuMaxHeight.value = 'min(48dvh, 430px)'
    return
  }
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight
  const bottomRoom = viewportHeight - rect.bottom - 18
  const topRoom = rect.top - 18
  const openUp = bottomRoom < 300 && topRoom > bottomRoom
  const availableRoom = Math.max(96, openUp ? topRoom : bottomRoom)
  sampleMenuPlacement.value = openUp ? 'top' : 'bottom'
  sampleMenuMaxHeight.value = `${Math.min(520, Math.floor(availableRoom))}px`
}
</script>

<template>
  <div
    class='demo-shell'
    :class="{
      hidden,
      'mobile-controls-open': mobileControlsOpen,
      'mobile-actions-open': mobileActionsOpen,
      'sample-picker-open': samplePickerOpen
    }"
  >
    <main class='workspace'>
      <div v-if='!hidden' class='layout-shell'>
        <aside ref='controlPanelRef' class='control-panel'>
          <div class='brand-card'>
            <span class='brand-orbit' />
            <div class='brand-main'>
              <span class='brand-mark'>
                <img :src='brandLogo' alt='File Viewer' />
              </span>
              <div class='brand-copy'>
                <span>FlyFish</span>
                <h1>File Viewer</h1>
              </div>
            </div>
            <div class='brand-meta-row'>
              <span class='brand-pill'>{{ demoCopy.pureWeb }}</span>
              <div class='locale-switch' :aria-label='demoCopy.language'>
                <button
                  type='button'
                  :class='{ active: demoLocale === "zh-CN" }'
                  @click='setDemoLocale("zh-CN")'
                >
                  中
                </button>
                <button
                  type='button'
                  :class='{ active: demoLocale === "en-US" }'
                  @click='setDemoLocale("en-US")'
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          <div class='current-card'>
            <span class='current-badge'>{{ previewType }}</span>
            <div class='current-copy'>
              <span>{{ displayMode }}</span>
              <strong>{{ displayName }}</strong>
            </div>
          </div>

          <button type='button' class='mobile-sheet-close' :aria-label='demoCopy.closePanel' @click='closeMobileControls'>
            <X :size='18' :stroke-width='2.5' />
          </button>

          <div class='panel-body'>
            <div class='mode-switch'>
              <button
                type='button'
                class='mode-button'
                :class='{ active: input }'
                @click='setInputMode(true)'
              >
                {{ demoCopy.link }}
              </button>
              <button
                type='button'
                class='mode-button'
                :class='{ active: !input }'
                @click='setInputMode(false)'
              >
                {{ demoCopy.upload }}
              </button>
            </div>

            <template v-if='input'>
              <div ref='scenarioPickerRef' class='scenario-picker' :class='{ open: scenarioPickerOpen }'>
                <button
                  type='button'
                  class='scenario-trigger'
                  aria-controls='scenario-menu'
                  :aria-expanded="scenarioPickerOpen ? 'true' : 'false'"
                  @click='toggleScenarioPicker'
                >
                  <span class='scenario-trigger-icon'>
                    <FileSearch :size='17' :stroke-width='2.4' />
                  </span>
                  <span class='scenario-trigger-copy'>
                    <strong>{{ demoCopy.quickSamples }}</strong>
                    <em>{{ demoCopy.quickSamplesHint }}</em>
                  </span>
                  <ChevronUp v-if='scenarioPickerOpen' :size='16' :stroke-width='2.6' />
                  <ChevronDown v-else :size='16' :stroke-width='2.6' />
                </button>

                <div
                  v-if='scenarioPickerOpen'
                  id='scenario-menu'
                  class='scenario-popover'
                  role='menu'
                  aria-label='Demo scenarios'
                >
                  <button
                    v-for='scenario in scenarioPicks'
                    :key='scenario.url'
                    type='button'
                    class='scenario-card'
                    :class='{ active: !file && isSameSampleUrl(url, scenario.url) }'
                    role='menuitem'
                    @click='selectPreset(scenario.url)'
                  >
                    <span class='sample-file-icon scenario-icon' :data-family='scenario.family'>
                      <span>{{ getFileIconMeta(scenario.url).icon }}</span>
                    </span>
                    <span>
                      <strong>{{ scenario.title }}</strong>
                      <em>{{ scenario.description }}</em>
                    </span>
                  </button>
                </div>
              </div>

              <div ref='samplePickerRef' class='sample-picker' :class='{ open: samplePickerOpen }'>
                <button
                  type='button'
                  class='sample-trigger'
                  aria-controls='sample-menu'
                  :aria-expanded="samplePickerOpen ? 'true' : 'false'"
                  @click='toggleSamplePicker'
                >
                  <span class='sample-file-icon' :data-family='activeIconMeta.family'>
                    <span>{{ activeIconMeta.icon }}</span>
                  </span>
                  <span class='sample-trigger-copy'>
                    <span>{{ demoCopy.sampleFile }}</span>
                    <strong>{{ activePreset?.name || fileNameOf(url) }}</strong>
                    <em>{{ activePreset ? fileNameOf(activePreset.url) : url }}</em>
                  </span>
                  <span class='sample-trigger-action'>{{ samplePickerOpen ? demoCopy.collapse : demoCopy.open }}</span>
                </button>

                <div
                  v-if='samplePickerOpen'
                  id='sample-menu'
                  class='sample-menu'
                  :class='`sample-menu--${sampleMenuPlacement}`'
                  :style='{ maxHeight: sampleMenuMaxHeight }'
                >
                  <section
                    v-for='(group, groupIndex) in sampleGroups'
                    :key='group.title'
                    class='sample-group'
                    :class="{ 'sample-group--open': expandedSampleGroupIndex === groupIndex }"
                    :data-family='group.family'
                  >
                    <button
                      type='button'
                      class='sample-group-header'
                      :aria-expanded="expandedSampleGroupIndex === groupIndex ? 'true' : 'false'"
                      :aria-controls='`sample-group-panel-${groupIndex}`'
                      @click='toggleSampleGroup(groupIndex)'
                    >
                      <span class='sample-group-title'>{{ group.title }}</span>
                      <em>{{ group.description }}</em>
                      <strong>{{ group.items.length }}</strong>
                      <i aria-hidden='true' />
                    </button>
                    <div
                      v-if='expandedSampleGroupIndex === groupIndex'
                      :id='`sample-group-panel-${groupIndex}`'
                      class='sample-group-grid'
                    >
                      <button
                        v-for='item in group.items'
                        :key='item.url'
                        type='button'
                        class='sample-card'
                        :class='{ active: isActivePreset(item) }'
                        @click='selectPreset(item.url)'
                      >
                        <span class='sample-file-icon' :data-family='getFileIconMeta(item.url).family'>
                          <span>{{ getFileIconMeta(item.url).icon }}</span>
                        </span>
                        <span class='sample-card-copy'>
                          <strong>{{ item.name }}</strong>
                          <span>{{ fileNameOf(item.url) }}</span>
                        </span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>

              <div class='field-group'>
                <label class='field-label'>{{ demoCopy.address }}</label>
                <input
                  v-model='url'
                  class='compact-field'
                  type='text'
                  :placeholder='demoCopy.addressPlaceholder'
                  @keyup.enter='openUrlPreview()'
                />
              </div>

              <button type='button' class='primary-button' @click='openUrlPreview()'>
                {{ demoCopy.preview }}
              </button>

              <div class='snippet-card'>
                <div class='snippet-heading'>
                  <span>{{ demoCopy.integrationSnippet }}</span>
                  <button
                    type='button'
                    class='snippet-copy'
                    :class='{ copied: snippetCopied }'
                    :title='snippetCopied ? demoCopy.copiedSnippet : demoCopy.copySnippet'
                    @click='copyIntegrationSnippet'
                  >
                    <Check v-if='snippetCopied' :size='14' :stroke-width='2.5' />
                    <Copy v-else :size='14' :stroke-width='2.5' />
                    <strong>{{ snippetCopied ? demoCopy.copiedSnippet : demoCopy.copySnippet }}</strong>
                  </button>
                </div>
                <pre><code>{{ integrationSnippet }}</code></pre>
              </div>
            </template>

            <template v-else>
              <label class='upload-card'>
                <input type='file' :accept='uploadAccept' @change='handleChange' />
                <span class='upload-icon'>+</span>
                <span class='upload-title'>{{ demoCopy.chooseFile }}</span>
                <strong>{{ filename || demoCopy.openLocal }}</strong>
              </label>
            </template>
          </div>
        </aside>

        <section class='viewer-panel'>
          <div class='viewer-toolbar'>
            <div class='viewer-copy'>
              <span class='viewer-status' />
              <strong>{{ displayName }}</strong>
              <span class='viewer-type'>{{ previewType }}</span>
            </div>
            <div class='viewer-path'>{{ displayPath }}</div>
            <div class='viewer-tools'>
              <div v-if='showExternalToolbar' class='viewer-action-group' :aria-label='demoCopy.previewActions'>
                <template v-if='visibleExternalToolbar.zoom'>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--icon'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomOut'
                    :title='demoCopy.zoomOut'
                    :aria-label='demoCopy.zoomOut'
                    @click='triggerViewerAction("zoomOut")'
                  >
                    <ZoomOut :size='15' :stroke-width='2.4' />
                  </button>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--meter'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
                    :title='demoCopy.resetZoom'
                    @click='triggerViewerAction("resetZoom")'
                  >
                    {{ viewerZoomState.label }}
                  </button>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--icon'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomIn'
                    :title='demoCopy.zoomIn'
                    :aria-label='demoCopy.zoomIn'
                    @click='triggerViewerAction("zoomIn")'
                  >
                    <ZoomIn :size='15' :stroke-width='2.4' />
                  </button>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--icon'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
                    :title='demoCopy.resetZoom'
                    :aria-label='demoCopy.resetZoom'
                    @click='triggerViewerAction("resetZoom")'
                  >
                    <RotateCcw :size='14' :stroke-width='2.4' />
                  </button>
                </template>
                <button
                  v-if='visibleExternalToolbar.download'
                  type='button'
                  class='viewer-tool-button'
                  :disabled='viewerActionDisabled'
                  :title='demoCopy.downloadTitle'
                  @click='triggerViewerAction("download")'
                >
                  {{ demoCopy.download }}
                </button>
                <button
                  v-if='visibleExternalToolbar.print'
                  type='button'
                  class='viewer-tool-button'
                  :disabled='viewerActionDisabled'
                  :title='demoCopy.printTitle'
                  @click='triggerViewerAction("print")'
                >
                  {{ demoCopy.print }}
                </button>
                <button
                  v-if='visibleExternalToolbar.exportHtml'
                  type='button'
                  class='viewer-tool-button'
                  :disabled='viewerActionDisabled'
                  :title='demoCopy.exportHtmlTitle'
                  @click='triggerViewerAction("exportHtml")'
                >
                  HTML
                </button>
              </div>
              <button
                type='button'
                class='viewer-tool-button'
                :class='{ active: watermarkEnabled }'
                :title='demoCopy.watermarkTitle'
                @click='toggleWatermark'
              >
                {{ demoCopy.watermark }}
              </button>
            </div>
          </div>

          <div v-if='viewerSearchOpen' class='viewer-search-popover' role='search' :aria-label='demoCopy.searchDocument'>
            <input
              ref='viewerSearchInputRef'
              v-model.trim='viewerSearchQuery'
              type='search'
              :placeholder='demoCopy.searchPlaceholder'
              @keyup.enter='runViewerSearch'
            />
            <span class='viewer-search-summary'>{{ viewerSearchSummary }}</span>
            <button type='button' :title='demoCopy.previousResult' :aria-label='demoCopy.previousResult' @click='previousViewerSearch'>
              <ChevronUp class='viewer-search-icon' aria-hidden='true' />
            </button>
            <button type='button' :title='demoCopy.nextResult' :aria-label='demoCopy.nextResult' @click='nextViewerSearch'>
              <ChevronDown class='viewer-search-icon' aria-hidden='true' />
            </button>
            <button type='button' class='viewer-search-close' :title='demoCopy.closeSearch' @click='closeViewerSearch'>
              <X class='viewer-search-icon' aria-hidden='true' />
            </button>
          </div>

          <div class='viewport'>
            <file-viewer
              ref='fileViewerRef'
              :file='file'
              :url='preview'
              :options='viewerOptions'
              @operation-availability-change='handleViewerAvailabilityChange'
              @search-change='handleViewerSearchChange'
              @zoom-change='handleViewerZoomChange'
            />
          </div>
        </section>

        <button
          v-if='mobileControlsOpen'
          type='button'
          class='mobile-control-backdrop'
          :aria-label='demoCopy.closeMobileControls'
          @click='closeMobileControls'
        />

        <nav class='mobile-action-dock' :aria-label='demoCopy.previewActions'>
          <div v-if='visibleExternalToolbar.zoom' class='mobile-zoom-strip'>
            <button
              type='button'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomOut'
              :title='demoCopy.zoomOut'
              :aria-label='demoCopy.zoomOut'
              @click='triggerViewerAction("zoomOut")'
            >
              <ZoomOut :size='18' :stroke-width='2.4' />
            </button>
            <button
              type='button'
              class='mobile-zoom-meter'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
              :title='demoCopy.resetZoom'
              @click='triggerViewerAction("resetZoom")'
            >
              {{ viewerZoomState.label }}
            </button>
            <button
              type='button'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomIn'
              :title='demoCopy.zoomIn'
              :aria-label='demoCopy.zoomIn'
              @click='triggerViewerAction("zoomIn")'
            >
              <ZoomIn :size='18' :stroke-width='2.4' />
            </button>
          </div>

          <div v-if='mobileActionsOpen' class='mobile-action-panel'>
            <button
              v-if='visibleExternalToolbar.download'
              type='button'
              :disabled='viewerActionDisabled'
              @click='triggerViewerAction("download")'
            >
              {{ demoCopy.download }}
            </button>
            <button
              v-if='visibleExternalToolbar.print'
              type='button'
              :disabled='viewerActionDisabled'
              @click='triggerViewerAction("print")'
            >
              {{ demoCopy.print }}
            </button>
            <button
              v-if='visibleExternalToolbar.exportHtml'
              type='button'
              :disabled='viewerActionDisabled'
              @click='triggerViewerAction("exportHtml")'
            >
              HTML
            </button>
            <button type='button' :class='{ active: watermarkEnabled }' @click='toggleWatermark'>
              {{ demoCopy.watermark }}
            </button>
            <button
              v-if='visibleExternalToolbar.zoom'
              type='button'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
              @click='triggerViewerAction("resetZoom")'
            >
              {{ demoCopy.reset }}
            </button>
          </div>

          <div class='mobile-quick-row'>
            <button type='button' class='mobile-fab' :aria-label='demoCopy.openLinkSettings' @click='openMobileControls("link")'>
              <Link2 :size='18' :stroke-width='2.4' />
              <span>{{ demoCopy.link }}</span>
            </button>
            <button type='button' class='mobile-fab' :aria-label='demoCopy.openSamples' @click='openMobileControls("samples")'>
              <FileSearch :size='18' :stroke-width='2.4' />
              <span>{{ demoCopy.samples }}</span>
            </button>
            <button type='button' class='mobile-fab' :aria-label='demoCopy.uploadLocalFile' @click='openMobileControls("upload")'>
              <Upload :size='18' :stroke-width='2.4' />
              <span>{{ demoCopy.upload }}</span>
            </button>
            <button type='button' class='mobile-fab' :aria-label='demoCopy.searchCurrentDocument' @click='openViewerSearch'>
              <Search :size='18' :stroke-width='2.4' />
              <span>{{ demoCopy.search }}</span>
            </button>
            <button
              type='button'
              class='mobile-fab mobile-fab--primary'
              :class='{ active: mobileActionsOpen }'
              :aria-label='demoCopy.openMoreActions'
              :aria-expanded="mobileActionsOpen ? 'true' : 'false'"
              @click='toggleMobileActions'
            >
              <MoreHorizontal :size='20' :stroke-width='2.6' />
              <span>{{ demoCopy.more }}</span>
            </button>
          </div>
        </nav>
      </div>

      <section v-else class='viewer-panel standalone'>
        <div v-if='viewerSearchOpen' class='viewer-search-popover viewer-search-popover--standalone' role='search' :aria-label='demoCopy.searchDocument'>
          <input
            ref='viewerSearchInputRef'
            v-model.trim='viewerSearchQuery'
            type='search'
            :placeholder='demoCopy.searchPlaceholder'
            @keyup.enter='runViewerSearch'
          />
          <span class='viewer-search-summary'>{{ viewerSearchSummary }}</span>
          <button type='button' :title='demoCopy.previousResult' :aria-label='demoCopy.previousResult' @click='previousViewerSearch'>
            <ChevronUp class='viewer-search-icon' aria-hidden='true' />
          </button>
          <button type='button' :title='demoCopy.nextResult' :aria-label='demoCopy.nextResult' @click='nextViewerSearch'>
            <ChevronDown class='viewer-search-icon' aria-hidden='true' />
          </button>
          <button type='button' class='viewer-search-close' :title='demoCopy.closeSearch' @click='closeViewerSearch'>
            <X class='viewer-search-icon' aria-hidden='true' />
          </button>
        </div>
        <div class='viewport'>
          <file-viewer
            ref='fileViewerRef'
            :file='file'
            :url='preview'
            :options='viewerOptions'
            @operation-availability-change='handleViewerAvailabilityChange'
            @search-change='handleViewerSearchChange'
            @zoom-change='handleViewerZoomChange'
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.demo-shell {
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 12%, rgba(37, 171, 111, 0.22), transparent 28%),
    radial-gradient(circle at 86% 0%, rgba(43, 126, 238, 0.16), transparent 24%),
    linear-gradient(135deg, #f6f9f5 0%, #eef4f0 46%, #f8faf6 100%);
  color: #142335;
}

.workspace {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 16px;
}

.layout-shell {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(276px, 320px) minmax(0, 1fr);
  gap: 16px;
}

.control-panel,
.viewer-panel {
  min-height: 0;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 60px rgba(18, 35, 50, 0.1);
  backdrop-filter: blur(22px);
}

.control-panel {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: visible;
  padding: 12px;
  gap: 12px;
}

.brand-card {
  position: relative;
  flex-shrink: 0;
  min-height: 144px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(19, 42, 57, 0.94), rgba(17, 91, 65, 0.9)),
    radial-gradient(circle at top right, rgba(94, 255, 182, 0.38), transparent 42%);
  color: #ffffff;
  box-shadow: 0 18px 36px rgba(14, 80, 59, 0.18);
}

.brand-orbit {
  position: absolute;
  width: 138px;
  height: 138px;
  right: -52px;
  top: -42px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.brand-orbit::before {
  content: '';
  position: absolute;
  inset: 28px;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.brand-main {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: inline-flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
}

.brand-mark img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.brand-copy span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.brand-copy h1 {
  margin: 0;
  font-size: 27px;
  line-height: 1;
  letter-spacing: 0;
}

.brand-pill {
  position: relative;
  align-self: flex-start;
  display: inline-flex;
  height: 28px;
  align-items: center;
  justify-content: center;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.82);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.brand-meta-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.locale-switch {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.locale-switch button {
  min-width: 34px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.locale-switch button.active {
  background: rgba(255, 255, 255, 0.92);
  color: #0f4f3e;
  box-shadow: 0 8px 20px rgba(7, 28, 23, 0.18);
}

.current-card {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1px rgba(20, 35, 53, 0.06);
}

.current-badge {
  display: inline-flex;
  width: 50px;
  height: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background: rgba(33, 163, 102, 0.12);
  color: #16804f;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.current-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.current-copy span {
  color: #7c8b9a;
  font-size: 12px;
}

.current-copy strong {
  color: #142335;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mode-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 4px;
  border-radius: 18px;
  background: rgba(20, 35, 53, 0.06);
}

.mode-button,
.compact-field,
.primary-button,
.scenario-trigger,
.sample-trigger,
.sample-card,
.scenario-card {
  font: inherit;
}

.mode-button,
.primary-button,
.scenario-trigger,
.sample-trigger,
.sample-card,
.scenario-card {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.mode-button:hover,
.primary-button:hover,
.scenario-trigger:hover,
.sample-trigger:hover,
.sample-card:hover,
.scenario-card:hover {
  transform: translateY(-1px);
}

.mode-button {
  min-height: 40px;
  border-radius: 14px;
  background: transparent;
  color: #718193;
  font-weight: 700;
}

.mode-button.active {
  background: #ffffff;
  color: #142335;
  box-shadow: 0 8px 18px rgba(18, 35, 55, 0.08);
}

.panel-body {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px 4px 4px 2px;
}

.sample-picker-open .panel-body {
  overflow: visible;
}

.scenario-picker {
  position: relative;
  z-index: 5;
}

.scenario-trigger {
  width: 100%;
  min-height: 46px;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: 16px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(255, 255, 255, 0.78);
  color: #142335;
  text-align: left;
}

.scenario-picker.open .scenario-trigger,
.scenario-trigger:hover {
  border-color: rgba(33, 163, 102, 0.24);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 24px rgba(18, 35, 55, 0.08);
}

.scenario-trigger-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(33, 163, 102, 0.12);
  color: #16804f;
}

.scenario-trigger-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.scenario-trigger-copy strong {
  color: #142335;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.1;
}

.scenario-trigger-copy em {
  color: #718193;
  font-size: 11px;
  font-style: normal;
}

.scenario-trigger-copy strong,
.scenario-trigger-copy em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scenario-popover {
  position: absolute;
  z-index: 28;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  max-height: min(46vh, 360px);
  padding: 10px;
  overflow: auto;
  border: 1px solid rgba(20, 35, 53, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 22px 50px rgba(18, 35, 55, 0.16),
    inset 0 0 0 1px rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(16px);
}

.scenario-card {
  min-width: 0;
  min-height: 70px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 14px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(255, 255, 255, 0.74);
  color: #142335;
  text-align: left;
}

.scenario-card:hover,
.scenario-card.active {
  border-color: rgba(33, 163, 102, 0.26);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 22px rgba(18, 35, 55, 0.08);
}

.scenario-card.active {
  background: rgba(33, 163, 102, 0.11);
}

.scenario-card > span:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.scenario-card strong,
.scenario-card em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scenario-card strong {
  color: #142335;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.15;
}

.scenario-card em {
  color: #718193;
  font-size: 11px;
  font-style: normal;
}

.scenario-icon {
  width: 32px;
  height: 40px;
}

.snippet-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.44);
}

.snippet-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.snippet-heading > span {
  color: #526174;
  font-size: 12px;
  font-weight: 900;
}

.snippet-copy {
  height: 30px;
  min-width: 82px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  border-radius: 999px;
  background: rgba(33, 163, 102, 0.12);
  color: #16804f;
  font: inherit;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.snippet-copy.copied {
  background: rgba(43, 126, 238, 0.12);
  color: #2668c9;
}

.snippet-copy strong {
  font: inherit;
  white-space: nowrap;
}

.snippet-card pre {
  max-height: 118px;
  margin: 0;
  overflow: auto;
  border-radius: 11px;
  background: #112332;
  color: #d6f4e5;
  font-size: 11px;
  line-height: 1.48;
}

.snippet-card code {
  display: block;
  min-width: max-content;
  padding: 10px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-label {
  color: #718193;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.compact-field {
  min-height: 46px;
  padding: 0 14px;
  border-radius: 17px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(255, 255, 255, 0.86);
  color: #142335;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.compact-field:focus {
  border-color: rgba(33, 163, 102, 0.36);
  box-shadow: 0 0 0 4px rgba(33, 163, 102, 0.1);
}

.sample-picker {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sample-trigger {
  width: 100%;
  flex-shrink: 0;
  min-height: 70px;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 11px;
  border-radius: 17px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(255, 255, 255, 0.88);
  color: #142335;
  text-align: left;
}

.sample-picker.open .sample-trigger,
.sample-trigger:hover {
  border-color: rgba(43, 126, 238, 0.24);
  box-shadow: 0 14px 28px rgba(18, 35, 55, 0.08);
}

.sample-trigger-copy,
.sample-card-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.sample-trigger-copy {
  gap: 4px;
}

.sample-trigger-copy span {
  color: #718193;
  font-size: 12px;
  font-weight: 700;
}

.sample-trigger-copy strong {
  color: #142335;
  font-size: 15px;
  line-height: 1.1;
}

.sample-trigger-copy em {
  color: #718193;
  font-size: 12px;
  font-style: normal;
}

.sample-trigger-copy strong,
.sample-trigger-copy em,
.sample-card-copy strong,
.sample-card-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sample-trigger-action {
  min-width: 42px;
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(43, 126, 238, 0.1);
  color: #2668c9;
  font-size: 12px;
  font-weight: 800;
}

.sample-menu {
  position: absolute;
  z-index: 30;
  right: 0;
  left: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 11px;
  border-radius: 16px;
  border: 1px solid rgba(20, 35, 53, 0.1);
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 22px 56px rgba(18, 35, 55, 0.18),
    inset 0 0 0 1px rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
}

.sample-menu--bottom {
  top: calc(100% + 10px);
}

.sample-menu--top {
  bottom: calc(100% + 10px);
}

.sample-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 6px;
  border-radius: 13px;
  background: rgba(247, 250, 252, 0.76);
  box-shadow: inset 0 0 0 1px rgba(20, 35, 53, 0.05);
}

.sample-group--open {
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    inset 0 0 0 1px rgba(33, 163, 102, 0.16),
    0 8px 20px rgba(20, 35, 53, 0.06);
}

.sample-group-header {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto 16px;
  align-items: center;
  gap: 7px;
  padding: 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.sample-group-header:hover {
  background: rgba(33, 163, 102, 0.08);
}

.sample-group-header .sample-group-title {
  color: #142335;
  font-size: 12px;
  font-weight: 900;
}

.sample-group-header em {
  min-width: 0;
  color: #718193;
  font-size: 11px;
  font-style: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sample-group-header strong {
  min-width: 24px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(20, 35, 53, 0.07);
  color: #526174;
  font-size: 11px;
  font-weight: 900;
}

.sample-group-header i {
  width: 8px;
  height: 8px;
  justify-self: center;
  border-right: 2px solid #718193;
  border-bottom: 2px solid #718193;
  transform: rotate(45deg);
  transition: transform 0.18s ease;
}

.sample-group--open .sample-group-header i {
  transform: rotate(-135deg);
}

.sample-group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
}

.sample-card {
  min-width: 0;
  min-height: 70px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  background: rgba(247, 250, 252, 0.8);
  color: #142335;
  text-align: left;
}

.sample-card.active {
  border-color: rgba(33, 163, 102, 0.34);
  background: rgba(33, 163, 102, 0.1);
  box-shadow: 0 8px 20px rgba(33, 163, 102, 0.12);
}

.sample-card-copy {
  gap: 3px;
}

.sample-card-copy strong {
  color: #142335;
  font-size: 13px;
  line-height: 1.1;
}

.sample-card-copy span {
  color: #718193;
  font-size: 11px;
}

.sample-file-icon {
  position: relative;
  width: 36px;
  height: 44px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 4px 7px;
  border-radius: 7px;
  background: linear-gradient(145deg, #d9e4f2, #f8fbff);
  color: #2f4157;
  box-shadow: inset 0 0 0 1px rgba(20, 35, 53, 0.1);
}

.sample-trigger .sample-file-icon {
  width: 42px;
  height: 50px;
}

.sample-file-icon::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 13px;
  height: 13px;
  border-radius: 0 7px 0 6px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: -1px 1px 0 rgba(20, 35, 53, 0.08);
}

.sample-file-icon span {
  position: relative;
  z-index: 1;
  max-width: 100%;
  color: currentColor;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.sample-file-icon[data-family='word'] {
  background: linear-gradient(145deg, #d9e9ff, #ffffff);
  color: #245bb7;
}

.sample-file-icon[data-family='sheet'] {
  background: linear-gradient(145deg, #daf7e8, #ffffff);
  color: #16804f;
}

.sample-file-icon[data-family='slide'] {
  background: linear-gradient(145deg, #ffe8d2, #ffffff);
  color: #bf5b14;
}

.sample-file-icon[data-family='pdf'] {
  background: linear-gradient(145deg, #ffe1e1, #ffffff);
  color: #bf2a2a;
}

.sample-file-icon[data-family='layout'] {
  background: linear-gradient(145deg, #e8e1ff, #ffffff);
  color: #6940c6;
}

.sample-file-icon[data-family='cad'] {
  background: linear-gradient(145deg, #d8f3f5, #ffffff);
  color: #0e7490;
}

.sample-file-icon[data-family='model'] {
  background: linear-gradient(145deg, #e2f4d7, #ffffff);
  color: #3f7d20;
}

.sample-file-icon[data-family='drawing'] {
  background: linear-gradient(145deg, #ede9fe, #ffffff);
  color: #6d28d9;
}

.sample-file-icon[data-family='ebook'] {
  background: linear-gradient(145deg, #f1e7ff, #ffffff);
  color: #7c3aed;
}

.sample-file-icon[data-family='archive'] {
  background: linear-gradient(145deg, #ffeec7, #ffffff);
  color: #a15c07;
}

.sample-file-icon[data-family='email'] {
  background: linear-gradient(145deg, #dcecff, #ffffff);
  color: #2563eb;
}

.sample-file-icon[data-family='eda'] {
  background: linear-gradient(145deg, #dff7fb, #ffffff);
  color: #0d7884;
}

.sample-file-icon[data-family='code'] {
  background: linear-gradient(145deg, #dde7f1, #ffffff);
  color: #334155;
}

.sample-file-icon[data-family='text'] {
  background: linear-gradient(145deg, #eef1d7, #ffffff);
  color: #6b7a1f;
}

.sample-file-icon[data-family='image'] {
  background: linear-gradient(145deg, #ffe0f1, #ffffff);
  color: #be2776;
}

.sample-file-icon[data-family='audio'] {
  background: linear-gradient(145deg, #d7f8f2, #ffffff);
  color: #0f766e;
}

.sample-file-icon[data-family='video'] {
  background: linear-gradient(145deg, #e0e7ff, #ffffff);
  color: #4338ca;
}

.sample-file-icon[data-family='data'] {
  background: linear-gradient(145deg, #ede9fe, #ffffff);
  color: #5b21b6;
}

.primary-button {
  min-height: 48px;
  border-radius: 17px;
  background: linear-gradient(135deg, #168757 0%, #2bc87e 100%);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 16px 28px rgba(33, 163, 102, 0.2);
}

.upload-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 9px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(33, 163, 102, 0.2);
  background:
    radial-gradient(circle at top right, rgba(33, 163, 102, 0.14), transparent 42%),
    rgba(255, 255, 255, 0.86);
  overflow: hidden;
  cursor: pointer;
}

.upload-card input[type='file'] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(33, 163, 102, 0.12);
  color: #16804f;
  font-size: 24px;
  font-weight: 500;
}

.upload-title {
  color: #16804f;
  font-size: 13px;
  font-weight: 700;
}

.upload-card strong {
  max-width: 100%;
  color: #142335;
  font-size: 15px;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.viewer-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(20, 35, 53, 0.06);
}

.viewer-copy {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.viewer-status {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #21a366;
  box-shadow: 0 0 0 5px rgba(33, 163, 102, 0.12);
}

.viewer-copy strong {
  min-width: 0;
  max-width: 44vw;
  color: #142335;
  font-size: 15px;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-type {
  flex-shrink: 0;
  padding: 5px 8px;
  border-radius: 999px;
  background: rgba(20, 35, 53, 0.06);
  color: #718193;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}

.viewer-path {
  min-width: 0;
  color: #718193;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.viewer-tools {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
}

.viewer-search-popover {
  position: absolute;
  z-index: 40;
  top: 76px;
  right: 24px;
  display: inline-grid;
  grid-template-columns: minmax(180px, 260px) auto auto auto auto;
  align-items: center;
  gap: 6px;
  max-width: calc(100% - 48px);
  padding: 6px;
  border: 1px solid rgba(20, 35, 53, 0.09);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 42px rgba(18, 35, 50, 0.18);
  backdrop-filter: blur(18px);
}

.viewer-search-popover--standalone {
  top: 18px;
}

.viewer-search-popover input,
.viewer-search-popover button,
.viewer-search-summary {
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #526174;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
}

.viewer-search-popover input {
  min-width: 0;
  padding: 0 12px;
  outline: none;
  background: rgba(20, 35, 53, 0.04);
}

.viewer-search-popover input:focus {
  background: rgba(33, 163, 102, 0.1);
  color: #16804f;
}

.viewer-search-summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  color: #718193;
}

.viewer-search-popover button {
  width: 34px;
  min-width: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.viewer-search-popover button:hover {
  background: rgba(33, 163, 102, 0.1);
  color: #16804f;
}

.viewer-search-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.4;
}

.viewer-action-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid rgba(20, 35, 53, 0.07);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.66);
}

.viewer-tool-button {
  height: 32px;
  flex-shrink: 0;
  padding: 0 12px;
  border: 1px solid rgba(20, 35, 53, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  color: #526174;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.viewer-action-group .viewer-tool-button {
  min-width: 48px;
  border-color: transparent;
  background: transparent;
}

.viewer-action-group .viewer-tool-button--icon {
  width: 32px;
  min-width: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.viewer-action-group .viewer-tool-button--meter {
  min-width: 52px;
  padding: 0 8px;
  color: #23465e;
}

.viewer-tool-button:disabled {
  color: #a9b4c0;
  cursor: not-allowed;
  opacity: 0.68;
}

.viewer-tool-button.active {
  border-color: rgba(33, 163, 102, 0.28);
  background: rgba(33, 163, 102, 0.12);
  color: #16804f;
}

.viewport {
  flex: 1;
  min-height: 0;
  padding: 10px;
}

.viewport :deep(.file-viewer) {
  height: 100%;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(20, 35, 53, 0.06);
}

.standalone {
  height: 100%;
}

.hidden .workspace {
  height: 100%;
  padding: 0;
}

.hidden .viewer-panel {
  height: 100%;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: #ffffff;
}

.hidden .viewport {
  padding: 0;
}

.hidden .viewport :deep(.file-viewer) {
  border-radius: 0;
  box-shadow: none;
}

.mobile-control-backdrop,
.mobile-action-dock,
.mobile-sheet-close {
  display: none;
}

@media (prefers-color-scheme: dark) {
  .demo-shell {
    background:
      linear-gradient(135deg, #0f171d 0%, #14231f 52%, #111923 100%);
    color: #e7f1f5;
  }

  .control-panel,
  .viewer-panel {
    border-color: rgba(177, 202, 195, 0.14);
    background: rgba(16, 25, 30, 0.82);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.36);
  }

  .brand-card {
    background:
      linear-gradient(135deg, rgba(22, 52, 55, 0.96), rgba(17, 91, 65, 0.9));
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
  }

  .current-card,
  .scenario-trigger,
  .sample-trigger,
  .upload-card,
  .snippet-card,
  .scenario-card {
    background: rgba(22, 32, 39, 0.9);
    box-shadow: inset 0 0 0 1px rgba(167, 185, 198, 0.12);
  }

  .current-badge,
  .upload-icon {
    background: rgba(45, 212, 154, 0.14);
    color: #61e5b4;
  }

  .current-copy span,
  .field-label,
  .snippet-heading > span,
  .scenario-trigger-copy em,
  .scenario-card em,
  .sample-trigger-copy span,
  .sample-trigger-copy em,
  .sample-card-copy span,
  .sample-group-header em,
  .viewer-path,
  .viewer-type {
    color: #9eb0bf;
  }

  .current-copy strong,
  .scenario-trigger-copy strong,
  .scenario-card strong,
  .sample-trigger-copy strong,
  .sample-card-copy strong,
  .sample-group-header .sample-group-title,
  .upload-card strong,
  .viewer-copy strong {
    color: #eff7fb;
  }

  .mode-switch {
    background: rgba(167, 185, 198, 0.12);
  }

  .mode-button {
    color: #9eb0bf;
  }

  .mode-button.active {
    background: rgba(239, 247, 251, 0.12);
    color: #f4fbff;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.26);
  }

  .compact-field {
    border-color: rgba(167, 185, 198, 0.14);
    background: rgba(9, 15, 20, 0.72);
    color: #eff7fb;
  }

  .compact-field::placeholder {
    color: #718493;
  }

  .compact-field:focus {
    border-color: rgba(45, 212, 154, 0.4);
    box-shadow: 0 0 0 4px rgba(45, 212, 154, 0.12);
  }

  .scenario-picker.open .scenario-trigger,
  .scenario-trigger:hover {
    border-color: rgba(45, 212, 154, 0.26);
    background: rgba(22, 32, 39, 0.96);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.28);
  }

  .scenario-trigger-icon {
    background: rgba(45, 212, 154, 0.14);
    color: #61e5b4;
  }

  .scenario-popover {
    border-color: rgba(167, 185, 198, 0.16);
    background: rgba(14, 22, 28, 0.96);
    box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.42),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .sample-picker.open .sample-trigger,
  .sample-trigger:hover {
    border-color: rgba(96, 165, 250, 0.26);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.28);
  }

  .sample-trigger-action {
    background: rgba(96, 165, 250, 0.16);
    color: #9cc7ff;
  }

  .sample-menu {
    border-color: rgba(167, 185, 198, 0.16);
    background: rgba(14, 22, 28, 0.96);
    box-shadow:
      0 24px 64px rgba(0, 0, 0, 0.42),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  }

  .sample-group {
    background: rgba(22, 32, 39, 0.72);
    box-shadow: inset 0 0 0 1px rgba(167, 185, 198, 0.1);
  }

  .sample-group--open {
    background: rgba(24, 38, 42, 0.9);
    box-shadow:
      inset 0 0 0 1px rgba(45, 212, 154, 0.24),
      0 10px 24px rgba(0, 0, 0, 0.22);
  }

  .sample-group-header:hover {
    background: rgba(45, 212, 154, 0.1);
  }

  .sample-group-header strong {
    background: rgba(167, 185, 198, 0.12);
    color: #b8c7d5;
  }

  .sample-group-header i {
    border-color: #9eb0bf;
  }

  .sample-card {
    border-color: rgba(167, 185, 198, 0.14);
    background: rgba(13, 21, 27, 0.7);
    color: #eff7fb;
  }

  .sample-card.active {
    border-color: rgba(45, 212, 154, 0.42);
    background: rgba(45, 212, 154, 0.14);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
  }

  .scenario-card:hover,
  .scenario-card.active {
    border-color: rgba(45, 212, 154, 0.34);
    background: rgba(45, 212, 154, 0.12);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  }

  .snippet-copy {
    background: rgba(45, 212, 154, 0.14);
    color: #61e5b4;
  }

  .snippet-copy.copied {
    background: rgba(96, 165, 250, 0.16);
    color: #9cc7ff;
  }

  .snippet-card pre {
    background: #08141d;
    color: #d7f8ea;
  }

  .sample-file-icon {
    background: linear-gradient(145deg, #253542, #16222b);
    color: #c8d8e4;
    box-shadow: inset 0 0 0 1px rgba(167, 185, 198, 0.18);
  }

  .sample-file-icon::before {
    background: rgba(236, 244, 248, 0.16);
    box-shadow: -1px 1px 0 rgba(0, 0, 0, 0.22);
  }

  .sample-file-icon[data-family='word'] {
    background: linear-gradient(145deg, #183759, #102235);
    color: #93c5fd;
  }

  .sample-file-icon[data-family='sheet'] {
    background: linear-gradient(145deg, #153d2d, #10261d);
    color: #86efac;
  }

  .sample-file-icon[data-family='slide'] {
    background: linear-gradient(145deg, #4b2d17, #2b1d13);
    color: #fdba74;
  }

  .sample-file-icon[data-family='pdf'] {
    background: linear-gradient(145deg, #4b1f25, #2a1418);
    color: #fca5a5;
  }

  .sample-file-icon[data-family='layout'],
  .sample-file-icon[data-family='drawing'],
  .sample-file-icon[data-family='ebook'] {
    background: linear-gradient(145deg, #312653, #1f1a34);
    color: #c4b5fd;
  }

  .sample-file-icon[data-family='cad'],
  .sample-file-icon[data-family='eda'],
  .sample-file-icon[data-family='audio'] {
    background: linear-gradient(145deg, #17444d, #10292e);
    color: #67e8f9;
  }

  .sample-file-icon[data-family='model'],
  .sample-file-icon[data-family='text'] {
    background: linear-gradient(145deg, #31421f, #1c2916);
    color: #bef264;
  }

  .sample-file-icon[data-family='archive'] {
    background: linear-gradient(145deg, #4a3416, #2a2114);
    color: #facc15;
  }

  .sample-file-icon[data-family='email'] {
    background: linear-gradient(145deg, #183a62, #112337);
    color: #93c5fd;
  }

  .sample-file-icon[data-family='code'],
  .sample-file-icon[data-family='video'] {
    background: linear-gradient(145deg, #273044, #171f2d);
    color: #cbd5e1;
  }

  .sample-file-icon[data-family='image'] {
    background: linear-gradient(145deg, #4a2340, #2b1827);
    color: #f9a8d4;
  }

  .primary-button {
    background: linear-gradient(135deg, #15935f 0%, #2dd493 100%);
    box-shadow: 0 16px 32px rgba(21, 147, 95, 0.26);
  }

  .upload-card {
    border-color: rgba(45, 212, 154, 0.24);
    background:
      linear-gradient(135deg, rgba(45, 212, 154, 0.1), transparent 58%),
      rgba(22, 32, 39, 0.9);
  }

  .upload-title {
    color: #61e5b4;
  }

  .viewer-toolbar {
    border-bottom-color: rgba(167, 185, 198, 0.12);
  }

  .viewer-status {
    background: #2dd493;
    box-shadow: 0 0 0 5px rgba(45, 212, 154, 0.14);
  }

  .viewer-type {
    background: rgba(167, 185, 198, 0.12);
  }

  .viewer-action-group {
    border-color: rgba(167, 185, 198, 0.13);
    background: rgba(9, 15, 20, 0.54);
  }

  .viewer-search-popover {
    border-color: rgba(167, 185, 198, 0.13);
    background: rgba(12, 20, 27, 0.94);
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
  }

  .viewer-search-popover input,
  .viewer-search-popover button,
  .viewer-search-summary {
    color: #b8c7d5;
  }

  .viewer-search-popover input {
    background: rgba(167, 185, 198, 0.09);
  }

  .viewer-search-popover input:focus,
  .viewer-search-popover button:hover {
    background: rgba(45, 212, 154, 0.14);
    color: #61e5b4;
  }

  .viewer-tool-button {
    border-color: rgba(167, 185, 198, 0.13);
    background: rgba(22, 32, 39, 0.78);
    color: #b8c7d5;
  }

  .viewer-action-group .viewer-tool-button--meter {
    color: #c9d7e5;
  }

  .viewer-tool-button:disabled {
    color: #607482;
  }

  .viewer-tool-button.active {
    border-color: rgba(45, 212, 154, 0.36);
    background: rgba(45, 212, 154, 0.14);
    color: #61e5b4;
  }

  .mobile-control-backdrop {
    background: rgba(4, 9, 12, 0.46);
  }

  .mobile-quick-row,
  .mobile-zoom-strip,
  .mobile-action-panel {
    border-color: rgba(188, 214, 220, 0.16);
    background: rgba(12, 20, 27, 0.78);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.36);
  }

  .mobile-fab,
  .mobile-zoom-strip button,
  .mobile-action-panel button,
  .mobile-sheet-close {
    color: #d7e7ee;
  }

  .mobile-sheet-close {
    border-color: rgba(188, 214, 220, 0.14);
    background: rgba(12, 20, 27, 0.72);
  }

  .mobile-fab:hover,
  .mobile-fab.active,
  .mobile-action-panel button.active {
    background: rgba(45, 212, 154, 0.16);
    color: #61e5b4;
  }

  .viewport :deep(.file-viewer) {
    box-shadow: inset 0 0 0 1px rgba(167, 185, 198, 0.12);
  }

  .hidden .viewer-panel {
    background: #0f171d;
  }
}

@media (max-width: 1100px) {
  .layout-shell {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }

  .control-panel {
    max-height: 42vh;
    display: grid;
    grid-template-columns: minmax(230px, 0.9fr) minmax(240px, 1fr);
    align-items: stretch;
  }

  .current-card {
    display: none;
  }

  .panel-body {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .sample-picker-open .panel-body {
    overflow: visible;
  }
}

@media (max-width: 720px) {
  .demo-shell {
    height: 100dvh;
    background: #eef5f1;
  }

  .workspace {
    height: 100dvh;
    padding: 0;
  }

  .layout-shell {
    position: relative;
    height: 100%;
    display: block;
  }

  .viewer-panel {
    height: 100%;
    border: 0;
    border-radius: 0;
    background: #ffffff;
    box-shadow: none;
  }

  .viewer-toolbar {
    position: absolute;
    z-index: 35;
    top: max(8px, env(safe-area-inset-top));
    right: 10px;
    left: 10px;
    min-height: 44px;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid rgba(20, 35, 53, 0.08);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.76);
    box-shadow: 0 16px 38px rgba(18, 35, 55, 0.12);
    backdrop-filter: blur(18px);
  }

  .viewer-path {
    display: none;
  }

  .viewer-tools {
    display: none;
  }

  .viewer-copy {
    flex: 1;
  }

  .viewer-copy strong {
    max-width: calc(100vw - 122px);
    font-size: 13px;
  }

  .viewer-type {
    padding: 4px 7px;
    font-size: 10px;
  }

  .viewer-search-popover {
    z-index: 80;
    top: calc(max(8px, env(safe-area-inset-top)) + 54px);
    right: 10px;
    left: 10px;
    grid-template-columns: minmax(120px, 1fr) auto auto auto auto;
    width: auto;
    max-width: none;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
  }

  .control-panel {
    position: fixed;
    z-index: 65;
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
    left: 10px;
    max-height: min(78dvh, 620px);
    display: flex;
    gap: 10px;
    padding: 10px;
    border-radius: 24px;
    overflow: hidden;
    transform: translateY(calc(100% + 24px));
    opacity: 0;
    pointer-events: none;
    transition: transform 0.24s ease, opacity 0.2s ease;
  }

  .sample-picker-open .control-panel {
    max-height: min(86dvh, 680px);
  }

  .mobile-controls-open .control-panel {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .brand-card {
    display: none;
  }

  .current-card {
    display: flex;
    flex-shrink: 0;
    padding: 10px 48px 10px 10px;
    border-radius: 18px;
  }

  .current-badge {
    width: 44px;
    height: 40px;
    border-radius: 13px;
  }

  .mobile-sheet-close {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(20, 35, 53, 0.08);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    color: #526174;
    box-shadow: 0 10px 24px rgba(18, 35, 55, 0.1);
    backdrop-filter: blur(14px);
  }

  .panel-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    gap: 10px;
    padding-right: 2px;
  }

  .sample-picker-open .panel-body {
    overflow: hidden;
  }

  .sample-picker-open .scenario-picker,
  .sample-picker-open .field-group,
  .sample-picker-open .primary-button,
  .sample-picker-open .snippet-card {
    display: none;
  }

  .sample-picker-open .sample-picker {
    flex: 1;
    min-height: 0;
  }

  .compact-field,
  .primary-button {
    min-height: 42px;
  }

  .sample-trigger {
    min-height: 64px;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    gap: 10px;
    padding: 9px;
  }

  .sample-trigger .sample-file-icon {
    width: 38px;
    height: 46px;
  }

  .sample-menu {
    position: static;
    max-height: min(48dvh, 430px) !important;
    margin-top: 8px;
    border-radius: 18px;
  }

  .sample-picker-open .sample-menu {
    flex: 1;
    min-height: 0;
    max-height: none !important;
  }

  .sample-menu--bottom,
  .sample-menu--top {
    top: auto;
    bottom: auto;
  }

  .sample-group-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sample-card {
    min-height: 62px;
  }

  .scenario-trigger {
    min-height: 42px;
    border-radius: 15px;
    padding: 6px 9px;
  }

  .scenario-trigger-icon {
    width: 30px;
    height: 30px;
  }

  .scenario-popover {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: min(32dvh, 250px);
    margin-top: 8px;
    border-radius: 18px;
  }

  .scenario-card {
    min-height: 62px;
    border-radius: 13px;
  }

  .snippet-card {
    border-radius: 14px;
  }

  .snippet-card pre {
    max-height: 104px;
  }

  .upload-card {
    min-height: 168px;
    justify-content: center;
  }

  .viewport {
    height: 100%;
    padding: 0;
  }

  .viewport :deep(.file-viewer) {
    border-radius: 0;
    box-shadow: none;
  }

  .mobile-control-backdrop {
    position: fixed;
    z-index: 58;
    inset: 0;
    display: block;
    border: 0;
    background: rgba(15, 31, 38, 0.24);
    backdrop-filter: blur(4px);
  }

  .mobile-action-dock {
    position: fixed;
    z-index: 55;
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
    left: 10px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    pointer-events: none;
  }

  .mobile-quick-row,
  .mobile-zoom-strip,
  .mobile-action-panel {
    pointer-events: auto;
    border: 1px solid rgba(20, 35, 53, 0.08);
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0 18px 48px rgba(18, 35, 55, 0.16);
    backdrop-filter: blur(18px);
  }

  .mobile-quick-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 5px;
    padding: 6px;
    border-radius: 22px;
  }

  .mobile-fab,
  .mobile-zoom-strip button,
  .mobile-action-panel button {
    min-width: 0;
    border: 0;
    background: transparent;
    color: #34465a;
    font: inherit;
    font-weight: 900;
    cursor: pointer;
  }

  .mobile-fab {
    height: 50px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border-radius: 17px;
    font-size: 10px;
  }

  .mobile-fab:hover,
  .mobile-fab.active,
  .mobile-fab--primary {
    background: rgba(33, 163, 102, 0.12);
    color: #16804f;
  }

  .mobile-zoom-strip {
    align-self: flex-end;
    display: inline-grid;
    grid-template-columns: 42px minmax(54px, auto) 42px;
    gap: 2px;
    padding: 5px;
    border-radius: 999px;
  }

  .mobile-zoom-strip button {
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
  }

  .mobile-zoom-meter {
    padding: 0 8px;
    font-size: 12px;
  }

  .mobile-action-panel {
    align-self: stretch;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    gap: 6px;
    padding: 8px;
    border-radius: 20px;
  }

  .mobile-action-panel button {
    height: 40px;
    border-radius: 14px;
    font-size: 12px;
  }

  .mobile-action-panel button:hover,
  .mobile-action-panel button.active {
    background: rgba(33, 163, 102, 0.12);
    color: #16804f;
  }

  .mobile-action-panel button:disabled,
  .mobile-zoom-strip button:disabled {
    color: #9aa8b6;
    cursor: not-allowed;
    opacity: 0.66;
  }
}

@media (max-width: 720px) and (prefers-color-scheme: dark) {
  .demo-shell {
    background: #0f171d;
  }

  .viewer-panel {
    background: #0f171d;
  }

  .viewer-toolbar,
  .viewer-search-popover {
    border-color: rgba(188, 214, 220, 0.14);
    background: rgba(12, 20, 27, 0.78);
    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.34);
  }

  .mobile-control-backdrop {
    background: rgba(4, 9, 12, 0.48);
  }

  .mobile-quick-row,
  .mobile-zoom-strip,
  .mobile-action-panel {
    border-color: rgba(188, 214, 220, 0.16);
    background: rgba(12, 20, 27, 0.78);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.36);
  }

  .mobile-fab,
  .mobile-zoom-strip button,
  .mobile-action-panel button,
  .mobile-sheet-close {
    color: #d7e7ee;
  }

  .mobile-sheet-close {
    border-color: rgba(188, 214, 220, 0.14);
    background: rgba(12, 20, 27, 0.72);
  }

  .mobile-fab:hover,
  .mobile-fab.active,
  .mobile-fab--primary,
  .mobile-action-panel button:hover,
  .mobile-action-panel button.active {
    background: rgba(45, 212, 154, 0.16);
    color: #61e5b4;
  }
}
</style>

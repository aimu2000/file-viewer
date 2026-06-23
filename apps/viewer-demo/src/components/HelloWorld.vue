<script setup lang='ts'>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import {
  ChevronDown,
  ChevronUp,
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
const url = ref('/example/word.docx')
const preview = ref('')
const samplePickerOpen = ref(false)
const expandedSampleGroupIndex = ref<number | null>(0)
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

const sampleGroups: SampleGroup[] = [
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
      { name: 'PPTX 中文课件', url: '/example/ppt.pptx' },
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
    title: '3D 模型',
    description: 'GLTF / OBJ / STL / PLY / Geo',
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
    description: 'ZIP / TAR.GZ',
    family: 'archive',
    items: [
      { name: 'ZIP', url: '/example/archive.zip' },
      { name: 'TAR.GZ', url: '/example/archive.tar.gz' }
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

const presetFiles = sampleGroups.flatMap(group => group.items)
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
  ...presetFiles.map(item => {
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
  return presetFiles.find(item => isSameSampleUrl(item.url, url.value))
})

const activeSampleGroupIndex = computed(() => {
  const target = activePreset.value?.url || url.value || preview.value
  return sampleGroups.findIndex(group => group.items.some(item => isSameSampleUrl(item.url, target)))
})

const activeIconMeta = computed(() => {
  return getFileIconMeta(activePreset.value?.url || url.value)
})

const displayMode = computed(() => {
  return file.value ? '本地' : '链接'
})

const displayName = computed(() => {
  if (file.value && filename.value) {
    return filename.value
  }
  if (preview.value) {
    const name = preview.value.split('/').pop() || preview.value
    return decodeURIComponent(name)
  }
  return activePreset.value?.name || '未选择文件'
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
    return 'AUTO'
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

  options.archive = {
    workerUrl: `/${DEFAULT_FILE_VIEWER_ARCHIVE_WORKER_PATH}`,
    cache: true,
    ...runtime.archive
  }
  options.spreadsheet = {
    resizableColumns: true,
    ...runtime.spreadsheet
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
  if (body) {
    filename.value = body.name && decodeURIComponent(body.name) || ''
    file.value = body
  }
  if (target) {
    url.value = target
    preview.value = target
  }
})

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('keydown', handleDocumentKeydown)
  window.addEventListener('resize', handleWindowResize)
  openUrlPreview(url.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('keydown', handleDocumentKeydown)
  window.removeEventListener('resize', handleWindowResize)
})

function openUrlPreview(nextUrl = url.value) {
  input.value = true
  file.value = undefined
  resetViewerSearch()
  preview.value = nextUrl
  samplePickerOpen.value = false
  mobileControlsOpen.value = false
  mobileActionsOpen.value = false
}

function setInputMode(nextMode: boolean) {
  input.value = nextMode
  samplePickerOpen.value = false
}

async function handleChange(e: Event) {
  const target = e.target as HTMLInputElement
  const value = target.files?.item(0)
  if (!value) {
    return
  }
  input.value = false
  samplePickerOpen.value = false
  mobileControlsOpen.value = false
  mobileActionsOpen.value = false
  resetViewerSearch()
  filename.value = value.name && decodeURIComponent(value.name) || ''
  file.value = value
}

async function toggleSamplePicker() {
  samplePickerOpen.value = !samplePickerOpen.value
  if (samplePickerOpen.value) {
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
  const nextGroupIndex = sampleGroups.findIndex(group => group.items.some(item => isSameSampleUrl(item.url, nextUrl)))
  url.value = nextUrl
  expandedSampleGroupIndex.value = nextGroupIndex >= 0 ? nextGroupIndex : expandedSampleGroupIndex.value
  samplePickerOpen.value = false
  mobileControlsOpen.value = false
  mobileActionsOpen.value = false
  openUrlPreview(nextUrl)
}

function isActivePreset(item: PresetFile) {
  return !file.value && isSameSampleUrl(url.value, item.url)
}

function handleDocumentPointerDown(event: PointerEvent) {
  if (!samplePickerOpen.value) {
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
  <div class='demo-shell' :class="{ hidden, 'mobile-controls-open': mobileControlsOpen, 'mobile-actions-open': mobileActionsOpen }">
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
            <span class='brand-pill'>Pure Web</span>
          </div>

          <div class='current-card'>
            <span class='current-badge'>{{ previewType }}</span>
            <div class='current-copy'>
              <span>{{ displayMode }}</span>
              <strong>{{ displayName }}</strong>
            </div>
          </div>

          <button type='button' class='mobile-sheet-close' aria-label='关闭操作面板' @click='closeMobileControls'>
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
                链接
              </button>
              <button
                type='button'
                class='mode-button'
                :class='{ active: !input }'
                @click='setInputMode(false)'
              >
                上传
              </button>
            </div>

            <template v-if='input'>
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
                    <span>示例文件</span>
                    <strong>{{ activePreset?.name || fileNameOf(url) }}</strong>
                    <em>{{ activePreset ? fileNameOf(activePreset.url) : url }}</em>
                  </span>
                  <span class='sample-trigger-action'>{{ samplePickerOpen ? '收起' : '打开' }}</span>
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
                <label class='field-label'>地址</label>
                <input
                  v-model='url'
                  class='compact-field'
                  type='text'
                  placeholder='输入文件地址'
                  @keyup.enter='openUrlPreview()'
                />
              </div>

              <button type='button' class='primary-button' @click='openUrlPreview()'>
                预览
              </button>
            </template>

            <template v-else>
              <label class='upload-card'>
                <input type='file' :accept='uploadAccept' @change='handleChange' />
                <span class='upload-icon'>+</span>
                <span class='upload-title'>点击选择文件</span>
                <strong>{{ filename || '从本机打开' }}</strong>
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
              <div v-if='showExternalToolbar' class='viewer-action-group' aria-label='预览操作'>
                <template v-if='visibleExternalToolbar.zoom'>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--icon'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomOut'
                    title='缩小预览'
                    aria-label='缩小预览'
                    @click='triggerViewerAction("zoomOut")'
                  >
                    <ZoomOut :size='15' :stroke-width='2.4' />
                  </button>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--meter'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
                    title='还原比例'
                    @click='triggerViewerAction("resetZoom")'
                  >
                    {{ viewerZoomState.label }}
                  </button>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--icon'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomIn'
                    title='放大预览'
                    aria-label='放大预览'
                    @click='triggerViewerAction("zoomIn")'
                  >
                    <ZoomIn :size='15' :stroke-width='2.4' />
                  </button>
                  <button
                    type='button'
                    class='viewer-tool-button viewer-tool-button--icon'
                    :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
                    title='还原比例'
                    aria-label='还原比例'
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
                  title='下载原始文件'
                  @click='triggerViewerAction("download")'
                >
                  下载
                </button>
                <button
                  v-if='visibleExternalToolbar.print'
                  type='button'
                  class='viewer-tool-button'
                  :disabled='viewerActionDisabled'
                  title='打印完整渲染内容'
                  @click='triggerViewerAction("print")'
                >
                  打印
                </button>
                <button
                  v-if='visibleExternalToolbar.exportHtml'
                  type='button'
                  class='viewer-tool-button'
                  :disabled='viewerActionDisabled'
                  title='导出当前渲染后的 HTML'
                  @click='triggerViewerAction("exportHtml")'
                >
                  HTML
                </button>
              </div>
              <button
                type='button'
                class='viewer-tool-button'
                :class='{ active: watermarkEnabled }'
                title='切换水印'
                @click='toggleWatermark'
              >
                水印
              </button>
            </div>
          </div>

          <div v-if='viewerSearchOpen' class='viewer-search-popover' role='search' aria-label='文档搜索'>
            <input
              ref='viewerSearchInputRef'
              v-model.trim='viewerSearchQuery'
              type='search'
              placeholder='搜索当前文档'
              @keyup.enter='runViewerSearch'
            />
            <span class='viewer-search-summary'>{{ viewerSearchSummary }}</span>
            <button type='button' title='上一个搜索结果' aria-label='上一个搜索结果' @click='previousViewerSearch'>
              <ChevronUp class='viewer-search-icon' aria-hidden='true' />
            </button>
            <button type='button' title='下一个搜索结果' aria-label='下一个搜索结果' @click='nextViewerSearch'>
              <ChevronDown class='viewer-search-icon' aria-hidden='true' />
            </button>
            <button type='button' class='viewer-search-close' title='关闭搜索' @click='closeViewerSearch'>
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
          aria-label='关闭移动端操作面板'
          @click='closeMobileControls'
        />

        <nav class='mobile-action-dock' aria-label='移动端预览操作'>
          <div v-if='visibleExternalToolbar.zoom' class='mobile-zoom-strip'>
            <button
              type='button'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomOut'
              title='缩小预览'
              aria-label='缩小预览'
              @click='triggerViewerAction("zoomOut")'
            >
              <ZoomOut :size='18' :stroke-width='2.4' />
            </button>
            <button
              type='button'
              class='mobile-zoom-meter'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
              title='还原比例'
              @click='triggerViewerAction("resetZoom")'
            >
              {{ viewerZoomState.label }}
            </button>
            <button
              type='button'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomIn'
              title='放大预览'
              aria-label='放大预览'
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
              下载
            </button>
            <button
              v-if='visibleExternalToolbar.print'
              type='button'
              :disabled='viewerActionDisabled'
              @click='triggerViewerAction("print")'
            >
              打印
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
              水印
            </button>
            <button
              v-if='visibleExternalToolbar.zoom'
              type='button'
              :disabled='viewerActionDisabled || !viewerAvailability.zoomReset'
              @click='triggerViewerAction("resetZoom")'
            >
              还原
            </button>
          </div>

          <div class='mobile-quick-row'>
            <button type='button' class='mobile-fab' aria-label='打开链接设置' @click='openMobileControls("link")'>
              <Link2 :size='18' :stroke-width='2.4' />
              <span>链接</span>
            </button>
            <button type='button' class='mobile-fab' aria-label='打开示例文件' @click='openMobileControls("samples")'>
              <FileSearch :size='18' :stroke-width='2.4' />
              <span>样例</span>
            </button>
            <button type='button' class='mobile-fab' aria-label='上传本地文件' @click='openMobileControls("upload")'>
              <Upload :size='18' :stroke-width='2.4' />
              <span>上传</span>
            </button>
            <button type='button' class='mobile-fab' aria-label='搜索当前文档' @click='openViewerSearch'>
              <Search :size='18' :stroke-width='2.4' />
              <span>搜索</span>
            </button>
            <button
              type='button'
              class='mobile-fab mobile-fab--primary'
              :class='{ active: mobileActionsOpen }'
              aria-label='打开更多操作'
              :aria-expanded="mobileActionsOpen ? 'true' : 'false'"
              @click='toggleMobileActions'
            >
              <MoreHorizontal :size='20' :stroke-width='2.6' />
              <span>更多</span>
            </button>
          </div>
        </nav>
      </div>

      <section v-else class='viewer-panel standalone'>
        <div v-if='viewerSearchOpen' class='viewer-search-popover viewer-search-popover--standalone' role='search' aria-label='文档搜索'>
          <input
            ref='viewerSearchInputRef'
            v-model.trim='viewerSearchQuery'
            type='search'
            placeholder='搜索当前文档'
            @keyup.enter='runViewerSearch'
          />
          <span class='viewer-search-summary'>{{ viewerSearchSummary }}</span>
          <button type='button' title='上一个搜索结果' aria-label='上一个搜索结果' @click='previousViewerSearch'>
            <ChevronUp class='viewer-search-icon' aria-hidden='true' />
          </button>
          <button type='button' title='下一个搜索结果' aria-label='下一个搜索结果' @click='nextViewerSearch'>
            <ChevronDown class='viewer-search-icon' aria-hidden='true' />
          </button>
          <button type='button' class='viewer-search-close' title='关闭搜索' @click='closeViewerSearch'>
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
  padding: 16px;
}

.layout-shell {
  height: 100%;
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
  overflow: visible;
  padding: 12px;
  gap: 12px;
}

.brand-card {
  position: relative;
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

.current-card {
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
.sample-trigger,
.sample-card {
  font: inherit;
}

.mode-button,
.primary-button,
.sample-trigger,
.sample-card {
  border: 0;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.mode-button:hover,
.primary-button:hover,
.sample-trigger:hover,
.sample-card:hover {
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
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 2px 2px 4px;
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
}

.sample-trigger {
  width: 100%;
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
  .sample-trigger,
  .upload-card {
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
  .sample-trigger-copy span,
  .sample-trigger-copy em,
  .sample-card-copy span,
  .sample-group-header em,
  .viewer-path,
  .viewer-type {
    color: #9eb0bf;
  }

  .current-copy strong,
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
    overscroll-behavior: contain;
    gap: 10px;
    padding-right: 2px;
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

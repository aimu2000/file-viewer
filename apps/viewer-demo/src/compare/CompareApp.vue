<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { ChevronDown, ChevronUp, Search, X } from '@lucide/vue'
import { FileViewer } from '@file-viewer/vue3'
import { allRenderers } from '@file-viewer/preset-all'
import type {
  FileViewerFileRef as FileRef,
  FileViewerLifecycleContext,
  FileViewerOptions,
  FileViewerPublicApi as FileViewerExpose,
  FileViewerSearchState
} from '@file-viewer/core'
import brandLogo from '@/assets/logo.png'
import { useSynchronizedScroll } from './useSynchronizedScroll'

type CompareSide = 'left' | 'right'

interface CompareSample {
  label: string;
  description: string;
  url: string;
}

interface ComparePanelState {
  side: CompareSide;
  title: string;
  url: string;
  file?: FileRef;
  filename: string;
  status: string;
}

type FileViewerPublicApi = ComponentPublicInstance & FileViewerExpose

const params = new URLSearchParams(window.location.search)

const samples: CompareSample[] = [
  { label: 'DOC 旧版合同', description: 'Word 97-2003 示例', url: '/example/test.doc' },
  { label: 'DOCX 中文长文档', description: '表格图示与正式页', url: '/example/word.docx' },
  { label: 'PDF 技术说明', description: '真实 PDF 页面', url: '/example/pdf.pdf' },
  { label: 'PPTX 中文课件', description: '55 页富样式课件', url: '/example/ppt.pptx' },
  { label: 'Typst 源文件', description: 'Typst 直读渲染', url: '/example/report.typ' },
  { label: 'Markdown 文档', description: '轻量文本排版', url: '/example/markdown.md' }
]

const createPanel = (side: CompareSide, title: string, fallbackUrl: string): ComparePanelState => ({
  side,
  title,
  url: params.get(side) || fallbackUrl,
  file: undefined,
  filename: '',
  status: '准备就绪'
})

const leftPanel = reactive(createPanel('left', '左侧文档', samples[0].url))
const rightPanel = reactive(createPanel('right', '右侧文档', samples[1].url))
const syncScrollEnabled = ref(true)
const comparePdfToolbarHidden = ref(true)
const compareSearchOpen = ref(false)
const compareSearchQuery = ref('')
const compareSearchInputRef = ref<HTMLInputElement | null>(null)
const compareLineTarget = ref('')
const activeCompareSide = ref<CompareSide>('left')
const leftViewerRef = ref<FileViewerPublicApi | null>(null)
const rightViewerRef = ref<FileViewerPublicApi | null>(null)

const createEmptySearchState = (): FileViewerSearchState => ({
  query: '',
  total: 0,
  currentIndex: -1,
  current: null,
  matches: []
})

const leftSearchState = ref<FileViewerSearchState>(createEmptySearchState())
const rightSearchState = ref<FileViewerSearchState>(createEmptySearchState())

const activeSideLabel = computed(() => activeCompareSide.value === 'left' ? '左侧文档' : '右侧文档')

const activeSearchState = computed(() => {
  return activeCompareSide.value === 'left' ? leftSearchState.value : rightSearchState.value
})

const viewerOptions = computed<FileViewerOptions>(() => ({
  renderers: allRenderers,
  toolbar: false,
  archive: {
    cache: true
  },
  pdf: {
    toolbar: !comparePdfToolbarHidden.value,
    defaultNavigationVisible: false
  },
  ai: {
    enabled: true,
    collectText: true
  }
}))

const uploadAccept = [
  '.doc', '.docx', '.docm', '.dot', '.dotx', '.dotm',
  '.pdf', '.ofd', '.typ', '.typst', '.ppt', '.pptx', '.pptm', '.potx', '.potm', '.ppsx', '.ppsm',
  '.xls', '.xlsx', '.xlsm', '.xlsb', '.xlt', '.xltx', '.xltm', '.csv', '.ods', '.md', '.markdown', '.txt', '.html',
  '.htm', '.eml', '.msg', '.epub', '.umd', '.png', '.jpg', '.jpeg'
].join(',')

const sampleByUrl = computed(() => {
  return new Map(samples.map(sample => [sample.url, sample]))
})

const getPanelSourceLabel = (panel: ComparePanelState) => {
  if (panel.file) {
    return panel.filename || '本地文件'
  }
  return sampleByUrl.value.get(panel.url)?.label || panel.url || '未选择'
}

const getPanelDescription = (panel: ComparePanelState) => {
  if (panel.file) {
    return '本地上传'
  }
  return sampleByUrl.value.get(panel.url)?.description || 'URL 文件'
}

const selectSample = (panel: ComparePanelState, url: string) => {
  panel.url = url
  panel.file = undefined
  panel.filename = ''
  panel.status = '等待加载'
}

const handleUrlInput = (panel: ComparePanelState) => {
  panel.file = undefined
  panel.filename = ''
  panel.status = panel.url ? '等待加载' : '未选择文件'
}

const getEventValue = (event: Event) => {
  return (event.target as HTMLInputElement | HTMLSelectElement | null)?.value || ''
}

const handleUpload = (panel: ComparePanelState, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }
  panel.file = file
  panel.filename = file.name
  panel.url = ''
  panel.status = '等待加载'
  input.value = ''
}

const swapPanels = () => {
  const leftSnapshot = {
    url: leftPanel.url,
    file: leftPanel.file,
    filename: leftPanel.filename,
    status: leftPanel.status
  }
  leftPanel.url = rightPanel.url
  leftPanel.file = rightPanel.file
  leftPanel.filename = rightPanel.filename
  leftPanel.status = rightPanel.status
  rightPanel.url = leftSnapshot.url
  rightPanel.file = leftSnapshot.file
  rightPanel.filename = leftSnapshot.filename
  rightPanel.status = leftSnapshot.status
}

const resetSamples = () => {
  selectSample(leftPanel, samples[0].url)
  selectSample(rightPanel, samples[1].url)
}

const setViewerRef = (side: CompareSide, element: Element | ComponentPublicInstance | null) => {
  if (side === 'left') {
    leftViewerRef.value = element as FileViewerPublicApi | null
  } else {
    rightViewerRef.value = element as FileViewerPublicApi | null
  }
}

const getViewerScroller = (side: CompareSide) => {
  const viewer = side === 'left' ? leftViewerRef.value : rightViewerRef.value
  return viewer?.getScrollContainer?.() || null
}

const { bind: bindScrollSync } = useSynchronizedScroll(
  syncScrollEnabled,
  () => getViewerScroller('left'),
  () => getViewerScroller('right')
)

const compareSearchSummary = computed(() => {
  if (!compareSearchQuery.value.trim()) {
    return `${activeSideLabel.value} · 0/0`
  }
  const format = (state: FileViewerSearchState) => {
    return state.total ? `${state.currentIndex + 1}/${state.total}` : '0/0'
  }
  return `${activeSideLabel.value} · ${format(activeSearchState.value)}`
})

const setActivePanel = (side: CompareSide) => {
  activeCompareSide.value = side
}

const getActiveViewer = () => {
  return activeCompareSide.value === 'left' ? leftViewerRef.value : rightViewerRef.value
}

const setActiveSearchState = (state: FileViewerSearchState) => {
  if (activeCompareSide.value === 'left') {
    leftSearchState.value = state
  } else {
    rightSearchState.value = state
  }
}

const openCompareSearch = async (side = activeCompareSide.value) => {
  activeCompareSide.value = side
  compareSearchOpen.value = true
  await nextTick()
  compareSearchInputRef.value?.focus()
  compareSearchInputRef.value?.select()
}

const clearActiveCompareSearch = async () => {
  const state = await getActiveViewer()?.clearDocumentSearch() ?? createEmptySearchState()
  setActiveSearchState(state)
  return state
}

const closeCompareSearch = async () => {
  compareSearchOpen.value = false
  await clearActiveCompareSearch()
}

const runCompareSearch = async () => {
  const query = compareSearchQuery.value.trim()
  if (!query) {
    await clearActiveCompareSearch()
    return
  }

  const state = await getActiveViewer()?.searchDocument(query) ?? createEmptySearchState()
  setActiveSearchState(state)
}

const nextCompareSearch = async () => {
  if (!compareSearchQuery.value.trim()) {
    return
  }
  if (activeSearchState.value.query !== compareSearchQuery.value.trim()) {
    await runCompareSearch()
    return
  }
  const state = await getActiveViewer()?.nextSearchResult() ?? activeSearchState.value
  setActiveSearchState(state)
}

const previousCompareSearch = async () => {
  if (!compareSearchQuery.value.trim()) {
    return
  }
  if (activeSearchState.value.query !== compareSearchQuery.value.trim()) {
    await runCompareSearch()
    return
  }
  const state = await getActiveViewer()?.previousSearchResult() ?? activeSearchState.value
  setActiveSearchState(state)
}

const goToCompareLine = async () => {
  const line = Number.parseInt(compareLineTarget.value, 10)
  if (!Number.isFinite(line) || line <= 0) {
    return
  }
  await Promise.all([
    leftViewerRef.value?.scrollToLine(line),
    rightViewerRef.value?.scrollToLine(line)
  ])
}

const getAiChunkCount = (side: CompareSide) => {
  const viewer = side === 'left' ? leftViewerRef.value : rightViewerRef.value
  return viewer?.getDocumentTextChunks?.().length || 0
}

const handleLoadStart = (panel: ComparePanelState) => {
  panel.status = '加载中'
}

const handleLoadComplete = (panel: ComparePanelState, context: FileViewerLifecycleContext) => {
  const chunkCount = getAiChunkCount(panel.side)
  const aiSuffix = chunkCount ? ` · ${chunkCount} 个切片` : ''
  panel.status = `${context.duration ? `已完成 ${context.duration}ms` : '已完成'}${aiSuffix}`
  void bindScrollSync()
  if (compareSearchQuery.value.trim()) {
    void runCompareSearch()
  }
}

const handleUnload = (panel: ComparePanelState) => {
  panel.status = '已卸载'
}

const handleDocumentKeydown = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase()
  if ((event.metaKey || event.ctrlKey) && !event.altKey && key === 'f') {
    event.preventDefault()
    event.stopPropagation()
    if (compareSearchOpen.value) {
      void closeCompareSearch()
      return
    }
    void openCompareSearch()
    return
  }

  if (event.key === 'Escape' && compareSearchOpen.value) {
    void closeCompareSearch()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDocumentKeydown)
})

</script>

<template>
  <main class="compare-page">
    <header class="compare-header">
      <a class="brand" href="/" aria-label="返回 Flyfish Viewer 主预览">
        <img :src="brandLogo" alt="">
        <span>
          <strong>Flyfish Viewer</strong>
          <small>Document Compare</small>
        </span>
      </a>
      <div class="compare-title">
        <h1>文档比对</h1>
        <p>左右并排预览，支持示例、URL、本地上传、同步滚动、聚焦搜索和行级定位。</p>
      </div>
      <div class="header-actions">
        <div class="line-locator" aria-label="行级定位">
          <input
            v-model.trim="compareLineTarget"
            type="number"
            min="1"
            placeholder="行号"
            @keyup.enter="goToCompareLine"
          >
          <button type="button" @click="goToCompareLine">定位</button>
        </div>
        <label class="sync-toggle">
          <input v-model="syncScrollEnabled" type="checkbox">
          <span>同步滚动</span>
        </label>
        <label class="sync-toggle">
          <input v-model="comparePdfToolbarHidden" type="checkbox">
          <span>隐藏 PDF 工具栏</span>
        </label>
        <button type="button" @click="swapPanels">交换</button>
        <button type="button" @click="resetSamples">重置</button>
      </div>
    </header>

    <div v-if="compareSearchOpen" class="compare-search-popover" role="search" aria-label="文档比对搜索">
      <span class="compare-search-side">{{ activeSideLabel }}</span>
      <label class="compare-search-field">
        <Search class="compare-search-field-icon" aria-hidden="true" />
        <input
          ref="compareSearchInputRef"
          v-model.trim="compareSearchQuery"
          type="search"
          placeholder="搜索当前文档"
          @keyup.enter="runCompareSearch"
        >
      </label>
      <span class="compare-search-summary">{{ compareSearchSummary }}</span>
      <button type="button" title="上一个搜索结果" aria-label="上一个搜索结果" @click="previousCompareSearch">
        <ChevronUp class="compare-search-icon" aria-hidden="true" />
      </button>
      <button type="button" title="下一个搜索结果" aria-label="下一个搜索结果" @click="nextCompareSearch">
        <ChevronDown class="compare-search-icon" aria-hidden="true" />
      </button>
      <button type="button" title="关闭搜索" aria-label="关闭搜索" @click="closeCompareSearch">
        <X class="compare-search-icon" aria-hidden="true" />
      </button>
    </div>

    <section class="compare-board" aria-label="文档左右比对">
      <article
        v-for="panel in [leftPanel, rightPanel]"
        :key="panel.side"
        class="compare-panel"
        :class="{ 'compare-panel--active': activeCompareSide === panel.side }"
        tabindex="0"
        @pointerdown="setActivePanel(panel.side)"
        @focusin="setActivePanel(panel.side)"
      >
        <div class="panel-tools">
          <div class="panel-heading">
            <span class="status-dot" />
            <div>
              <h2>{{ panel.title }}</h2>
              <p>{{ panel.status }}</p>
            </div>
          </div>

          <div class="tool-grid">
            <label>
              <span>示例</span>
              <select
                :value="panel.url"
                @change="selectSample(panel, getEventValue($event))"
              >
                <option
                  v-for="sample in samples"
                  :key="sample.url"
                  :value="sample.url"
                >
                  {{ sample.label }}
                </option>
              </select>
            </label>

            <label>
              <span>URL</span>
              <input
                v-model.trim="panel.url"
                type="text"
                placeholder="/example/word.docx"
                @input="handleUrlInput(panel)"
              >
            </label>

            <label class="upload-button">
              <input
                type="file"
                :accept="uploadAccept"
                @change="handleUpload(panel, $event)"
              >
              <span>上传文件</span>
            </label>
          </div>
        </div>

        <div class="source-card">
          <strong>{{ getPanelSourceLabel(panel) }}</strong>
          <span>{{ getPanelDescription(panel) }}</span>
        </div>

        <div class="compare-viewer">
          <FileViewer
            :key="`${panel.side}-${panel.file ? panel.filename : panel.url}-${comparePdfToolbarHidden ? 'compact' : 'full'}`"
            :ref="el => setViewerRef(panel.side, el)"
            :url="panel.file ? undefined : panel.url"
            :file="panel.file"
            :options="viewerOptions"
            @load-start="handleLoadStart(panel)"
            @load-complete="handleLoadComplete(panel, $event)"
            @unload-complete="handleUnload(panel)"
          />
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
:global(html),
:global(body),
:global(#compare-app) {
  width: 100%;
  height: 100%;
  margin: 0;
}

:global(body) {
  overflow: hidden;
  background: #edf4f0;
}

.compare-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(31, 137, 93, 0.14), transparent 34%),
    linear-gradient(180deg, #f8fbf9 0%, #edf4f0 100%);
  color: #172635;
  font-family: Aptos, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.compare-header {
  flex-shrink: 0;
  min-height: 80px;
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(260px, 1.2fr) auto;
  align-items: center;
  gap: 22px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(21, 41, 58, 0.08);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
}

.brand {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
}

.brand img {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(22, 111, 73, 0.16);
}

.brand strong,
.brand small,
.compare-title h1,
.compare-title p,
.panel-heading h2,
.panel-heading p,
.source-card strong,
.source-card span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand strong {
  font-size: 18px;
  letter-spacing: 0;
}

.brand small {
  margin-top: 2px;
  color: #668093;
  font-size: 12px;
  font-weight: 700;
}

.compare-title {
  min-width: 0;
  display: grid;
  gap: 8px;
  text-align: center;
}

.compare-title h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.compare-title p {
  margin: 6px 0 0;
  color: #6a7d8e;
  font-size: 13px;
}

.header-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions button,
.sync-toggle,
.line-locator {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid rgba(20, 42, 59, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  color: #294259;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(16, 38, 54, 0.06);
}

.line-locator {
  gap: 6px;
  padding: 0 6px 0 10px;
}

.line-locator input {
  width: 62px;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #294259;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
}

.line-locator input::placeholder {
  color: #7b91a2;
}

.line-locator button {
  height: 30px;
  padding: 0 10px;
  border-radius: 8px;
  box-shadow: none;
}

.header-actions button {
  cursor: pointer;
}

.header-actions button:hover {
  border-color: rgba(31, 152, 99, 0.28);
  color: #14794e;
}

.sync-toggle input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: #1f9966;
}

.compare-search-popover {
  position: absolute;
  z-index: 30;
  top: 96px;
  right: 24px;
  display: inline-grid;
  grid-template-columns: auto minmax(180px, 280px) auto auto auto auto;
  align-items: center;
  gap: 6px;
  max-width: calc(100% - 48px);
  padding: 6px;
  border: 1px solid rgba(20, 35, 53, 0.09);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 18px 42px rgba(18, 35, 50, 0.18);
  backdrop-filter: blur(18px);
}

.compare-search-side,
.compare-search-summary,
.compare-search-popover button,
.compare-search-field {
  height: 34px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #526174;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
}

.compare-search-side,
.compare-search-summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0 10px;
  color: #718193;
  white-space: nowrap;
}

.compare-search-field {
  min-width: 0;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  background: rgba(20, 35, 53, 0.04);
}

.compare-search-field:focus-within {
  background: rgba(33, 163, 102, 0.1);
  color: #16804f;
}

.compare-search-field input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: inherit;
  font: inherit;
}

.compare-search-field-icon,
.compare-search-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2.4;
}

.compare-search-popover button {
  width: 34px;
  min-width: 34px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.compare-search-popover button:hover {
  background: rgba(33, 163, 102, 0.1);
  color: #16804f;
}

.compare-board {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
  padding: 18px;
  overflow: hidden;
}

.compare-panel {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid rgba(24, 45, 62, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 52px rgba(16, 35, 50, 0.1);
}

.compare-panel:focus {
  outline: none;
}

.compare-panel--active {
  border-color: rgba(31, 153, 102, 0.34);
  box-shadow:
    0 0 0 3px rgba(31, 153, 102, 0.1),
    0 18px 52px rgba(16, 35, 50, 0.1);
}

.panel-tools {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid rgba(24, 45, 62, 0.08);
}

.panel-heading {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #22b779;
  box-shadow: 0 0 0 6px rgba(34, 183, 121, 0.12);
}

.panel-heading h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
}

.panel-heading p {
  margin: 4px 0 0;
  color: #7890a4;
  font-size: 12px;
  font-weight: 700;
}

.tool-grid {
  display: grid;
  grid-template-columns: minmax(150px, 0.75fr) minmax(190px, 1fr) auto;
  gap: 10px;
  align-items: end;
}

.tool-grid label {
  min-width: 0;
  display: grid;
  gap: 6px;
  color: #607588;
  font-size: 12px;
  font-weight: 800;
}

.tool-grid select,
.tool-grid input[type='text'],
.upload-button span {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(24, 45, 62, 0.1);
  border-radius: 10px;
  background: #ffffff;
  color: #1c3145;
  font: inherit;
  font-size: 13px;
  outline: none;
}

.tool-grid select,
.tool-grid input[type='text'] {
  padding: 0 12px;
}

.tool-grid select:focus,
.tool-grid input[type='text']:focus,
.upload-button:focus-within span {
  border-color: rgba(31, 153, 102, 0.5);
  box-shadow: 0 0 0 3px rgba(31, 153, 102, 0.12);
}

.upload-button {
  cursor: pointer;
}

.upload-button input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.upload-button span {
  min-width: 92px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  color: #166f4a;
  font-weight: 900;
  background: #edf8f2;
}

.source-card {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(24, 45, 62, 0.08);
  color: #273d52;
  background: rgba(247, 250, 248, 0.82);
}

.source-card strong {
  font-size: 14px;
}

.source-card span {
  max-width: 180px;
  color: #738a9d;
  font-size: 12px;
  font-weight: 700;
}

.compare-viewer {
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 1180px) {
  .compare-header {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .compare-title {
    text-align: left;
  }

  .tool-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .compare-page {
    overflow: auto;
  }

  .compare-header {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .header-actions {
    justify-content: stretch;
  }

  .header-actions button,
  .sync-toggle,
  .line-locator {
    flex: 1;
  }

  .compare-search-popover {
    left: 18px;
    right: 18px;
    top: 100px;
    grid-template-columns: auto minmax(120px, 1fr) repeat(3, auto);
  }

  .compare-search-summary {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .compare-board {
    min-height: 1200px;
    grid-template-columns: 1fr;
    overflow: visible;
  }
}

@media (prefers-color-scheme: dark) {
  :global(body) {
    background: #0f171d;
  }

  .compare-page {
    background:
      linear-gradient(135deg, rgba(42, 167, 112, 0.16), transparent 34%),
      linear-gradient(180deg, #121b22 0%, #0d141a 100%);
    color: #ecf5f8;
  }

  .compare-header,
  .compare-panel {
    border-color: rgba(149, 174, 190, 0.14);
    background: rgba(18, 28, 36, 0.9);
  }

  .compare-panel--active {
    border-color: rgba(47, 214, 151, 0.34);
    box-shadow:
      0 0 0 3px rgba(47, 214, 151, 0.1),
      0 18px 52px rgba(0, 0, 0, 0.22);
  }

  .brand small,
  .compare-title p,
  .panel-heading p,
  .source-card span,
  .tool-grid label {
    color: #9fb0bd;
  }

  .header-actions button,
  .sync-toggle,
  .line-locator,
  .tool-grid select,
  .tool-grid input[type='text'] {
    border-color: rgba(149, 174, 190, 0.14);
    background: rgba(16, 25, 32, 0.96);
    color: #ecf5f8;
  }

  .line-locator input {
    color: #ecf5f8;
  }

  .compare-search-popover {
    border-color: rgba(149, 174, 190, 0.14);
    background: rgba(12, 20, 27, 0.94);
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
  }

  .compare-search-side,
  .compare-search-summary,
  .compare-search-popover button,
  .compare-search-field {
    color: #b8c7d5;
  }

  .compare-search-field {
    background: rgba(167, 185, 198, 0.09);
  }

  .compare-search-field:focus-within,
  .compare-search-popover button:hover {
    background: rgba(45, 212, 154, 0.14);
    color: #61e5b4;
  }

  .panel-tools,
  .source-card {
    border-color: rgba(149, 174, 190, 0.12);
  }

  .source-card {
    background: rgba(14, 22, 28, 0.8);
    color: #e7f0f4;
  }

  .upload-button span {
    border-color: rgba(47, 214, 151, 0.2);
    background: rgba(47, 214, 151, 0.12);
    color: #72e7b7;
  }
}
</style>

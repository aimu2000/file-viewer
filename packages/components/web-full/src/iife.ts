import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type FileViewerRendererPreset,
  type RendererDefinition
} from '@file-viewer/core'
import FlyfishFileViewerWeb, {
  createViewerControllerHandle,
  FileViewerElement,
  FILE_VIEWER_ELEMENT_TAG,
  mountViewer as mountBaseViewer
} from '@file-viewer/web'
import type {
  ViewerController,
  ViewerCoreOptions,
  FileViewerElementSource,
  ViewerMountOptions,
  ViewerOptions
} from '@file-viewer/web'

export * from '@file-viewer/web'
export { createViewerControllerHandle, FileViewerElement, FILE_VIEWER_ELEMENT_TAG }

type BrowserRendererHandler = FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>

interface LazyRendererLine {
  key: string
  label: string
  scriptName: string
  rendererIds: readonly string[]
}

const rendererGlobalKey = 'FlyfishFileViewerWebFullRenderers'

const lazyRendererLines = [
  { key: 'word', label: 'Word renderer', scriptName: 'word.iife.js', rendererIds: ['office-word-openxml', 'office-word-binary', 'open-document'] },
  { key: 'pdf', label: 'PDF renderer', scriptName: 'pdf.iife.js', rendererIds: ['pdf'] },
  { key: 'ofd', label: 'OFD renderer', scriptName: 'ofd.iife.js', rendererIds: ['ofd'] },
  { key: 'presentation', label: 'Presentation renderer', scriptName: 'presentation.iife.js', rendererIds: ['office-presentation'] },
  { key: 'spreadsheet', label: 'Spreadsheet renderer', scriptName: 'spreadsheet.iife.js', rendererIds: ['spreadsheet-openxml'] },
  { key: 'cad', label: 'CAD renderer', scriptName: 'cad.iife.js', rendererIds: ['cad'] },
  { key: 'typst', label: 'Typst renderer', scriptName: 'typst.iife.js', rendererIds: ['typst'] },
  { key: 'drawing', label: 'Drawing renderer', scriptName: 'drawing.iife.js', rendererIds: ['drawing'] },
  { key: 'model', label: '3D model renderer', scriptName: 'model.iife.js', rendererIds: ['model'] },
  { key: 'archive', label: 'Archive renderer', scriptName: 'archive.iife.js', rendererIds: ['archive'] },
  { key: 'email', label: 'Email renderer', scriptName: 'email.iife.js', rendererIds: ['email'] },
  { key: 'ebook', label: 'Ebook renderer', scriptName: 'ebook.iife.js', rendererIds: ['epub', 'umd'] },
  { key: 'text', label: 'Text renderer', scriptName: 'text.iife.js', rendererIds: ['code', 'markdown'] },
  { key: 'image', label: 'Image renderer', scriptName: 'image.iife.js', rendererIds: ['image'] },
  { key: 'media', label: 'Media renderer', scriptName: 'media.iife.js', rendererIds: ['audio', 'video'] },
  { key: 'mindmap', label: 'Mind map renderer', scriptName: 'mindmap.iife.js', rendererIds: ['mindmap'] },
  { key: 'geo', label: 'Geo renderer', scriptName: 'geo.iife.js', rendererIds: ['geo'] },
  { key: 'data', label: 'Data asset renderer', scriptName: 'data.iife.js', rendererIds: ['data-asset'] },
  { key: 'eda', label: 'EDA renderer', scriptName: 'eda.iife.js', rendererIds: ['eda'] }
] as const satisfies readonly LazyRendererLine[]

const lazyRendererById = new Map<string, LazyRendererLine>()
const lazyRendererByExtension = new Map<string, LazyRendererLine>()
const rendererScriptPromises = new Map<string, Promise<FileViewerRendererPlugin<BrowserRendererHandler>>>()

for (const line of lazyRendererLines) {
  for (const rendererId of line.rendererIds) {
    lazyRendererById.set(rendererId, line)
  }
}

for (const definition of DEFAULT_RENDERER_DEFINITIONS) {
  const line = lazyRendererById.get(definition.id)
  if (!line) {
    continue
  }
  for (const extension of definition.extensions) {
    lazyRendererByExtension.set(extension, line)
  }
}

let defaultFullAssetBaseUrl = detectCurrentScriptBaseUrl()

function normalizeAssetBaseUrl(baseUrl?: string | URL | null) {
  if (!baseUrl) {
    return undefined
  }
  const value = String(baseUrl).trim()
  if (!value) {
    return undefined
  }
  return value.endsWith('/') ? value : `${value}/`
}

function detectCurrentScriptBaseUrl() {
  if (typeof document === 'undefined') {
    return undefined
  }
  const currentScript = document.currentScript as HTMLScriptElement | null
  const scripts = Array.from(document.scripts)
  const script = currentScript?.src
    ? currentScript
    : scripts.reverse().find(item =>
        /(?:@file-viewer\/web-full|flyfish-file-viewer-web-full)/.test(item.src)
      )
  if (!script?.src) {
    return undefined
  }
  try {
    return new URL('./', script.src).href
  } catch {
    return undefined
  }
}

function createFullAssetOptions(assetBaseUrl?: string | URL | null): ViewerOptions {
  const baseUrl = normalizeAssetBaseUrl(assetBaseUrl)
  if (!baseUrl) {
    return {}
  }
  return {
    archive: {
      workerUrl: `${baseUrl}vendor/libarchive/worker-bundle.js`,
      wasmUrl: `${baseUrl}vendor/libarchive/libarchive.wasm`
    },
    cad: {
      wasmPath: `${baseUrl}wasm/cad/`,
      workerUrl: `${baseUrl}wasm/cad/dwg-worker.js`,
      dwfWasmUrl: `${baseUrl}wasm/cad/dwfv-render.wasm`
    },
    data: {
      sqlWasmUrl: `${baseUrl}wasm/data/sql-wasm.wasm`
    },
    docx: {
      workerUrl: `${baseUrl}vendor/docx/docx.worker.js`,
      workerJsZipUrl: `${baseUrl}vendor/docx/jszip.min.js`
    },
    drawing: {
      viewerScriptUrl: `${baseUrl}vendor/drawio/viewer-static.min.js`
    },
    pdf: {
      workerUrl: `${baseUrl}vendor/pdf/pdf.worker.mjs`,
      cMapUrl: `${baseUrl}vendor/pdf/cmaps/`,
      wasmUrl: `${baseUrl}vendor/pdf/wasm/`,
      standardFontDataUrl: `${baseUrl}vendor/pdf/standard_fonts/`
    },
    spreadsheet: {
      workerUrl: `${baseUrl}vendor/xlsx/sheet.worker.js`
    },
    typst: {
      compilerWasmUrl: `${baseUrl}wasm/typst/typst_ts_web_compiler_bg.wasm`,
      rendererWasmUrl: `${baseUrl}wasm/typst/typst_ts_renderer_bg.wasm`,
      fontAssetsUrl: `${baseUrl}wasm/typst/fonts/`
    }
  }
}

function mergeNestedOptions<Options extends object>(
  defaults: Options | undefined,
  overrides: Options | undefined
): Options {
  if (!defaults) {
    return overrides as Options
  }
  if (!overrides) {
    return defaults
  }
  return {
    ...defaults,
    ...overrides
  } as Options
}

function getRendererBucket() {
  const host = globalThis as typeof globalThis & {
    [rendererGlobalKey]?: Record<string, FileViewerRendererPlugin<BrowserRendererHandler>>
  }
  if (!host[rendererGlobalKey]) {
    host[rendererGlobalKey] = {}
  }
  return host[rendererGlobalKey]
}

function resolveFullRendererLine(input: string) {
  const normalized = input.trim().toLowerCase().replace(/^\./, '')
  return lazyRendererLines.find(line => line.key === normalized) ||
    lazyRendererById.get(normalized) ||
    lazyRendererByExtension.get(normalized)
}

export function getDefaultFullAssetBaseUrl() {
  return defaultFullAssetBaseUrl
}

export function setDefaultFullAssetBaseUrl(assetBaseUrl?: string | URL | null) {
  defaultFullAssetBaseUrl = normalizeAssetBaseUrl(assetBaseUrl)
}

export function getFullRendererScriptUrl(
  rendererOrExtension: string,
  assetBaseUrl: string | URL | null | undefined = defaultFullAssetBaseUrl
) {
  const line = resolveFullRendererLine(rendererOrExtension)
  if (!line) {
    return undefined
  }
  const baseUrl = normalizeAssetBaseUrl(assetBaseUrl) || './'
  return new URL(`renderers/${line.scriptName}`, baseUrl).href
}

async function loadFullRendererLine(line: LazyRendererLine) {
  const existing = getRendererBucket()[line.key]
  if (existing) {
    return existing
  }

  const cached = rendererScriptPromises.get(line.key)
  if (cached) {
    return cached
  }

  const promise = new Promise<FileViewerRendererPlugin<BrowserRendererHandler>>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error(`Cannot load ${line.label} outside a browser document.`))
      return
    }

    const scriptUrl = getFullRendererScriptUrl(line.key)
    if (!scriptUrl) {
      reject(new Error(`Cannot resolve script URL for ${line.label}.`))
      return
    }

    const previous = document.querySelector<HTMLScriptElement>(
      `script[data-file-viewer-full-renderer="${line.key}"]`
    )

    const onReady = () => {
      const plugin = getRendererBucket()[line.key]
      if (plugin) {
        resolve(plugin)
      } else {
        reject(new Error(`${line.label} script loaded but did not register a renderer plugin.`))
      }
    }

    if (previous) {
      previous.addEventListener('load', onReady, { once: true })
      previous.addEventListener('error', () => reject(new Error(`Failed to load ${line.label} from ${scriptUrl}.`)), { once: true })
      if (getRendererBucket()[line.key]) {
        onReady()
      }
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = scriptUrl
    script.dataset.fileViewerFullRenderer = line.key
    script.onload = onReady
    script.onerror = () => reject(new Error(`Failed to load ${line.label} from ${scriptUrl}.`))
    document.head.appendChild(script)
  })

  rendererScriptPromises.set(line.key, promise)
  try {
    return await promise
  } catch (error) {
    rendererScriptPromises.delete(line.key)
    throw error
  }
}

function createLazyHandler(
  line: LazyRendererLine,
  rendererId: string
): BrowserRendererHandler {
  return async (buffer, target, type, context) => {
    const plugin = await loadFullRendererLine(line)
    const registration = plugin.handlers?.find(item => item.rendererId === rendererId)
    if (!registration) {
      throw new Error(`${line.label} did not provide handler "${rendererId}".`)
    }
    return registration.handler(buffer, target, type, context)
  }
}

const createLazyRendererPlugin = (line: LazyRendererLine): FileViewerRendererPlugin<BrowserRendererHandler> => ({
  id: `file-viewer-iife-${line.key}-renderer`,
  label: `Lazy ${line.label}`,
  definitions: DEFAULT_RENDERER_DEFINITIONS.filter(definition =>
    line.rendererIds.includes(definition.id)
  ) as RendererDefinition[],
  handlers: line.rendererIds.map(rendererId => ({
    rendererId,
    handler: createLazyHandler(line, rendererId)
  }))
})

export const fileViewerFullPreset: FileViewerRendererPreset<BrowserRendererHandler> = {
  id: 'file-viewer-iife-preset-all',
  label: 'Flyfish File Viewer lazy full IIFE preset',
  renderers: lazyRendererLines.map(createLazyRendererPlugin)
}

export function preloadFullRenderer(rendererOrExtension: string) {
  const line = resolveFullRendererLine(rendererOrExtension)
  if (!line) {
    return Promise.reject(new Error(`Unknown File Viewer renderer or extension: ${rendererOrExtension}`))
  }
  return loadFullRendererLine(line)
}

export function withFullViewerOptions(
  options: ViewerOptions = {},
  assetBaseUrl: string | URL | null | undefined = defaultFullAssetBaseUrl
): ViewerOptions {
  const { preset = fileViewerFullPreset, rendererMode = 'replace', ...rest } = options
  const assetOptions = createFullAssetOptions(assetBaseUrl)
  return {
    ...rest,
    preset,
    rendererMode,
    autoRenderers: rest.autoRenderers ?? true,
    archive: mergeNestedOptions(assetOptions.archive, rest.archive),
    cad: mergeNestedOptions(assetOptions.cad, rest.cad),
    data: mergeNestedOptions(assetOptions.data, rest.data),
    docx: mergeNestedOptions(assetOptions.docx, rest.docx),
    drawing: mergeNestedOptions(assetOptions.drawing, rest.drawing),
    pdf: mergeNestedOptions(assetOptions.pdf, rest.pdf),
    spreadsheet: mergeNestedOptions(assetOptions.spreadsheet, rest.spreadsheet),
    typst: mergeNestedOptions(assetOptions.typst, rest.typst)
  }
}

export function withFullMountOptions(
  options: ViewerMountOptions = {},
  assetBaseUrl: string | URL | null | undefined = defaultFullAssetBaseUrl
): ViewerMountOptions {
  return {
    ...options,
    options: withFullViewerOptions(options.options, assetBaseUrl)
  }
}

export function mountViewer(
  container: HTMLElement,
  initialOptions: ViewerMountOptions = {},
  coreOptions: ViewerCoreOptions = {}
): ViewerController {
  return mountBaseViewer(container, withFullMountOptions(initialOptions), coreOptions)
}

export class FileViewerFullElement extends FileViewerElement {
  get options(): ViewerOptions | undefined {
    return super.options
  }

  set options(value: ViewerOptions | undefined) {
    super.options = withFullViewerOptions(value)
  }

  connectedCallback(): void {
    this.options = super.options
    super.connectedCallback()
  }

  async load(options: ViewerMountOptions): Promise<void> {
    await super.load(withFullMountOptions(options))
  }

  async update(options: ViewerMountOptions = {}): Promise<void> {
    await super.update(withFullMountOptions(options))
  }

  get source(): FileViewerElementSource {
    return super.source
  }

  set source(value: FileViewerElementSource | undefined) {
    if (!value) {
      super.source = value
      return
    }
    const { coreOptions, ...mountOptions } = value
    super.source = {
      ...withFullMountOptions(mountOptions),
      coreOptions
    }
  }
}

export function defineFileViewerElement(
  tagName = FILE_VIEWER_ELEMENT_TAG
): CustomElementConstructor | undefined {
  if (typeof window === 'undefined' || !window.customElements) {
    return undefined
  }
  const existing = window.customElements.get(tagName)
  if (existing) {
    return existing
  }
  window.customElements.define(tagName, FileViewerFullElement)
  return FileViewerFullElement
}

const FlyfishFileViewerWebFull = {
  ...FlyfishFileViewerWeb,
  fileViewerFullPreset,
  getDefaultFullAssetBaseUrl,
  getFullRendererScriptUrl,
  preloadFullRenderer,
  setDefaultFullAssetBaseUrl,
  withFullViewerOptions,
  withFullMountOptions,
  defineFileViewerElement,
  FileViewerElement: FileViewerFullElement,
  FileViewerFullElement,
  mountViewer
}

export default FlyfishFileViewerWebFull

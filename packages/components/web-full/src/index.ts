import allRenderers from '@file-viewer/preset-all'
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

export const fileViewerFullPreset = allRenderers

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

export function getDefaultFullAssetBaseUrl() {
  return defaultFullAssetBaseUrl
}

export function setDefaultFullAssetBaseUrl(assetBaseUrl?: string | URL | null) {
  defaultFullAssetBaseUrl = normalizeAssetBaseUrl(assetBaseUrl)
}

export function withFullViewerOptions(
  options: ViewerOptions = {},
  assetBaseUrl: string | URL | null | undefined = defaultFullAssetBaseUrl
): ViewerOptions {
  const { preset = allRenderers, rendererMode = 'replace', ...rest } = options
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
  setDefaultFullAssetBaseUrl,
  withFullViewerOptions,
  withFullMountOptions,
  defineFileViewerElement,
  FileViewerElement: FileViewerFullElement,
  mountViewer
}

export default FlyfishFileViewerWebFull

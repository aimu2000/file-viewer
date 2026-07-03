import type { DocxProgressEvent, Options, renderAsync } from '@file-viewer/docx'
import {
  resolveFileViewerDocxWorkerJsZipUrl,
  resolveFileViewerDocxWorkerUrl,
} from '@file-viewer/core/assets'

import {
  applyPrintPageSize,
  buildPrintPageStyle,
  createFileViewerTranslator,
  createFileViewerZoomChangeEmitter as createZoomChangeEmitter,
  formatCssPixels,
  getElementPrintPageSize,
  registerFileViewerZoomProvider,
  unregisterFileViewerZoomProvider,
  type FileRenderContext,
  type FileViewerDocxOptions,
  type FileViewerRenderedInstance as AppWrapper,
  type FileViewerZoomState,
  type PrintPageSize,
} from '@file-viewer/core'

const DOCX_DEFAULT_PAGE_SIZE: PrintPageSize = {
  width: 794,
  height: 1123
}

const DOCX_WORKER_UNSAFE_PROTOCOLS = new Set(['file:', 'about:', 'data:'])
const DOCX_MIN_SCALE = 0.24
const DOCX_MAX_SCALE = 3
const DOCX_ZOOM_STEP = 0.15
const DOCX_VENDOR_ASSET_VERSION = '0.3.16'
const ZIP_SIGNATURE_PK = 0x504b

const loadLibrary = (() => {
  const loader = {
    module: null as null | Promise<{defaultOptions: Options, renderAsync: typeof renderAsync}>,
    async load() {
      if (!this.module) {
        this.module = import('@file-viewer/docx');
      }
      return this.module;
    }
  }
  return async () => {
    return await loader.load();
  }
})()

/**
 * DOCX / DOCM / DOTX / DOTM are OOXML packages, so a valid file must start
 * with a ZIP signature. This catches common enterprise download failures where
 * an object-storage XML error page is saved with a `.docx` extension.
 */
const assertValidDocxPackage = (buffer: ArrayBuffer, context?: FileRenderContext) => {
  const signature = buffer.byteLength >= 4 ? new DataView(buffer).getUint16(0, false) : 0
  if (signature === ZIP_SIGNATURE_PK) {
    return
  }

  throw new Error(createFileViewerTranslator(context?.options)('word.error.invalidDocx'))
}

const getTargetWindow = (target: HTMLDivElement) => {
  return target.ownerDocument.defaultView
}

const getTargetProtocol = (target: HTMLDivElement) => {
  const candidates = [
    target.ownerDocument.URL,
    getTargetWindow(target)?.location?.href,
    globalThis.location?.href
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      return new URL(candidate).protocol
    } catch {
      // Ignore synthetic document URLs created by tests or embedded hosts.
    }
  }

  return ''
}

const shouldUseDocxWorker = (
  target: HTMLDivElement,
  docxOptions: FileViewerDocxOptions | undefined
) => {
  if (docxOptions?.worker === false) {
    return false
  }
  if (docxOptions?.worker === true) {
    return true
  }

  const WorkerCtor = getTargetWindow(target)?.Worker ?? globalThis.Worker
  if (!WorkerCtor) {
    return false
  }

  return !DOCX_WORKER_UNSAFE_PROTOCOLS.has(getTargetProtocol(target))
}

const appendDocxVendorAssetVersion = (url: string | undefined, explicitUrl: boolean) => {
  if (!url || explicitUrl) {
    return url
  }

  return `${url}${url.includes('?') ? '&' : '?'}file-viewer-docx=${DOCX_VENDOR_ASSET_VERSION}`
}

const createDocxOptions = (
  target: HTMLDivElement,
  context: FileRenderContext | undefined,
  notifyProgressiveRender: () => void
): Partial<Options> => {
  const docxOptions = context?.options?.docx
  const documentBaseUrl = target.ownerDocument.URL || undefined
  const useWorker = shouldUseDocxWorker(target, docxOptions)
  const usePagedLayout = docxOptions?.visualPagination === true
  const progress = (event: DocxProgressEvent) => {
    if (event.phase === 'render' || event.phase === 'layout' || event.phase === 'done') {
      notifyProgressiveRender()
    }
  }

  const options: Partial<Options> = {
    useWorker,
    breakPages: usePagedLayout,
    ignoreLastRenderedPageBreak: docxOptions?.ignoreLastRenderedPageBreak ?? !usePagedLayout,
    progress
  }

  if (useWorker) {
    options.workerUrl = appendDocxVendorAssetVersion(
      resolveFileViewerDocxWorkerUrl(docxOptions, documentBaseUrl),
      !!docxOptions?.workerUrl
    )
    options.workerJsZipUrl = appendDocxVendorAssetVersion(
      resolveFileViewerDocxWorkerJsZipUrl(docxOptions, documentBaseUrl),
      !!docxOptions?.workerJsZipUrl
    )
  }
  if (docxOptions?.workerTimeout !== undefined) {
    options.workerTimeout = docxOptions.workerTimeout
  }
  if (docxOptions?.renderPageBatchSize !== undefined) {
    options.renderPageBatchSize = docxOptions.renderPageBatchSize
  } else if (docxOptions?.progressive === false) {
    options.renderPageBatchSize = Number.MAX_SAFE_INTEGER
  }
  if (docxOptions?.renderYieldEveryMs !== undefined) {
    options.renderYieldEveryMs = docxOptions.renderYieldEveryMs
  }
  if (docxOptions?.strictWordCompatibility !== undefined) {
    options.strictWordCompatibility = docxOptions.strictWordCompatibility
  }
  if (docxOptions?.paginationTolerance !== undefined) {
    options.paginationTolerance = docxOptions.paginationTolerance
  }
  if (docxOptions?.maxDynamicPaginationPasses !== undefined) {
    options.maxDynamicPaginationPasses = docxOptions.maxDynamicPaginationPasses
  }
  if (docxOptions?.awaitLayout !== undefined) {
    options.awaitLayout = docxOptions.awaitLayout
  }
  if (docxOptions?.preserveComplexFieldResults !== undefined) {
    options.preserveComplexFieldResults = docxOptions.preserveComplexFieldResults
  }
  if (docxOptions?.updatePageReferences !== undefined) {
    options.updatePageReferences = docxOptions.updatePageReferences
  }
  if (docxOptions?.hideWebHiddenContent !== undefined) {
    options.hideWebHiddenContent = docxOptions.hideWebHiddenContent
  }

  return options
}

const isTargetHTMLElement = (value: unknown, target: HTMLDivElement): value is HTMLElement => {
  const HTMLElementCtor = getTargetWindow(target)?.HTMLElement
  return HTMLElementCtor ? value instanceof HTMLElementCtor : value instanceof HTMLElement
}

const DOCX_RESPONSIVE_CSS = `
.docx-fit-viewer {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  background: #ececec;
}
.docx-fit-viewer .docx-wrapper {
  box-sizing: border-box;
  min-width: 0 !important;
  width: 100% !important;
  padding: 24px 14px 40px !important;
  background: #e7e9ec !important;
}
.docx-fit-viewer .docx-page-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 24px;
  overflow: visible;
}
.docx-fit-viewer .docx-flow-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 28px;
  overflow: visible;
}
.docx-fit-viewer .docx-page-frame > section.docx,
.docx-fit-viewer .docx-flow-frame > section.docx {
  position: absolute;
  top: 0;
  left: 50%;
  margin: 0 !important;
  background: #ffffff !important;
  box-shadow: 0 2px 14px rgba(25, 35, 48, 0.18);
  box-sizing: border-box;
  color: #111827;
  overflow: hidden;
  transform-origin: top center;
}
.docx-fit-viewer .docx-flow-frame > section.docx {
  height: auto !important;
  min-height: var(--docx-page-height, auto) !important;
  overflow: visible !important;
}
.docx-fit-viewer .docx-page-frame > section.docx > article,
.docx-fit-viewer .docx-flow-frame > section.docx > article {
  position: relative;
  z-index: 1;
}
`

function installResponsiveStyle(target: HTMLDivElement) {
  const style = target.ownerDocument.createElement('style')
  style.textContent = DOCX_RESPONSIVE_CSS
  target.prepend(style)
  return style
}

function wrapDocxSections(target: HTMLDivElement, pagedLayout: boolean) {
  const wrapper = target.querySelector('.docx-wrapper')
  if (!wrapper) {
    return []
  }

  return Array.from(wrapper.children).flatMap(child => {
    if (!isTargetHTMLElement(child, target) || !child.matches('section.docx')) {
      return []
    }

    const frame = target.ownerDocument.createElement('div')
    frame.className = pagedLayout ? 'docx-page-frame' : 'docx-flow-frame'
    child.before(frame)
    frame.appendChild(child)
    return [frame]
  })
}

function makeDocxResponsive(target: HTMLDivElement, context?: FileRenderContext) {
  target.classList.add('docx-fit-viewer')
  const style = installResponsiveStyle(target)
  const pagedLayout = context?.options?.docx?.visualPagination === true
  const frames = wrapDocxSections(target, pagedLayout)
  const view = getTargetWindow(target)
  const ResizeObserverCtor = view?.ResizeObserver
  let resizeFrame = 0
  let userZoom = 1
  let currentScale = 1
  let currentFitScale = 1
  const zoomEmitter = createZoomChangeEmitter()

  const clampScale = (scale: number) => {
    return Math.min(DOCX_MAX_SCALE, Math.max(DOCX_MIN_SCALE, Number(scale.toFixed(2))))
  }

  const applyResponsiveLayout = () => {
    let firstScale = currentScale
    let firstFitScale = currentFitScale
    let measured = false

    frames.forEach(frame => {
      const page = frame.firstElementChild
      if (!isTargetHTMLElement(page, target)) {
        return
      }

      page.style.transform = 'translateX(-50%)'

      const pageWidth = page.offsetWidth
      const contentHeight = pagedLayout
        ? page.offsetHeight
        : Math.max(page.scrollHeight, page.offsetHeight)
      if (!pageWidth || !contentHeight) {
        return
      }
      const availableWidth = Math.max(target.clientWidth - 28, 120)
      const fitScale = Math.min(1, Math.max(DOCX_MIN_SCALE, availableWidth / pageWidth))
      const scale = clampScale(fitScale * userZoom)
      if (!measured) {
        firstScale = scale
        firstFitScale = fitScale
        measured = true
      }

      page.style.transform = `translateX(-50%) scale(${scale})`
      frame.style.width = `${Math.ceil(Math.max(pageWidth * scale, target.clientWidth - 28, 120))}px`
      frame.style.maxWidth = 'none'
      frame.style.height = `${Math.ceil(contentHeight * scale)}px`
    })

    if (!measured) {
      return
    }

    currentScale = firstScale
    currentFitScale = firstFitScale
    zoomEmitter.emit()
  }

  const resize = () => {
    if (!view) {
      applyResponsiveLayout()
      return
    }

    view.cancelAnimationFrame(resizeFrame)
    resizeFrame = view.requestAnimationFrame(() => {
      applyResponsiveLayout()
    })
  }

  const getZoomState = (): FileViewerZoomState => ({
    scale: currentScale,
    label: `${Math.round(currentScale * 100)}%`,
    canZoomIn: currentScale < DOCX_MAX_SCALE,
    canZoomOut: currentScale > DOCX_MIN_SCALE,
    canReset: userZoom !== 1,
    minScale: DOCX_MIN_SCALE,
    maxScale: DOCX_MAX_SCALE
  })

  const setUserZoom = (nextZoom: number) => {
    userZoom = Math.min(6, Math.max(0.2, Number(nextZoom.toFixed(2))))
    view?.cancelAnimationFrame(resizeFrame)
    applyResponsiveLayout()
    return getZoomState()
  }

  target.dataset.viewerZoomProvider = 'docx'
  registerFileViewerZoomProvider(target, {
    zoomIn: () => setUserZoom((currentScale + DOCX_ZOOM_STEP) / Math.max(currentFitScale, 0.01)),
    zoomOut: () => setUserZoom((currentScale - DOCX_ZOOM_STEP) / Math.max(currentFitScale, 0.01)),
    resetZoom: () => setUserZoom(1),
    setZoom: scale => setUserZoom(scale / Math.max(currentFitScale, 0.01)),
    getState: getZoomState,
    subscribe: zoomEmitter.subscribe
  })

  const observer = ResizeObserverCtor ? new ResizeObserverCtor(resize) : null
  observer?.observe(target)
  frames.forEach(frame => {
    const page = getDocxPageElement(frame)
    if (page) {
      observer?.observe(page)
    }
  })
  applyResponsiveLayout()

  return () => {
    view?.cancelAnimationFrame(resizeFrame)
    observer?.disconnect()
    unregisterFileViewerZoomProvider(target)
    style.remove()
    target.classList.remove('docx-fit-viewer')
  }
}

function getDocxPageElement(frame: HTMLElement) {
  const page = frame.firstElementChild
  const HTMLElementCtor = frame.ownerDocument.defaultView?.HTMLElement
  return HTMLElementCtor && page instanceof HTMLElementCtor ? page : null
}

function isDocxFlowFrame(frame: HTMLElement | undefined) {
  return !!frame?.classList.contains('docx-flow-frame')
}

function getDocxFramePrintSize(frame: HTMLElement | undefined) {
  const page = frame ? getDocxPageElement(frame) : null
  if (!page) {
    return DOCX_DEFAULT_PAGE_SIZE
  }

  const size = getElementPrintPageSize(page, DOCX_DEFAULT_PAGE_SIZE)
  if (!isDocxFlowFrame(frame)) {
    return size
  }

  return {
    width: size.width,
    height: Math.max(page.scrollHeight || 0, page.offsetHeight || 0, DOCX_DEFAULT_PAGE_SIZE.height)
  }
}

function normalizeDocxPageForPrint(frame: HTMLElement, pageSize: PrintPageSize) {
  const flowLayout = isDocxFlowFrame(frame)
  const pageWidth = formatCssPixels(pageSize.width)
  const pageHeight = formatCssPixels(pageSize.height)

  applyPrintPageSize(frame, pageSize, { heightMode: flowLayout ? 'min' : 'fixed' })
  frame.style.margin = '0 auto 18px'

  const page = getDocxPageElement(frame)
  if (!page) {
    return
  }

  page.style.position = 'relative'
  page.style.top = 'auto'
  page.style.left = 'auto'
  page.style.width = pageWidth
  page.style.maxWidth = 'none'
  page.style.minHeight = flowLayout ? '0' : pageHeight
  page.style.height = flowLayout ? 'auto' : pageHeight
  page.style.margin = '0 auto'
  page.style.transform = 'none'
  page.style.transformOrigin = 'top left'
  page.style.overflow = flowLayout ? 'visible' : 'hidden'
  page.style.boxShadow = 'none'
}

function buildDocxPrintStyle(target: HTMLDivElement) {
  const firstFrame = target.querySelector<HTMLElement>('.docx-page-frame, .docx-flow-frame')
  const pageSize = getDocxFramePrintSize(firstFrame || undefined)
  const selector = firstFrame?.classList.contains('docx-flow-frame')
    ? '.viewer-export-content .docx-flow-frame'
    : '.viewer-export-content .docx-page-frame'

  return buildPrintPageStyle({
    selector,
    width: pageSize.width,
    height: firstFrame?.classList.contains('docx-flow-frame')
      ? DOCX_DEFAULT_PAGE_SIZE.height
      : pageSize.height,
    heightMode: firstFrame?.classList.contains('docx-flow-frame') ? 'min' : 'fixed'
  })
}

function prepareDocxCloneForExport(target: HTMLDivElement) {
  const liveFrames = Array.from(target.querySelectorAll<HTMLElement>('.docx-page-frame, .docx-flow-frame'))
  const clone = target.cloneNode(true) as HTMLElement
  const printDocument = target.ownerDocument.createElement('div')
  printDocument.className = 'docx-print-document'
  const scopedStyles = Array.from(clone.querySelectorAll('style'))
    .filter(style => !style.textContent?.includes('.docx-fit-viewer'))
    .map(style => style.outerHTML)
    .join('')

  clone.querySelectorAll<HTMLElement>('.docx-page-frame, .docx-flow-frame').forEach((frame, index) => {
    normalizeDocxPageForPrint(frame, getDocxFramePrintSize(liveFrames[index]))
    printDocument.appendChild(frame.cloneNode(true))
  })

  return printDocument.childElementCount ? `${scopedStyles}${printDocument.outerHTML}` : clone.innerHTML
}

/**
 * 渲染docx文件
 */
export default async function(buffer: ArrayBuffer, target: HTMLDivElement, context?: FileRenderContext): Promise<AppWrapper> {
  assertValidDocxPackage(buffer, context)
  target.innerHTML = ''

  let hasNotifiedProgressiveRender = false
  const notifyProgressiveRender = () => {
    if (hasNotifiedProgressiveRender) {
      return
    }
    hasNotifiedProgressiveRender = true
    context?.onProgressiveRender?.()
  }
  const docxOptions = createDocxOptions(target, context, notifyProgressiveRender)
  const { defaultOptions, renderAsync } = await loadLibrary()

  target.dataset.docxWorker = docxOptions.useWorker ? 'self' : 'false'
  await renderAsync(buffer, target, undefined, {
    ...defaultOptions,
    ...docxOptions
  })
  notifyProgressiveRender()

  const disposeResponsive = makeDocxResponsive(target, context)
  context?.registerExportAdapter?.({
    includeDocumentStyles: false,
    beforeSnapshot: () => {
      const view = getTargetWindow(target)
      if (view) {
        view.dispatchEvent(new view.Event('resize'))
      }
    },
    printStyle: () => buildDocxPrintStyle(target),
    toHtml: () => prepareDocxCloneForExport(target)
  })

  return {
    $el: target,
    unmount() {
      context?.registerExportAdapter?.(null)
      disposeResponsive()
      delete target.dataset.docxWorker
      target.innerHTML = ''
    }
  }
}

import {
  type ViewerController,
  type ViewerMountOptions,
  type ViewerCoreOptions,
  mountViewer as mountCoreViewer
} from './controller.js'
import { fileViewerCoreRendererRegistry } from '@file-viewer/core'

export type {
  FileRef,
  ViewerAiOptions,
  ViewerArchiveOptions,
  ViewerCadOptions,
  ViewerController,
  ViewerControllerAccessor,
  ViewerControllerHandle,
  ViewerDocxOptions,
  ViewerEvent,
  ViewerEventHandler,
  ViewerEventType,
  ViewerFetchFile,
  ViewerFetchInput,
  ViewerMountOptions,
  ViewerOptions,
  ViewerPdfOptions,
  ViewerSpreadsheetOptions,
  ViewerSearchOptions,
  ViewerSourceInput,
  ViewerThemeMode,
  ViewerToolbarOptions,
  ViewerToolbarPosition,
  ViewerTypstOptions,
  ViewerWatermarkOptions,
  ViewerLifecycleContext,
  ViewerOperationContext,
  ViewerState,
  ViewerStateListener
} from './controller.js'

export type JQueryFileViewerMethod =
  | 'destroy'
  | 'reload'
  | 'load'
  | 'update'
  | 'downloadOriginalFile'
  | 'printRenderedHtml'
  | 'exportRenderedHtml'
  | 'zoomIn'
  | 'zoomOut'
  | 'resetZoom'
  | 'searchDocument'
  | 'clearDocumentSearch'
  | 'nextSearchResult'
  | 'previousSearchResult'
  | 'scrollToAnchor'
  | 'scrollToLine'

export interface JQueryFileViewerOptions extends ViewerMountOptions {
  /**
   * Replace the previous native viewer when the same element is initialized again.
   * Set to false to update the existing controller in place.
   */
  replace?: boolean
}

type FileViewerPlugin = ((
  this: JQuery,
  options?: JQueryFileViewerOptions | JQueryFileViewerMethod,
  ...args: unknown[]
) => JQuery) & {
  __flyfishFileViewer?: true
}

const controllers = new WeakMap<Element, ViewerController>()

export const mountViewer = (
  container: HTMLElement,
  options: ViewerMountOptions = {},
  coreOptions: ViewerCoreOptions = {}
) => mountCoreViewer(container, options, {
  registry: fileViewerCoreRendererRegistry,
  ...coreOptions
})

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const getGlobalJQuery = (): JQueryStatic | undefined => {
  if (!isBrowser()) {
    return undefined
  }

  return window.jQuery || window.$
}

const resolveElement = (target: Element | JQuery | null | undefined): Element | null => {
  if (!target) {
    return null
  }

  if (typeof Element !== 'undefined' && target instanceof Element) {
    return target
  }

  return (target as JQuery)[0] ?? null
}

const ensureHtmlElement = (element: Element): HTMLElement | null => {
  return typeof HTMLElement !== 'undefined' && element instanceof HTMLElement ? element : null
}

const mountIntoElement = (element: Element, options: JQueryFileViewerOptions) => {
  const container = ensureHtmlElement(element)
  if (!container) {
    return
  }

  const previous = controllers.get(container)
  if (previous) {
    if (options.replace === false) {
      previous.update(options)
      return
    }

    previous.destroy()
    controllers.delete(container)
    container.innerHTML = ''
  }

  const { replace: _replace, ...viewerOptions } = options
  controllers.set(container, mountViewer(container, viewerOptions))
}

const callControllerMethod = (
  element: Element,
  method: JQueryFileViewerMethod,
  args: unknown[]
) => {
  const controller = controllers.get(element)
  if (!controller) {
    return
  }

  if (method === 'destroy') {
    controller.destroy()
    controllers.delete(element)
    return
  }

  if (method === 'reload') {
    controller.reload()
    return
  }

  if (method === 'load') {
    controller.load((args[0] || {}) as ViewerMountOptions)
    return
  }

  if (method === 'downloadOriginalFile') {
    controller.downloadOriginalFile()
    return
  }

  if (method === 'printRenderedHtml') {
    controller.printRenderedHtml()
    return
  }

  if (method === 'exportRenderedHtml') {
    controller.exportRenderedHtml()
    return
  }

  if (method === 'zoomIn') {
    controller.zoomIn()
    return
  }

  if (method === 'zoomOut') {
    controller.zoomOut()
    return
  }

  if (method === 'resetZoom') {
    controller.resetZoom()
    return
  }

  if (method === 'searchDocument') {
    controller.searchDocument(String(args[0] || ''))
    return
  }

  if (method === 'clearDocumentSearch') {
    controller.clearDocumentSearch()
    return
  }

  if (method === 'nextSearchResult') {
    controller.nextSearchResult()
    return
  }

  if (method === 'previousSearchResult') {
    controller.previousSearchResult()
    return
  }

  if (method === 'scrollToAnchor') {
    controller.scrollToAnchor(args[0] as Parameters<ViewerController['scrollToAnchor']>[0])
    return
  }

  if (method === 'scrollToLine') {
    controller.scrollToLine(Number(args[0]))
    return
  }

  controller.update((args[0] || {}) as ViewerMountOptions)
}

export const getFileViewerController = (
  target: Element | JQuery | null | undefined
): ViewerController | null => {
  const element = resolveElement(target)
  return element ? controllers.get(element) ?? null : null
}

export const destroyFileViewer = (target: Element | JQuery | null | undefined) => {
  const element = resolveElement(target)
  const controller = element ? controllers.get(element) : null
  if (!element || !controller) {
    return
  }

  controller.destroy()
  controllers.delete(element)
}

export const installJQueryFileViewer = (jqueryInstance: JQueryStatic | undefined = getGlobalJQuery()) => {
  if (!jqueryInstance) {
    return false
  }

  const existing = jqueryInstance.fn.fileViewer as FileViewerPlugin | undefined
  if (existing?.__flyfishFileViewer) {
    return true
  }

  const plugin: FileViewerPlugin = function fileViewer(
    this: JQuery,
    options: JQueryFileViewerOptions | JQueryFileViewerMethod = {},
    ...args: unknown[]
  ) {
    if (typeof options === 'string') {
      return this.each((_index, element) => callControllerMethod(element, options, args))
    }

    return this.each((_index, element) => mountIntoElement(element, options))
  }

  plugin.__flyfishFileViewer = true
  jqueryInstance.fn.fileViewer = plugin
  return true
}

declare global {
  interface Window {
    jQuery?: JQueryStatic
    $?: JQueryStatic
  }

  interface JQuery {
    fileViewer(
      options?: JQueryFileViewerOptions | JQueryFileViewerMethod,
      ...args: unknown[]
    ): JQuery
  }
}

installJQueryFileViewer()

export default installJQueryFileViewer

import {
  createViewerControllerHandle,
  type ViewerController,
  type ViewerControllerHandle,
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

export interface FileViewerSvelteActionOptions extends ViewerMountOptions {
  /**
   * Clear the container before mounting a fresh native viewer. Enabled by default.
   */
  replace?: boolean
}

export interface FileViewerSvelteActionReturn {
  update(options?: FileViewerSvelteActionOptions): void
  destroy(): void
  getController: ViewerControllerHandle['getController']
  getApi: ViewerControllerHandle['getApi']
  load: ViewerControllerHandle['load']
  reload: ViewerControllerHandle['reload']
  downloadOriginalFile: ViewerControllerHandle['downloadOriginalFile']
  printRenderedHtml: ViewerControllerHandle['printRenderedHtml']
  exportRenderedHtml: ViewerControllerHandle['exportRenderedHtml']
  zoomIn: ViewerControllerHandle['zoomIn']
  zoomOut: ViewerControllerHandle['zoomOut']
  resetZoom: ViewerControllerHandle['resetZoom']
  searchDocument: ViewerControllerHandle['searchDocument']
  clearDocumentSearch: ViewerControllerHandle['clearDocumentSearch']
  nextSearchResult: ViewerControllerHandle['nextSearchResult']
  previousSearchResult: ViewerControllerHandle['previousSearchResult']
  collectDocumentAnchors: ViewerControllerHandle['collectDocumentAnchors']
  scrollToAnchor: ViewerControllerHandle['scrollToAnchor']
  scrollToLine: ViewerControllerHandle['scrollToLine']
  getDocumentTextChunks: ViewerControllerHandle['getDocumentTextChunks']
  getOperationAvailability: ViewerControllerHandle['getOperationAvailability']
  getZoomState: ViewerControllerHandle['getZoomState']
  getSearchState: ViewerControllerHandle['getSearchState']
  getState: ViewerControllerHandle['getState']
  subscribe: ViewerControllerHandle['subscribe']
}

const canUseDom = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const clearContainer = (node: HTMLElement) => {
  node.innerHTML = ''
}

export const mountViewer = (
  container: HTMLElement,
  options: ViewerMountOptions = {},
  coreOptions: ViewerCoreOptions = {}
) => mountCoreViewer(container, options, {
  registry: fileViewerCoreRendererRegistry,
  ...coreOptions
})

export const fileViewer = (
  node: HTMLElement,
  initialOptions: FileViewerSvelteActionOptions = {}
): FileViewerSvelteActionReturn => {
  let options = initialOptions
  let controller: ViewerController | null = null
  const handle = createViewerControllerHandle(() => controller, () => {
    controller?.destroy()
    controller = null
    if (options.replace !== false) {
      clearContainer(node)
    }
  })

  const mount = () => {
    if (!canUseDom()) {
      return
    }

    if (controller) {
      if (options.replace === false) {
        controller.update(options)
        return
      }

      controller.destroy()
      controller = null
    }

    if (options.replace !== false) {
      clearContainer(node)
    }

    const { replace: _replace, ...viewerOptions } = options
    controller = mountViewer(node, viewerOptions)
  }

  mount()

  return {
    update(nextOptions: FileViewerSvelteActionOptions = {}) {
      options = { ...options, ...nextOptions }
      if (controller) {
        const { replace: _replace, ...viewerOptions } = options
        controller.update(viewerOptions)
        return
      }
      mount()
    },
    destroy() {
      handle.destroy()
    },
    getController: handle.getController,
    getApi: handle.getApi,
    load: handle.load,
    reload: handle.reload,
    downloadOriginalFile: handle.downloadOriginalFile,
    printRenderedHtml: handle.printRenderedHtml,
    exportRenderedHtml: handle.exportRenderedHtml,
    zoomIn: handle.zoomIn,
    zoomOut: handle.zoomOut,
    resetZoom: handle.resetZoom,
    searchDocument: handle.searchDocument,
    clearDocumentSearch: handle.clearDocumentSearch,
    nextSearchResult: handle.nextSearchResult,
    previousSearchResult: handle.previousSearchResult,
    collectDocumentAnchors: handle.collectDocumentAnchors,
    scrollToAnchor: handle.scrollToAnchor,
    scrollToLine: handle.scrollToLine,
    getDocumentTextChunks: handle.getDocumentTextChunks,
    getOperationAvailability: handle.getOperationAvailability,
    getZoomState: handle.getZoomState,
    getSearchState: handle.getSearchState,
    getState: handle.getState,
    subscribe: handle.subscribe
  }
}

export default fileViewer

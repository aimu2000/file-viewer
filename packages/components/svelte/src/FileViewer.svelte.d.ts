import type { SvelteComponentTyped } from 'svelte'
import type {
  ViewerController,
  ViewerControllerHandle,
  ViewerEvent,
  ViewerMountOptions,
  ViewerStateListener,
} from './controller.js'

export interface FileViewerSvelteProps extends ViewerMountOptions {
  className?: string
  containerStyle?: string
}

export interface FileViewerSvelteEvents {
  viewerEvent: CustomEvent<ViewerEvent>
}

export interface FileViewerSvelteHandle extends ViewerControllerHandle {}

export default class FileViewer extends SvelteComponentTyped<
  FileViewerSvelteProps,
  FileViewerSvelteEvents,
  Record<string, never>
> implements FileViewerSvelteHandle {
  getController(): ViewerController | null
  getApi(): ReturnType<ViewerController['getApi']>
  load(options: ViewerMountOptions): Promise<void>
  update(options?: ViewerMountOptions): Promise<void>
  reload(): Promise<void>
  downloadOriginalFile(): ReturnType<ViewerControllerHandle['downloadOriginalFile']>
  printRenderedHtml(): ReturnType<ViewerControllerHandle['printRenderedHtml']>
  exportRenderedHtml(): ReturnType<ViewerControllerHandle['exportRenderedHtml']>
  zoomIn(): ReturnType<ViewerControllerHandle['zoomIn']>
  zoomOut(): ReturnType<ViewerControllerHandle['zoomOut']>
  resetZoom(): ReturnType<ViewerControllerHandle['resetZoom']>
  searchDocument(query: string): ReturnType<ViewerControllerHandle['searchDocument']>
  clearDocumentSearch(): ReturnType<ViewerControllerHandle['clearDocumentSearch']>
  nextSearchResult(): ReturnType<ViewerControllerHandle['nextSearchResult']>
  previousSearchResult(): ReturnType<ViewerControllerHandle['previousSearchResult']>
  collectDocumentAnchors(): ReturnType<ViewerControllerHandle['collectDocumentAnchors']>
  scrollToAnchor(anchor: Parameters<ViewerControllerHandle['scrollToAnchor']>[0]): ReturnType<ViewerControllerHandle['scrollToAnchor']>
  scrollToLine(line: number): ReturnType<ViewerControllerHandle['scrollToLine']>
  getDocumentTextChunks(): ReturnType<ViewerControllerHandle['getDocumentTextChunks']>
  getOperationAvailability(): ReturnType<ViewerControllerHandle['getOperationAvailability']>
  getZoomState(): ReturnType<ViewerControllerHandle['getZoomState']>
  getSearchState(): ReturnType<ViewerControllerHandle['getSearchState']>
  getState(): ReturnType<ViewerControllerHandle['getState']>
  subscribe(listener: ViewerStateListener): ReturnType<ViewerControllerHandle['subscribe']>
  destroy(): void
}

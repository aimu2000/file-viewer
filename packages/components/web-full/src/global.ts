import {
  createViewerControllerHandle,
  defineFileViewerElement,
  FileViewerElement,
  FILE_VIEWER_ELEMENT_TAG,
  FileViewerFullElement,
  fileViewerFullPreset,
  getDefaultFullAssetBaseUrl,
  mountViewer,
  setDefaultFullAssetBaseUrl,
  withFullMountOptions,
  withFullViewerOptions
} from './index'

const FlyfishFileViewerWebFull = {
  createViewerControllerHandle,
  defineFileViewerElement,
  FileViewerElement,
  FileViewerFullElement,
  FILE_VIEWER_ELEMENT_TAG,
  fileViewerFullPreset,
  getDefaultFullAssetBaseUrl,
  mountViewer,
  setDefaultFullAssetBaseUrl,
  withFullMountOptions,
  withFullViewerOptions
}

type FlyfishFileViewerWebFullGlobal = typeof FlyfishFileViewerWebFull

declare global {
  interface Window {
    FlyfishFileViewerWebFull?: FlyfishFileViewerWebFullGlobal
  }
}

if (typeof window !== 'undefined') {
  window.FlyfishFileViewerWebFull = FlyfishFileViewerWebFull
  defineFileViewerElement()
}

export {
  createViewerControllerHandle,
  defineFileViewerElement,
  FileViewerElement,
  FileViewerFullElement,
  FILE_VIEWER_ELEMENT_TAG,
  fileViewerFullPreset,
  getDefaultFullAssetBaseUrl,
  mountViewer,
  setDefaultFullAssetBaseUrl,
  withFullMountOptions,
  withFullViewerOptions
}

export default FlyfishFileViewerWebFull

import allRenderers from '@file-viewer/preset-all'
import {
  FileViewerLegacy as BaseFileViewerLegacy,
  useFileViewer as useBaseFileViewer,
  type FileViewerLegacyHandle,
  type FileViewerLegacyProps,
  type UseFileViewerResult,
  type ViewerMountOptions,
  type ViewerOptions
} from '@file-viewer/react-legacy'
import { forwardRef, useMemo } from 'react'

export * from '@file-viewer/react-legacy'

export const fileViewerFullPreset = allRenderers

export function withFullViewerOptions(options: ViewerOptions = {}): ViewerOptions {
  const { preset = allRenderers, rendererMode = 'replace', ...rest } = options
  return {
    ...rest,
    preset,
    rendererMode,
    autoRenderers: rest.autoRenderers ?? true
  }
}

export function withFullMountOptions(options: ViewerMountOptions = {}): ViewerMountOptions {
  return {
    ...options,
    options: withFullViewerOptions(options.options)
  }
}

export const FileViewerLegacy = forwardRef<FileViewerLegacyHandle, FileViewerLegacyProps>((props, ref) => {
  const { options, ...rest } = props
  const fullOptions = useMemo(() => withFullViewerOptions(options), [options])

  return (
    <BaseFileViewerLegacy
      {...rest}
      ref={ref}
      options={fullOptions}
    />
  )
})

FileViewerLegacy.displayName = 'FileViewerLegacyFull'

export const FileViewer = FileViewerLegacy

export const useFileViewer = (
  options: ViewerMountOptions = {}
): UseFileViewerResult => {
  const fullOptions = useMemo(() => withFullMountOptions(options), [options])
  return useBaseFileViewer(fullOptions)
}

export default FileViewerLegacy

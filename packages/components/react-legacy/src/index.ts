import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes
} from 'react'
import {
  createViewerControllerHandle,
  mountViewer,
  type ViewerController,
  type ViewerControllerHandle,
  type ViewerMountOptions,
  type ViewerCoreOptions,
  type ViewerEvent,
  type ViewerEventHandler,
  type ViewerState
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

export interface FileViewerLegacyHandle extends ViewerControllerHandle {}

export interface FileViewerLegacyProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    ViewerMountOptions {}

const defaultContainerStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  minHeight: 0
}

const viewerCoreOptions: ViewerCoreOptions = {
  registry: fileViewerCoreRendererRegistry
}

const createInitialViewerState = (): ViewerState => ({
  loading: false,
  ready: false,
  error: null,
  lastEvent: null,
  lifecycle: null,
  availability: null,
  search: null,
  zoom: null,
  location: null
})

const destroyController = (
  controllerRef: React.MutableRefObject<ViewerController | null>,
  container: HTMLDivElement | null
) => {
  controllerRef.current?.destroy()
  controllerRef.current = null
  if (container) {
    container.innerHTML = ''
  }
}

export const FileViewerLegacy = forwardRef<FileViewerLegacyHandle, FileViewerLegacyProps>((props, ref) => {
  const {
    url,
    file,
    buffer,
    name,
    filename,
    type,
    size,
    options,
    onEvent,
    onStateChange,
    style,
    ...containerProps
  } = props

  const containerRef = useRef<HTMLDivElement | null>(null)
  const controllerRef = useRef<ViewerController | null>(null)

  const viewerOptions = useMemo<ViewerMountOptions>(() => ({
    url,
    file,
    buffer,
    name,
    filename,
    type,
    size,
    options,
    onEvent,
    onStateChange
  }), [url, file, buffer, name, filename, type, size, options, onEvent, onStateChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container || controllerRef.current) {
      return undefined
    }

    controllerRef.current = mountViewer(container, viewerOptions, viewerCoreOptions)
    return () => destroyController(controllerRef, container)
  }, [])

  useEffect(() => {
    void controllerRef.current?.update(viewerOptions)
  }, [viewerOptions])

  useImperativeHandle(ref, () => createViewerControllerHandle(
    () => controllerRef.current,
    () => destroyController(controllerRef, containerRef.current)
  ), [])

  return React.createElement('div', {
    ...containerProps,
    ref: containerRef,
    style: { ...defaultContainerStyle, ...style }
  })
})

FileViewerLegacy.displayName = 'FileViewerLegacy'

export const FileViewer = FileViewerLegacy

export interface UseFileViewerStateResult {
  state: ViewerState;
  onStateChange: NonNullable<ViewerMountOptions['onStateChange']>;
  resetState(): void;
}

export const useFileViewerState = (
  onEvent?: ViewerEventHandler
): UseFileViewerStateResult => {
  const [state, setState] = useState<ViewerState>(() => createInitialViewerState())

  const onStateChange = useCallback((nextState: ViewerState, event?: ViewerEvent) => {
    setState(nextState)
    if (event) {
      onEvent?.(event)
    }
  }, [onEvent])

  const resetState = useCallback(() => {
    setState(createInitialViewerState())
  }, [])

  return {
    state,
    onStateChange,
    resetState
  }
}

export interface UseFileViewerResult {
  ref: React.MutableRefObject<FileViewerLegacyHandle | null>;
  props: ViewerMountOptions;
  state: ViewerState;
  handle: ViewerControllerHandle;
  resetState(): void;
}

export const useFileViewer = (
  options: ViewerMountOptions = {}
): UseFileViewerResult => {
  const ref = useRef<FileViewerLegacyHandle | null>(null)
  const {
    onEvent,
    ...viewerOptions
  } = options
  const {
    state,
    onStateChange,
    resetState
  } = useFileViewerState(onEvent)

  const props = useMemo<ViewerMountOptions>(() => ({
    ...viewerOptions,
    onStateChange
  }), [viewerOptions, onStateChange])

  const handle = useMemo<ViewerControllerHandle>(() => createViewerControllerHandle(
    () => ref.current?.getController() ?? null,
    () => ref.current?.destroy()
  ), [])

  return {
    ref,
    props,
    state,
    handle,
    resetState
  }
}

export default FileViewerLegacy

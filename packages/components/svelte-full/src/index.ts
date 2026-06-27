import allRenderers from '@file-viewer/preset-all'
import {
  fileViewer as baseFileViewer,
  mountViewer as mountBaseViewer,
  type FileViewerSvelteActionOptions,
  type FileViewerSvelteActionReturn,
  type ViewerController,
  type ViewerMountOptions,
  type ViewerOptions
} from '@file-viewer/svelte/action'

export * from '@file-viewer/svelte/action'

export const fileViewerFullPreset = allRenderers

type ViewerCoreOptions = NonNullable<Parameters<typeof mountBaseViewer>[2]>

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

const withFullActionOptions = (
  options: FileViewerSvelteActionOptions = {}
): FileViewerSvelteActionOptions => {
  return {
    ...options,
    options: withFullViewerOptions(options.options)
  }
}

export const mountViewer = (
  container: HTMLElement,
  options: ViewerMountOptions = {},
  coreOptions: ViewerCoreOptions = {}
): ViewerController => mountBaseViewer(container, withFullMountOptions(options), coreOptions)

export const fileViewer = (
  node: HTMLElement,
  initialOptions: FileViewerSvelteActionOptions = {}
): FileViewerSvelteActionReturn => {
  const action = baseFileViewer(node, withFullActionOptions(initialOptions))

  return {
    ...action,
    update(options: FileViewerSvelteActionOptions = {}) {
      action.update(withFullActionOptions(options))
    },
    load(options: ViewerMountOptions) {
      return action.load(withFullMountOptions(options))
    }
  }
}

export default fileViewer

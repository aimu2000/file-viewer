import allRenderers from '@file-viewer/preset-all'
import {
  FileViewer as BaseFileViewer,
  type FileViewerVue26PluginOptions,
  type ViewerMountOptions,
  type ViewerOptions
} from '@file-viewer/vue2.6'
import type { PluginObject, VueConstructor } from 'vue'

export * from '@file-viewer/vue2.6'

export const fileViewerFullPreset = allRenderers

type BaseFileViewerMethods = {
  getViewerOptions(this: unknown): ViewerMountOptions
  load(this: unknown, options: ViewerMountOptions): Promise<void>
  update(this: unknown, options?: ViewerMountOptions): Promise<void>
}

const baseMethods = (BaseFileViewer as unknown as {
  options: {
    methods: BaseFileViewerMethods
  }
}).options.methods

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

export const FileViewer = (BaseFileViewer as unknown as VueConstructor).extend({
  name: 'FileViewerFull',
  methods: {
    getViewerOptions(): ViewerMountOptions {
      return withFullMountOptions(baseMethods.getViewerOptions.call(this))
    },
    load(options: ViewerMountOptions) {
      return baseMethods.load.call(this, withFullMountOptions(options))
    },
    update(options?: ViewerMountOptions) {
      return baseMethods.update.call(this, withFullMountOptions(options))
    }
  }
})

export const install = (
  VueCtor: VueConstructor,
  options: FileViewerVue26PluginOptions = {}
) => {
  VueCtor.component(options.componentName || 'FileViewer', FileViewer)
}

export const FileViewerPlugin: PluginObject<FileViewerVue26PluginOptions> = {
  install
}

export default FileViewerPlugin

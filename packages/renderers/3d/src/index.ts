import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const modelDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'model'
) as RendererDefinition | undefined;

if (!modelDefinition) {
  throw new Error('@file-viewer/renderer-3d could not locate the core 3D model renderer definition.');
}

export const modelRendererDefinition = modelDefinition;

export const renderFileViewerModel: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context
) => import('./model.js').then(({ default: renderModel }) => renderModel(buffer, target, type, context));

export const modelRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-3d',
  label: 'Flyfish File Viewer 3D model renderer',
  definitions: [modelRendererDefinition],
  handlers: [{
    rendererId: modelRendererDefinition.id,
    handler: renderFileViewerModel,
  }],
};

export default modelRenderer;

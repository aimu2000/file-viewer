import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const dataDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'data-asset'
) as RendererDefinition | undefined;

if (!dataDefinition) {
  throw new Error('@file-viewer/renderer-data could not locate the shared data asset renderer definition.');
}

export const dataRendererDefinition = dataDefinition;

export const renderFileViewerData: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context
) => import('./data.js').then(({ default: renderDataAsset }) => renderDataAsset(buffer, target, type, context));

export const dataRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-data',
  label: 'Flyfish File Viewer data asset renderer',
  definitions: [dataRendererDefinition],
  handlers: [{
    rendererId: dataRendererDefinition.id,
    handler: renderFileViewerData,
  }],
};

export default dataRenderer;

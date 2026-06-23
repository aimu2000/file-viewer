import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const typstDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'typst'
) as RendererDefinition | undefined;

if (!typstDefinition) {
  throw new Error('@file-viewer/renderer-typst could not locate the core Typst renderer definition.');
}

export const typstRendererDefinition = typstDefinition;

export const renderFileViewerTypst: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context
) => import('./typst.js').then(({ default: renderTypst }) => renderTypst(buffer, target, type, context));

export const typstRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-typst',
  label: 'Flyfish File Viewer Typst renderer',
  definitions: [typstRendererDefinition],
  handlers: [{
    rendererId: typstRendererDefinition.id,
    handler: renderFileViewerTypst,
  }],
};

export default typstRenderer;

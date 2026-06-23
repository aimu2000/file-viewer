import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const mindmapDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'mindmap'
) as RendererDefinition | undefined;

if (!mindmapDefinition) {
  throw new Error('@file-viewer/renderer-mindmap could not locate the core mind map renderer definition.');
}

export const mindmapRendererDefinition = mindmapDefinition;

export const renderFileViewerMindMap: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context
) => import('./xmind.js').then(({ default: renderXMind }) => renderXMind(buffer, target, type, context));

export const mindmapRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-mindmap',
  label: 'Flyfish File Viewer mind map renderer',
  definitions: [mindmapRendererDefinition],
  handlers: [{
    rendererId: mindmapRendererDefinition.id,
    handler: renderFileViewerMindMap,
  }],
};

export default mindmapRenderer;

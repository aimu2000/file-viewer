import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const presentationDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'office-presentation'
) as RendererDefinition | undefined;

if (!presentationDefinition) {
  throw new Error('@file-viewer/renderer-presentation could not locate the core presentation renderer definition.');
}

export const presentationRendererDefinition = presentationDefinition;

export const renderFileViewerPresentation: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context
) => import('./pptx.js').then(({ default: renderPptx }) => renderPptx(buffer, target, type, context));

export const presentationRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-presentation',
  label: 'Flyfish File Viewer presentation renderer',
  definitions: [presentationRendererDefinition],
  handlers: [{
    rendererId: presentationRendererDefinition.id,
    handler: renderFileViewerPresentation,
  }],
};

export default presentationRenderer;

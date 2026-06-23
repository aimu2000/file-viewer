import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const ofdDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'ofd'
) as RendererDefinition | undefined;

if (!ofdDefinition) {
  throw new Error('@file-viewer/renderer-ofd could not locate the core OFD renderer definition.');
}

export const ofdRendererDefinition = ofdDefinition;

export const renderFileViewerOfd: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  _type,
  context
) => import('./ofd.js').then(({ default: renderOfd }) => renderOfd(buffer, target, context));

export const ofdRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-ofd',
  label: 'Flyfish File Viewer OFD renderer',
  definitions: [ofdRendererDefinition],
  handlers: [{
    rendererId: ofdRendererDefinition.id,
    handler: renderFileViewerOfd,
  }],
};

export default ofdRenderer;

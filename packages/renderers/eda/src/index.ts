import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const edaDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'eda'
) as RendererDefinition | undefined;

if (!edaDefinition) {
  throw new Error('@file-viewer/renderer-eda could not locate the shared EDA renderer definition.');
}

export const edaRendererDefinition = edaDefinition;

export const renderFileViewerEda: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context
) => import('./eda.js').then(({ default: renderEda }) => renderEda(buffer, target, type, context));

export const edaRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-eda',
  label: 'Flyfish File Viewer EDA renderer',
  definitions: [edaRendererDefinition],
  handlers: [{
    rendererId: edaRendererDefinition.id,
    handler: renderFileViewerEda,
  }],
};

export {
  parseEdaFile,
  type EdaDomainRole,
  type EdaEntity,
  type EdaFileType,
  type EdaLayoutElement,
  type EdaLayoutPreview,
  type EdaParseResult,
  type EdaStreamKind,
  type EdaStreamView,
  type EdaTreeNode,
} from './edaParser.js';

export default edaRenderer;

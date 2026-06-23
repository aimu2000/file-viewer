import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const wordRendererIds = [
  'office-word-openxml',
  'office-word-binary',
  'open-document',
] as const;

const wordDefinitions = DEFAULT_RENDERER_DEFINITIONS.filter(definition =>
  wordRendererIds.includes(definition.id as typeof wordRendererIds[number])
) as RendererDefinition[];

if (wordDefinitions.length !== wordRendererIds.length) {
  throw new Error('@file-viewer/renderer-word could not locate the shared Word renderer definitions.');
}

export const wordRendererDefinitions = wordDefinitions;

export const renderFileViewerWordDocx: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  _type,
  context
) => import('./wordDocx.js').then(({ default: renderWordDocx }) => renderWordDocx(buffer, target, context));

export const renderFileViewerWordDoc: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  _type,
  context
) => import('./wordDoc.js').then(({ default: renderWordDoc }) => renderWordDoc(buffer, target, context));

export const renderFileViewerOpenDocument: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type
) => import('./openDocument.js').then(({ default: renderOpenDocument }) => renderOpenDocument(buffer, target, type));

export const wordRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-word',
  label: 'Flyfish File Viewer Word renderer',
  definitions: wordRendererDefinitions,
  handlers: [
    {
      rendererId: 'office-word-openxml',
      handler: renderFileViewerWordDocx,
    },
    {
      rendererId: 'office-word-binary',
      handler: renderFileViewerWordDoc,
    },
    {
      rendererId: 'open-document',
      handler: renderFileViewerOpenDocument,
    },
  ],
};

export default wordRenderer;

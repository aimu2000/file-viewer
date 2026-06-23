import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const textRendererIds = ['code', 'markdown'] as const;

const textDefinitions = DEFAULT_RENDERER_DEFINITIONS.filter(definition =>
  textRendererIds.includes(definition.id as typeof textRendererIds[number])
) as RendererDefinition[];

if (textDefinitions.length !== textRendererIds.length) {
  throw new Error('@file-viewer/renderer-text could not locate the shared code/markdown format definitions.');
}

export const textRendererDefinitions = textDefinitions;

export const renderFileViewerCode: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type
) => import('./code.js').then(({ default: renderCode }) => renderCode(buffer, target, type));

export const renderFileViewerMarkdown: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target
) => import('./markdown.js').then(({ default: renderMarkdown }) => renderMarkdown(buffer, target));

export const textRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-text',
  label: 'Flyfish File Viewer text renderer',
  definitions: textRendererDefinitions,
  handlers: [
    {
      rendererId: 'code',
      handler: renderFileViewerCode,
    },
    {
      rendererId: 'markdown',
      handler: renderFileViewerMarkdown,
    },
  ],
};

export default textRenderer;

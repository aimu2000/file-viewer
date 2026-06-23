import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const epubDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'epub'
) as RendererDefinition | undefined;
const umdDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'umd'
) as RendererDefinition | undefined;

if (!epubDefinition || !umdDefinition) {
  throw new Error('@file-viewer/renderer-ebook could not locate the shared ebook format definitions.');
}

export const ebookRendererDefinition = epubDefinition;
export const umdRendererDefinition = umdDefinition;

export const renderFileViewerEpub: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target
) => import('./epub.js').then(({ default: renderEpub }) => renderEpub(buffer, target));

export const renderFileViewerUmd: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target
) => import('./umd.js').then(({ default: renderUmd }) => renderUmd(buffer, target));

export const ebookRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-ebook',
  label: 'Flyfish File Viewer ebook renderer',
  definitions: [ebookRendererDefinition, umdRendererDefinition],
  handlers: [
    {
      rendererId: ebookRendererDefinition.id,
      handler: renderFileViewerEpub,
    },
    {
      rendererId: umdRendererDefinition.id,
      handler: renderFileViewerUmd,
    },
  ],
};

export default ebookRenderer;

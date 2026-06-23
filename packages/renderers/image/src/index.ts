import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const imageDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'image'
) as RendererDefinition | undefined;

if (!imageDefinition) {
  throw new Error('@file-viewer/renderer-image could not locate the core image renderer definition.');
}

export const imageRendererDefinition = imageDefinition;

export const renderFileViewerImage: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type
) => import('./image.js').then(({ default: renderImage }) => renderImage(buffer, target, type));

export const imageRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-image',
  label: 'Flyfish File Viewer image renderer',
  definitions: [imageRendererDefinition],
  handlers: [{
    rendererId: imageRendererDefinition.id,
    handler: renderFileViewerImage,
  }],
};

export default imageRenderer;

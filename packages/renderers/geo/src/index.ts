import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const geoDefinition = DEFAULT_RENDERER_DEFINITIONS.find(
  definition => definition.id === 'geo'
) as RendererDefinition | undefined;

if (!geoDefinition) {
  throw new Error('@file-viewer/renderer-geo could not locate the core geospatial renderer definition.');
}

export const geoRendererDefinition = geoDefinition;

export const renderFileViewerGeo: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type
) => import('./geo.js').then(({ default: renderGeo }) => renderGeo(buffer, target, type));

export const geoRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-geo',
  label: 'Flyfish File Viewer geospatial renderer',
  definitions: [geoRendererDefinition],
  handlers: [{
    rendererId: geoRendererDefinition.id,
    handler: renderFileViewerGeo,
  }],
};

export default geoRenderer;

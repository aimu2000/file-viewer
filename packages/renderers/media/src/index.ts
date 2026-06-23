import {
  DEFAULT_RENDERER_DEFINITIONS,
  type FileRenderContext,
  type FileRenderHandler,
  type FileViewerRenderedInstance,
  type FileViewerRendererPlugin,
  type RendererDefinition,
} from '@file-viewer/core';

const mediaRendererIds = ['audio', 'video'] as const;

const mediaDefinitions = DEFAULT_RENDERER_DEFINITIONS.filter(definition =>
  mediaRendererIds.includes(definition.id as typeof mediaRendererIds[number])
) as RendererDefinition[];

if (mediaDefinitions.length !== mediaRendererIds.length) {
  throw new Error('@file-viewer/renderer-media could not locate the shared audio/video format definitions.');
}

export const mediaRendererDefinitions = mediaDefinitions;

export const renderFileViewerAudio: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type
) => import('./audio.js').then(({ default: renderAudio }) => renderAudio(buffer, target, type));

export const renderFileViewerVideo: FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement> = (
  buffer,
  target,
  type,
  context?: FileRenderContext
) => import('./video.js').then(({ default: renderVideo }) => renderVideo(buffer, target, type, context));

export const mediaRenderer: FileViewerRendererPlugin<FileRenderHandler<FileViewerRenderedInstance, HTMLDivElement>> = {
  id: 'file-viewer-renderer-media',
  label: 'Flyfish File Viewer media renderer',
  definitions: mediaRendererDefinitions,
  handlers: [
    {
      rendererId: 'audio',
      handler: renderFileViewerAudio,
    },
    {
      rendererId: 'video',
      handler: renderFileViewerVideo,
    },
  ],
};

export default mediaRenderer;

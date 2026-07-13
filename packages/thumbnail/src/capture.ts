import type { ResolvedFileViewerThumbnailOptions } from './types.js';
import { FileViewerThumbnailError } from './types.js';

export interface ReusableFileViewerDomCaptureContext {
  target?: Element;
  key?: string;
  context?: unknown;
  destroy?: (context: unknown) => void;
}

export const destroyReusableFileViewerDomCaptureContext = (
  reusable?: ReusableFileViewerDomCaptureContext
) => {
  if (reusable?.context) {
    reusable.destroy?.(reusable.context);
  }
  if (reusable) {
    reusable.target = undefined;
    reusable.key = undefined;
    reusable.context = undefined;
    reusable.destroy = undefined;
  }
};

const HIDDEN_CAPTURE_CLASSES = new Set([
  'file-viewer-toolbar',
  'archive-preview-toolbar',
  'pdf-toolbar',
  'pdf-nav',
  'epub-toolbar',
  'epub-toc',
  'sheet-loading',
]);

const mimeTypeForFormat = (format: ResolvedFileViewerThumbnailOptions['format']) => (
  format === 'png' ? 'image/png' : `image/${format}`
);

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: ResolvedFileViewerThumbnailOptions['format'],
  quality: number
) => new Promise<Blob>((resolve, reject) => {
  try {
    canvas.toBlob(blob => {
      if (blob) {
        const expectedMimeType = mimeTypeForFormat(format);
        if (blob.type !== expectedMimeType) {
          reject(new FileViewerThumbnailError(
            'capture-unavailable',
            `This browser cannot encode ${expectedMimeType} thumbnails.`
          ));
        } else {
          resolve(blob);
        }
      } else {
        reject(new FileViewerThumbnailError('capture-failed', 'Canvas encoding returned no data.'));
      }
    }, mimeTypeForFormat(format), quality);
  } catch (error) {
    reject(new FileViewerThumbnailError('tainted-canvas', 'Canvas pixels cannot be read.', error));
  }
});

const loadBlobImage = async (documentRef: Document, blob: Blob) => {
  const view = documentRef.defaultView;
  if (view?.createImageBitmap) {
    try {
      return await view.createImageBitmap(blob);
    } catch {
      // Some browsers expose createImageBitmap but reject otherwise valid image
      // formats. The image element decoder supports a wider set of inputs.
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = documentRef.createElement('img');
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new FileViewerThumbnailError('capture-failed', 'Captured image could not be decoded.'));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const getImageSize = (image: CanvasImageSource) => {
  if ('naturalWidth' in image) {
    return { width: image.naturalWidth, height: image.naturalHeight };
  }
  if ('videoWidth' in image) {
    return { width: image.videoWidth, height: image.videoHeight };
  }
  return {
    width: 'width' in image ? Number(image.width) : 0,
    height: 'height' in image ? Number(image.height) : 0,
  };
};

const closeImageSource = (image: CanvasImageSource) => {
  if ('close' in image && typeof image.close === 'function') {
    image.close();
  }
};

const assertCanvasNotBlank = (canvas: HTMLCanvasElement, background: string) => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new FileViewerThumbnailError('capture-unavailable', 'A 2D canvas context is required.');
  }
  try {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const probe = canvas.ownerDocument.createElement('canvas').getContext('2d');
    if (!probe) {
      return;
    }
    probe.fillStyle = background;
    probe.fillRect(0, 0, 1, 1);
    const base = probe.getImageData(0, 0, 1, 1).data;
    let differentPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const distance = Math.abs(pixels[index] - base[0]) +
        Math.abs(pixels[index + 1] - base[1]) +
        Math.abs(pixels[index + 2] - base[2]);
      if (pixels[index + 3] > 8 && distance > 24) {
        differentPixels += 1;
        if (differentPixels >= 8) {
          return;
        }
      }
    }
  } catch (error) {
    throw new FileViewerThumbnailError('tainted-canvas', 'Thumbnail pixels cannot be inspected.', error);
  }
  throw new FileViewerThumbnailError('empty-output', 'The renderer produced an empty thumbnail.');
};

export const normalizeThumbnailBlob = async (
  documentRef: Document,
  source: Blob,
  options: ResolvedFileViewerThumbnailOptions
) => {
  const image = await loadBlobImage(documentRef, source);
  const sourceSize = getImageSize(image);
  if (!sourceSize.width || !sourceSize.height) {
    closeImageSource(image);
    throw new FileViewerThumbnailError('empty-output', 'The captured image has no dimensions.');
  }

  const canvas = documentRef.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const context = canvas.getContext('2d');
  if (!context) {
    closeImageSource(image);
    throw new FileViewerThumbnailError('capture-unavailable', 'A 2D canvas context is required.');
  }
  try {
    context.fillStyle = options.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const scale = options.fit === 'cover'
      ? Math.max(options.width / sourceSize.width, options.height / sourceSize.height)
      : Math.min(options.width / sourceSize.width, options.height / sourceSize.height);
    const width = sourceSize.width * scale;
    const height = sourceSize.height * scale;
    context.drawImage(image, (options.width - width) / 2, (options.height - height) / 2, width, height);
  } finally {
    closeImageSource(image);
  }
  assertCanvasNotBlank(canvas, options.background);
  return canvasToBlob(canvas, options.format, options.quality);
};

const captureCanvas = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
  try {
    canvas.toBlob(blob => blob
      ? resolve(blob)
      : reject(new FileViewerThumbnailError('capture-failed', 'Canvas capture returned no data.')), 'image/png');
  } catch (error) {
    reject(new FileViewerThumbnailError('tainted-canvas', 'Canvas capture was blocked by cross-origin data.', error));
  }
});

export const captureThumbnailElement = async (
  documentRef: Document,
  target: Element,
  options: ResolvedFileViewerThumbnailOptions,
  reusable?: ReusableFileViewerDomCaptureContext
) => {
  const view = documentRef.defaultView;
  if (!view) {
    throw new FileViewerThumbnailError('browser-required', 'Thumbnail capture requires a browser window.');
  }
  if (target instanceof view.HTMLIFrameElement) {
    throw new FileViewerThumbnailError('capture-unavailable', 'Iframe content requires a renderer thumbnail adapter.');
  }
  if (target instanceof view.HTMLCanvasElement) {
    return normalizeThumbnailBlob(documentRef, await captureCanvas(target), options);
  }

  try {
    const { createContext, destroyContext, domToBlob } = await import('modern-screenshot');
    const bounds = target.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      throw new FileViewerThumbnailError('empty-output', 'The thumbnail target has no layout dimensions.');
    }
    const contextOptions = {
      backgroundColor: options.background,
      width: Math.ceil(bounds.width),
      height: Math.ceil(bounds.height),
      scale: 1,
      filter(node: Node) {
        if (!(node instanceof view.HTMLElement)) {
          return true;
        }
        const role = node.getAttribute('role');
        const isInteractive = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(node.tagName) ||
          node.tagName === 'NAV' || role === 'button' || role === 'toolbar' ||
          role === 'navigation' || role === 'progressbar';
        return !isInteractive &&
          !node.hasAttribute('data-thumbnail-exclude') &&
          !Array.from(node.classList).some(className => HIDDEN_CAPTURE_CLASSES.has(className)) &&
          node.getAttribute('aria-busy') !== 'true';
      },
    };
    const contextKey = `${contextOptions.width}:${contextOptions.height}:${options.background}`;
    if (reusable && (reusable.target !== target || reusable.key !== contextKey)) {
      destroyReusableFileViewerDomCaptureContext(reusable);
    }
    if (reusable && !reusable.context) {
      reusable.target = target;
      reusable.key = contextKey;
      reusable.context = await createContext(target, { ...contextOptions, autoDestruct: false });
      reusable.destroy = context => destroyContext(context as Parameters<typeof destroyContext>[0]);
    }
    const blob = reusable?.context
      ? await domToBlob(reusable.context as Parameters<typeof domToBlob>[0])
      : await domToBlob(target, contextOptions);
    if (!blob) {
      throw new FileViewerThumbnailError('capture-failed', 'DOM capture returned no data.');
    }
    return normalizeThumbnailBlob(documentRef, blob, options);
  } catch (error) {
    if (error instanceof FileViewerThumbnailError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    const code = /security|taint|cross.origin/i.test(message) ? 'tainted-canvas' : 'capture-failed';
    throw new FileViewerThumbnailError(code, `Unable to capture renderer output: ${message}`, error);
  }
};

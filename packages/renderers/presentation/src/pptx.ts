import { PptxViewer, RECOMMENDED_ZIP_LIMITS } from '@file-viewer/pptx';
import {
  createFileViewerTranslator,
  createFileViewerZoomChangeEmitter,
  normalizeFileViewerErrorMessage,
  registerFileViewerZoomProvider,
  resolveFileViewerLocale,
  waitForFileViewerNextPaint,
  unregisterFileViewerZoomProvider,
} from '@file-viewer/core';
import type {
  FileRenderContext,
  FileRenderExportAdapter,
  FileViewerRenderedInstance,
  FileViewerZoomState,
} from '@file-viewer/core';
import type { PptxDiagnosticError } from '@file-viewer/pptx';

type PptxRenderState = 'loading' | 'ready' | 'error';

const pptxStyle = `
.pptx-viewer-shell{position:relative;box-sizing:border-box;min-height:100%;padding:24px 20px;background:#eef3f8;color:#1f2d3b;font-family:Aptos,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif}
.pptx-render-surface{min-height:240px}
.pptx-render-surface.is-loading{opacity:.72}
.pptx-loading{position:sticky;top:12px;z-index:3;box-sizing:border-box;display:inline-flex;align-items:center;gap:10px;margin:0 0 16px 50%;padding:10px 14px;border:1px solid rgba(42,94,144,.14);border-radius:999px;background:rgba(255,255,255,.92);color:#41556b;box-shadow:0 12px 32px rgba(24,44,64,.12);transform:translateX(-50%)}
.pptx-loading[hidden],.pptx-error[hidden]{display:none!important}
.pptx-loading-dot{width:9px;height:9px;border-radius:999px;background:#1f9d67;box-shadow:0 0 0 6px rgba(31,157,103,.13)}
.pptx-error{box-sizing:border-box;width:min(680px,calc(100% - 32px));margin:48px auto;padding:24px;border:1px solid rgba(28,43,58,.12);border-radius:14px;background:#fff;color:#1f2d3b;box-shadow:0 16px 42px rgba(25,42,54,.08)}
.pptx-error strong{display:block;margin-bottom:10px;font-size:18px}
.pptx-error p{margin:0;color:#607282;line-height:1.7}
[data-viewer-theme='dark'] .pptx-viewer-shell{background:#101820;color:#e5eef8}
[data-viewer-theme='dark'] .pptx-loading{border-color:rgba(148,163,184,.18);background:rgba(15,23,42,.9);color:#cbd5e1;box-shadow:0 18px 44px rgba(0,0,0,.26)}
[data-viewer-theme='dark'] .pptx-error{border-color:rgba(148,163,184,.18);background:#151f2b;color:#f8fafc;box-shadow:0 22px 56px rgba(0,0,0,.32)}
[data-viewer-theme='dark'] .pptx-error p{color:#94a3b8}
[data-viewer-theme='dark'] .pptx-render-surface .slide,[data-viewer-theme='dark'] .pptx-render-surface [data-slide-index]{color-scheme:only light;forced-color-adjust:none}
@media (prefers-color-scheme:dark){[data-viewer-theme='system'] .pptx-viewer-shell{background:#101820;color:#e5eef8}[data-viewer-theme='system'] .pptx-loading{border-color:rgba(148,163,184,.18);background:rgba(15,23,42,.9);color:#cbd5e1;box-shadow:0 18px 44px rgba(0,0,0,.26)}[data-viewer-theme='system'] .pptx-error{border-color:rgba(148,163,184,.18);background:#151f2b;color:#f8fafc;box-shadow:0 22px 56px rgba(0,0,0,.32)}[data-viewer-theme='system'] .pptx-error p{color:#94a3b8}[data-viewer-theme='system'] .pptx-render-surface .slide,[data-viewer-theme='system'] .pptx-render-surface [data-slide-index]{color-scheme:only light;forced-color-adjust:none}}
`;

const pptxPrintStyle = `
  .pptx-viewer-shell {
    background: #fff !important;
    padding: 0 !important;
  }
  .pptx-render-surface {
    display: block !important;
    overflow: visible !important;
  }
  .pptx-render-surface [data-slide-index] {
    break-after: page;
    page-break-after: always;
    margin: 0 auto !important;
  }
  .pptx-render-surface [data-slide-index]:last-child {
    break-after: auto;
    page-break-after: auto;
  }
`;

const createStyle = (documentRef: Document) => {
  const style = documentRef.createElement('style');
  style.textContent = pptxStyle;
  return style;
};

const createElement = <K extends keyof HTMLElementTagNameMap>(
  documentRef: Document,
  tagName: K,
  className?: string,
  text?: string
) => {
  const element = documentRef.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
};

const clampZoomPercent = (value: number) => {
  return Math.min(300, Math.max(25, Math.round(value)));
};

type PptxDiagnosticCopy = {
  zh: string;
  en: string;
};

type PptxDiagnosticErrorLike = Partial<PptxDiagnosticError> & {
  name?: string;
  code?: string;
  stage?: string;
  message?: string;
  detail?: string;
  hint?: string;
};

const pptxDiagnosticMessages: Record<string, PptxDiagnosticCopy> = {
  PPTX_FILE_EMPTY: {
    zh: '文件为空或过小，无法读取。',
    en: 'The file is empty or too small to read.',
  },
  PPTX_FILE_TOO_LARGE: {
    zh: '文件超过浏览器安全预览体积限制。',
    en: 'The file is larger than the browser-safe preview limit.',
  },
  PPTX_INVALID_ZIP: {
    zh: '文件不是有效的 PowerPoint OpenXML 压缩包。',
    en: 'The file is not a valid PowerPoint OpenXML package.',
  },
  PPTX_MISSING_CONTENT_TYPES: {
    zh: '文件缺少 [Content_Types].xml，无法识别内部结构。',
    en: 'The package is missing [Content_Types].xml, so its structure cannot be identified.',
  },
  PPTX_MISSING_PRESENTATION: {
    zh: '文件缺少 ppt/presentation.xml，无法读取幻灯片列表。',
    en: 'The package is missing ppt/presentation.xml, so the slide list cannot be read.',
  },
  PPTX_NO_SLIDES: {
    zh: '文件中没有找到可预览的幻灯片。',
    en: 'No previewable slides were found in the file.',
  },
  PPTX_MISSING_SLIDE: {
    zh: '文件缺少某一页幻灯片内容。',
    en: 'The package is missing one of the slide parts.',
  },
  PPTX_SLIDE_RENDER_FAILED: {
    zh: '某一页幻灯片解析失败。',
    en: 'One slide failed to parse.',
  },
  PPTX_WORKER_FAILED: {
    zh: 'PPTX Worker 启动或运行失败。',
    en: 'The PPTX Worker failed to start or run.',
  },
  PPTX_PARSE_FAILED: {
    zh: 'PPTX 文件解析失败。',
    en: 'The PPTX file could not be parsed.',
  },
};

const pptxDiagnosticFallbackHints: Record<string, PptxDiagnosticCopy> = {
  PPTX_INVALID_ZIP: {
    zh: '请确认接口返回的是原始 .pptx 二进制文件，而不是登录页、HTML/JSON 错误响应或被截断的内容。',
    en: 'Confirm that the response is the original .pptx binary, not a login page, HTML/JSON error response, or truncated download.',
  },
  PPTX_WORKER_FAILED: {
    zh: '请检查 presentation.workerUrl、Worker 文件路径、MIME 类型、CSP 和跨域策略。',
    en: 'Check presentation.workerUrl, the Worker file path, MIME type, CSP, and cross-origin policy.',
  },
  PPTX_NO_SLIDES: {
    zh: '请重新保存演示文稿，或检查包内是否存在 ppt/slides/slide*.xml。',
    en: 'Re-save the presentation, or check whether ppt/slides/slide*.xml exists inside the package.',
  },
};

const localizePptxDiagnosticCopy = (
  copy: PptxDiagnosticCopy | undefined,
  locale: string
) => {
  if (!copy) {
    return '';
  }
  return locale === 'zh-CN' ? copy.zh : copy.en;
};

const sanitizePptxDiagnosticText = (value: unknown) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/^Error:\s*/i, '').trim();
};

const isPptxDiagnosticErrorLike = (error: unknown): error is PptxDiagnosticErrorLike => {
  return Boolean(
    error &&
    typeof error === 'object' &&
    (
      (error as PptxDiagnosticErrorLike).name === 'PptxDiagnosticError' ||
      (error as PptxDiagnosticErrorLike).code ||
      (error as PptxDiagnosticErrorLike).stage
    )
  );
};

const classifyPptxErrorString = (message: string): PptxDiagnosticErrorLike | null => {
  const lower = message.toLowerCase();
  if (
    lower.includes('end of central directory') ||
    lower.includes('corrupt zip') ||
    lower.includes('invalid zip') ||
    lower.includes('not a zip') ||
    lower.includes('jszip')
  ) {
    return {
      name: 'PptxDiagnosticError',
      code: 'PPTX_INVALID_ZIP',
      stage: 'read-zip',
      detail: message,
    };
  }
  if (
    lower.includes('worker') ||
    lower.includes('script error') ||
    lower.includes('failed to construct') ||
    lower.includes('failed to load')
  ) {
    return {
      name: 'PptxDiagnosticError',
      code: 'PPTX_WORKER_FAILED',
      stage: 'worker-runtime',
      detail: message,
    };
  }
  if (lower.includes('[content_types].xml')) {
    return {
      name: 'PptxDiagnosticError',
      code: 'PPTX_MISSING_CONTENT_TYPES',
      stage: 'read-content-types',
      detail: message,
    };
  }
  if (lower.includes('ppt/presentation.xml')) {
    return {
      name: 'PptxDiagnosticError',
      code: 'PPTX_MISSING_PRESENTATION',
      stage: 'read-presentation',
      detail: message,
    };
  }
  if (lower.includes('slide') || lower.includes('ppt/slides/')) {
    return {
      name: 'PptxDiagnosticError',
      code: 'PPTX_SLIDE_RENDER_FAILED',
      stage: 'render-slide',
      detail: message,
    };
  }
  return null;
};

const formatPptxDiagnosticError = (
  error: PptxDiagnosticErrorLike,
  fallback: string,
  context?: FileRenderContext
) => {
  const locale = resolveFileViewerLocale(context?.options);
  const code = String(error.code || 'PPTX_PARSE_FAILED');
  const localizedReason = localizePptxDiagnosticCopy(pptxDiagnosticMessages[code], locale);
  const rawReason = sanitizePptxDiagnosticText(error.message);
  const reason = (
    locale === 'zh-CN'
      ? rawReason || localizedReason
      : localizedReason || rawReason
  ) || fallback;
  const detail = sanitizePptxDiagnosticText(error.detail);
  const hint = sanitizePptxDiagnosticText(error.hint) ||
    localizePptxDiagnosticCopy(pptxDiagnosticFallbackHints[code], locale);
  const stage = sanitizePptxDiagnosticText(error.stage);
  const separator = locale === 'zh-CN' ? '：' : ': ';
  const parts = [`${fallback}${separator}${reason}`];

  if (stage) {
    parts.push(locale === 'zh-CN' ? `阶段：${stage}` : `Stage: ${stage}`);
  }
  if (detail && detail !== reason) {
    parts.push(locale === 'zh-CN' ? `详情：${detail}` : `Detail: ${detail}`);
  }
  if (hint) {
    parts.push(locale === 'zh-CN' ? `建议：${hint}` : `Hint: ${hint}`);
  }
  return parts.join(locale === 'zh-CN' ? '；' : '; ');
};

const formatErrorMessage = (
  error: unknown,
  fallback: string,
  context?: FileRenderContext
) => {
  if (isPptxDiagnosticErrorLike(error)) {
    return formatPptxDiagnosticError(error, fallback, context);
  }
  if (error instanceof Error || typeof error === 'string') {
    const normalized = normalizeFileViewerErrorMessage(error, context?.options);
    const classified = classifyPptxErrorString(normalized);
    if (classified) {
      return formatPptxDiagnosticError(classified, fallback, context);
    }
    return normalized || fallback;
  }
  if (error === undefined || error === null) {
    return fallback;
  }
  try {
    const serialized = JSON.stringify(error) || '';
    if (serialized) {
      const classified = classifyPptxErrorString(serialized);
      if (classified) {
        return formatPptxDiagnosticError(classified, fallback, context);
      }
    }
    return serialized || fallback;
  } catch {
    return String(error || fallback);
  }
};

export const resolvePptxPreviewErrorMessage = formatErrorMessage;

const buildExportAdapter = (targetWindow?: Window | null): FileRenderExportAdapter => ({
  print: true,
  exportHtml: true,
  includeDocumentStyles: true,
  beforeSnapshot: () => waitForFileViewerNextPaint(targetWindow || undefined),
  printStyle: pptxPrintStyle,
});

export default async function renderPptx(
  buffer: ArrayBuffer,
  target: HTMLDivElement,
  _type?: string,
  context?: FileRenderContext
): Promise<FileViewerRenderedInstance> {
  const t = createFileViewerTranslator(context?.options);
  const documentRef = target.ownerDocument || document;
  const targetWindow = documentRef.defaultView || (typeof window !== 'undefined' ? window : null);
  const zoomEmitter = createFileViewerZoomChangeEmitter();
  let viewer: PptxViewer | null = null;
  let state: PptxRenderState = 'loading';
  let errorMessage = '';
  let zoomPercent = 100;
  let progressiveReady = false;
  let disposed = false;

  const style = createStyle(documentRef);
  const shell = createElement(documentRef, 'div', 'pptx-viewer-shell');
  shell.dataset.viewerZoomProvider = 'pptx';

  const loading = createElement(documentRef, 'div', 'pptx-loading');
  loading.setAttribute('aria-live', 'polite');
  loading.append(
    createElement(documentRef, 'span', 'pptx-loading-dot'),
    createElement(documentRef, 'span', undefined, t('presentation.state.loading'))
  );

  const error = createElement(documentRef, 'div', 'pptx-error');
  const errorTitle = createElement(documentRef, 'strong', undefined, t('presentation.error.title'));
  const errorText = createElement(documentRef, 'p');
  error.append(errorTitle, errorText);

  const surface = createElement(documentRef, 'div', 'pptx-render-surface');
  shell.append(loading, error, surface);
  target.replaceChildren(style, shell);
  context?.registerThumbnailAdapter?.({
    captureSource: 'embedded',
    beforeCapture: async ({ signal }) => {
      const hasFirstVisual = () => Boolean(
        viewer?.thumbnailDataUrl || surface.querySelector('.slide, .flyfish-pptx-thumbnail')
      );
      while ((state === 'loading' || (state === 'ready' && !hasFirstVisual())) && !disposed) {
        if (signal?.aborted) {
          throw signal.reason;
        }
        await new Promise(resolve => {
          if (targetWindow) targetWindow.setTimeout(resolve, 16);
          else setTimeout(resolve, 16);
        });
      }
      if (state === 'error') {
        throw new Error(errorMessage || t('presentation.error.parseFailed'));
      }
    },
    capture: () => viewer?.thumbnailDataUrl
      ? fetch(viewer.thumbnailDataUrl).then(response => response.blob())
      : null,
    // Keep the renderer ancestry in the snapshot: slide CSS is scoped below
    // .pptx-render-surface and loses layout when the slide node is cloned alone.
    getTarget: () => surface,
  });

  const getCurrentZoomPercent = () => clampZoomPercent(viewer?.zoomPercent ?? zoomPercent);

  const getZoomState = (): FileViewerZoomState => {
    const percent = getCurrentZoomPercent();
    return {
      scale: percent / 100,
      label: `${percent}%`,
      canZoomIn: percent < 300,
      canZoomOut: percent > 25,
      canReset: percent !== 100,
      minScale: 0.25,
      maxScale: 3,
    };
  };

  const setZoom = async (percent: number) => {
    const nextPercent = clampZoomPercent(percent);
    zoomPercent = nextPercent;
    if (viewer) {
      await viewer.setZoom(nextPercent);
      zoomPercent = getCurrentZoomPercent();
    }
    zoomEmitter.emit();
    return getZoomState();
  };

  const notifyProgressiveReady = () => {
    if (progressiveReady) {
      return;
    }
    progressiveReady = true;
    context?.onProgressiveRender?.();
  };

  const syncUi = () => {
    loading.hidden = !(state === 'loading' && !errorMessage);
    error.hidden = state !== 'error';
    errorText.textContent = errorMessage;
    surface.classList.toggle('is-loading', state === 'loading');
  };

  const registerExportAdapter = () => {
    context?.registerExportAdapter?.(buildExportAdapter(targetWindow));
  };

  registerFileViewerZoomProvider(shell, {
    zoomIn: () => setZoom(getCurrentZoomPercent() + 15),
    zoomOut: () => setZoom(getCurrentZoomPercent() - 15),
    resetZoom: () => setZoom(100),
    setZoom: scale => setZoom(scale * 100),
    getState: getZoomState,
    subscribe: zoomEmitter.subscribe,
  });

  const openPresentation = async () => {
    state = 'loading';
    errorMessage = '';
    progressiveReady = false;
    syncUi();
    const presentationOptions = context?.options?.presentation;

    try {
      const nextViewer = await PptxViewer.open(buffer, surface, {
        styleRoot: context?.surface?.shadowRoot,
        fitMode: 'contain',
        zoomPercent,
        workerUrl: presentationOptions?.workerUrl,
        workerType: presentationOptions?.workerType,
        zipLimits: RECOMMENDED_ZIP_LIMITS,
        lazySlides: true,
        lazyMedia: true,
        listOptions: {
          windowed: true,
          initialSlides: 3,
          batchSize: 4,
          overscanViewport: 1.5,
        },
        onSlideRendered: () => notifyProgressiveReady(),
        onRenderComplete: () => {
          if (disposed) {
            return;
          }
          state = 'ready';
          notifyProgressiveReady();
          zoomPercent = getCurrentZoomPercent();
          syncUi();
          zoomEmitter.emit();
        },
        onSlideError: (_index, error) => {
          console.warn('PPTX slide render warning:', error);
        },
        onError: error => {
          if (disposed) {
            return;
          }
          state = 'error';
          errorMessage = formatErrorMessage(error, t('presentation.error.parseFailed'), context);
          context?.registerExportAdapter?.(null);
          syncUi();
        },
      });

      if (disposed) {
        nextViewer.destroy();
        return;
      }

      viewer = nextViewer;
      state = 'ready';
      notifyProgressiveReady();
      zoomPercent = getCurrentZoomPercent();
      registerExportAdapter();
      syncUi();
      zoomEmitter.emit();
    } catch (error) {
      if (disposed) {
        return;
      }
      state = 'error';
      errorMessage = formatErrorMessage(error, t('presentation.error.parseFailed'), context);
      context?.registerExportAdapter?.(null);
      syncUi();
    }
  };

  void openPresentation();

  return {
    $el: shell,
    unmount() {
      disposed = true;
      context?.registerExportAdapter?.(null);
      context?.registerThumbnailAdapter?.(null);
      unregisterFileViewerZoomProvider(shell);
      viewer?.destroy();
      viewer = null;
      target.replaceChildren();
    },
  };
}

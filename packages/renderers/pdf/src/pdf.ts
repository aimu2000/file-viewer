import {
  getDocument,
  GlobalWorkerOptions,
  PDFWorker as PdfJsWorker,
  PixelsPerInch,
} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  EventBus,
  GenericL10n,
  PDFFindController,
  PDFLinkService,
  PDFViewer,
} from 'pdfjs-dist/legacy/web/pdf_viewer.mjs';
import {
  registerFileViewerSearchProvider,
  registerFileViewerZoomProvider,
  unregisterFileViewerSearchProvider,
  unregisterFileViewerZoomProvider,
  createFileViewerZoomChangeEmitter,
  createFileViewerTranslator,
  buildPrintPageStyle,
  formatCssPixels,
  DEFAULT_PDF_RANGE_CHUNK_SIZE,
  resolveFileViewerLocale,
  type FileRenderContext,
  type FileRenderExportOptions,
  type FileViewerPdfOptions,
  type FileViewerRenderedInstance,
  type FileViewerSearchOptions,
  type FileViewerSearchState,
  type FileViewerZoomState,
} from '@file-viewer/core';
import {
  DEFAULT_FILE_VIEWER_PDF_WORKER_PATH,
  resolveFileViewerPdfAssetUrls,
} from '@file-viewer/core/assets';
import { pdfViewerStyle } from './pdfStyles.js';

export const DEFAULT_FILE_VIEWER_PDF_WORKER_URL =
  DEFAULT_FILE_VIEWER_PDF_WORKER_PATH;

const MIN_SCALE = 0.2;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;
const FIT_HORIZONTAL_PADDING = 28;
const PAGE_BORDER_WIDTH = 18;
const PDF_EXPORT_MAX_PAGE_PIXELS = 8_000_000;
const PDF_WORKER_PROBE_TIMEOUT_MS = 1200;
const PDF_JS_DESTROY_CONSOLE_SUPPRESSION_MS = 1500;

type PdfWorkerHandlerModule = {
  WorkerMessageHandler: unknown;
};

type PdfJsWorkerGlobal = typeof globalThis & {
  pdfjsWorker?: {
    WorkerMessageHandler?: unknown;
  };
};

let bundledPdfWorkerModulePromise: Promise<PdfWorkerHandlerModule> | null = null;

// PDF.js viewer CSS references image assets that are not shipped with the
// on-demand renderer chunk, so keep the preview self-contained and 404-free.
const normalizedPdfViewerStyle = pdfViewerStyle
  .replace(/--page-border-image:\s*url\(images\/shadow\.png\)\s*9 9 repeat;/g, '--page-border-image:none;')
  .replace(/background:\s*url\("\.\/images\/loading-icon\.gif"\)\s*center no-repeat;/g, 'background:none;');

type PdfNavMode = 'pages' | 'outline';
type PdfRotation = 0 | 90 | 180 | 270;
type PdfLoadingTask = ReturnType<typeof getDocument>;
type PdfDocumentProxy = Awaited<PdfLoadingTask['promise']>;
type PdfWorkerInstance = InstanceType<typeof PdfJsWorker>;
type PdfResource = {
  loadingTask: PdfLoadingTask;
  worker: PdfWorkerInstance | null;
};
type ConsoleLike = {
  error: (...data: unknown[]) => void;
};
type PdfJsConsoleErrorSuppression = {
  originalError: ConsoleLike['error'];
  patchedError: ConsoleLike['error'];
  depth: number;
  restoreTimer: number | undefined;
};
type PdfNavigationResult = void | PromiseLike<void>;
type PdfFindMatchesCount = { current: number; total: number };

interface PdfOutlineItemView {
  id: string;
  title: string;
  dest: string | unknown[] | null;
  items: PdfOutlineItemView[];
  expanded: boolean;
}

interface PdfFlattenedOutlineItem {
  item: PdfOutlineItemView;
  depth: number;
}

const pdfJsConsoleErrorSuppressions = new WeakMap<ConsoleLike, PdfJsConsoleErrorSuppression>();

const createStyle = (documentRef: Document) => {
  const style = documentRef.createElement('style');
  style.textContent = `${normalizedPdfViewerStyle}
.pdf-state[hidden],.pdf-nav-pane[hidden]{display:none!important}
.pdf-page-button--with-thumbnail{grid-template-columns:52px minmax(0,1fr);min-height:74px}
.pdf-page-thumb--thumbnail{width:46px;height:60px;overflow:hidden;background:#fff}
.pdf-page-thumb--thumbnail img{display:block;width:100%;height:100%;object-fit:contain}
.pdf-page-thumb--thumbnail span{display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%}
@media (max-width:720px){
  .pdf-toolbar{flex-wrap:nowrap;gap:6px;min-height:44px;padding:5px 6px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
  .pdf-toolbar::-webkit-scrollbar{display:none}
  .pdf-toolbar-group{flex:0 0 auto;height:32px;gap:4px;padding:0 4px;border-radius:7px}
  .pdf-toolbar-group--zoom{margin-left:0}
  .pdf-icon-button,.pdf-scale-button{height:26px;border-radius:5px}
  .pdf-icon-button{width:26px;font-size:16px}
  .pdf-scale-button{width:54px;font-size:12px}
  .pdf-page-meter{min-width:52px;font-size:12px}
  .pdf-page-meter strong{font-size:13px}
  .pdf-rotation-meter{min-width:30px;font-size:12px}
  .pdf-nav-pane{width:min(82vw,280px);max-width:calc(100% - 52px)}
  .pdfViewer{padding:12px 8px 22px}
}
`;
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

const createButton = (
  documentRef: Document,
  className: string,
  title: string,
  label?: string
) => {
  const button = createElement(documentRef, 'button', className) as HTMLButtonElement;
  button.type = 'button';
  button.title = title;
  button.setAttribute('aria-label', title);
  if (label !== undefined) {
    const labelNode = createElement(documentRef, 'span', undefined, label);
    labelNode.setAttribute('aria-hidden', 'true');
    button.append(labelNode);
  }
  return button;
};

const normalizeRotation = (rotation: number): PdfRotation => {
  const normalized = ((Math.round(rotation / 90) * 90) % 360 + 360) % 360;
  return (normalized === 90 || normalized === 180 || normalized === 270 ? normalized : 0) as PdfRotation;
};

const clampScale = (scale: number) => Number(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)).toFixed(2));

const createPdfSearchState = (query = ''): FileViewerSearchState => ({
  query,
  total: 0,
  currentIndex: -1,
  current: null,
  matches: [],
});

const escapeAttribute = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const waitForPaint = (view?: Window | null) => new Promise<void>(resolve => {
  if (view?.requestAnimationFrame) {
    view.requestAnimationFrame(() => resolve());
    return;
  }
  globalThis.setTimeout(resolve, 0);
});

const readErrorLikeMessage = (value: unknown) => {
  if (value instanceof Error) {
    return value.message;
  }
  if (value && typeof value === 'object' && 'message' in value) {
    return String((value as { message?: unknown }).message || '');
  }
  return String(value || '');
};

const isPdfJsDestroyedTransportPageInitError = (args: unknown[]) => {
  const [message, reason] = args;
  return typeof message === 'string' &&
    /^Unable to get page \d+ to initialize viewer$/.test(message) &&
    readErrorLikeMessage(reason).includes('Transport destroyed');
};

const suppressPdfJsDestroyedTransportPageInitErrors = (view: Window) => {
  const consoleRef = (
    (view as Window & { console?: ConsoleLike }).console ||
    globalThis.console
  ) as ConsoleLike | undefined;
  if (!consoleRef || typeof consoleRef.error !== 'function') {
    return () => {};
  }

  let suppression = pdfJsConsoleErrorSuppressions.get(consoleRef);
  if (!suppression) {
    const originalError = consoleRef.error;
    suppression = {
      originalError,
      patchedError: (...args: unknown[]) => {
        if (isPdfJsDestroyedTransportPageInitError(args)) {
          return;
        }
        return originalError.apply(consoleRef, args);
      },
      depth: 0,
      restoreTimer: undefined,
    };
    pdfJsConsoleErrorSuppressions.set(consoleRef, suppression);
    consoleRef.error = suppression.patchedError;
  } else if (suppression.restoreTimer !== undefined) {
    view.clearTimeout(suppression.restoreTimer);
    suppression.restoreTimer = undefined;
  }

  suppression.depth += 1;
  let restored = false;
  return () => {
    if (restored || !suppression) {
      return;
    }
    restored = true;
    suppression.depth = Math.max(0, suppression.depth - 1);
    if (suppression.depth > 0) {
      return;
    }

    suppression.restoreTimer = view.setTimeout(() => {
      if (!suppression || suppression.depth > 0) {
        return;
      }
      if (consoleRef.error === suppression.patchedError) {
        consoleRef.error = suppression.originalError;
      }
      pdfJsConsoleErrorSuppressions.delete(consoleRef);
      suppression.restoreTimer = undefined;
    }, PDF_JS_DESTROY_CONSOLE_SUPPRESSION_MS);
  };
};

const isConfiguredUrl = (value: string | URL | undefined) => {
  return value !== undefined && value !== null && String(value).trim().length > 0;
};

const isJavaScriptLikeResponse = (response: Response) => {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';
  return !contentType ||
    contentType.includes('javascript') ||
    contentType.includes('ecmascript') ||
    contentType.includes('application/octet-stream') ||
    contentType.includes('text/plain');
};

const loadBundledPdfWorkerModule = async () => {
  bundledPdfWorkerModulePromise ??= import('pdfjs-dist/legacy/build/pdf.worker.mjs') as Promise<PdfWorkerHandlerModule>;
  return bundledPdfWorkerModulePromise;
};

const installBundledPdfFakeWorker = async () => {
  const workerGlobal = globalThis as PdfJsWorkerGlobal;
  if (workerGlobal.pdfjsWorker?.WorkerMessageHandler) {
    return;
  }

  const workerModule = await loadBundledPdfWorkerModule();
  workerGlobal.pdfjsWorker = {
    ...workerGlobal.pdfjsWorker,
    WorkerMessageHandler: workerModule.WorkerMessageHandler,
  };
};

const resolvePdfWorkerUrl = (
  options: FileViewerPdfOptions | undefined,
  documentUrl?: string
) => {
  return resolveFileViewerPdfAssetUrls(options, documentUrl).workerUrl;
};

const buildOutlineItems = (
  items: Array<{ title?: string; dest?: string | unknown[] | null; items?: unknown[] }>,
  prefix = 'outline',
  getFallbackTitle: (index: number) => string = index => `Outline ${index + 1}`
) => items.map((item, index): PdfOutlineItemView => {
  const id = `${prefix}-${index}`;
  const children = Array.isArray(item.items)
    ? buildOutlineItems(item.items as Array<{ title?: string; dest?: string | unknown[] | null; items?: unknown[] }>, id, getFallbackTitle)
    : [];
  return {
    id,
    title: item.title || getFallbackTitle(index),
    dest: item.dest || null,
    items: children,
    expanded: index < 4,
  };
});

export default async function renderPdf(
  buffer: ArrayBuffer,
  target: HTMLDivElement,
  context?: FileRenderContext
): Promise<FileViewerRenderedInstance> {
  const documentRef = target.ownerDocument || document;
  const targetWindow = documentRef.defaultView || (typeof window !== 'undefined' ? window : null);
  const t = createFileViewerTranslator(context?.options);
  const resolvedLocale = resolveFileViewerLocale(context?.options);
  if (!targetWindow) {
    throw new Error(t('pdf.error.browserWindow'));
  }
  const options = context?.options?.pdf;
  const navigationEnabled = options?.navigation !== false;
  const toolbarVisible = options?.toolbar !== false;
  const thumbnailsEnabled = options?.thumbnails === true;
  const zoomEmitter = createFileViewerZoomChangeEmitter();
  const isCompactViewport = () => {
    const width = target.clientWidth || targetWindow.innerWidth || 0;
    return width > 0 && width <= 720;
  };

  let navVisible = options?.navigation === false
    ? false
    : typeof options?.defaultNavigationVisible === 'boolean'
      ? options.defaultNavigationVisible
      : !isCompactViewport();
  let navMode: PdfNavMode = 'pages';
  let loadStatus: 'loading' | 'ready' | 'error' = 'loading';
  let errorMessage = '';
  let currentPage = 1;
  let pageCount = 0;
  let currentScale = 1;
  let autoFitWidth = true;
  let currentRotation = normalizeRotation(options?.rotation ?? 0);
  let outlineItems: PdfOutlineItemView[] = [];
  let resizeObserver: ResizeObserver | null = null;
  let thumbnailObserver: IntersectionObserver | null = null;
  let fitFrame = 0;
  let pageDimensionFrame = 0;
  let destroyed = false;
  let loadVersion = 0;
  let pdfSearchState = createPdfSearchState();
  let pdfMatchesCount: PdfFindMatchesCount = { current: 0, total: 0 };
  let pdfSearchOptions: FileViewerSearchOptions | undefined;
  let pdfSearchWaiters: Array<{
    resolve: (state: FileViewerSearchState) => void;
    timer: number;
  }> = [];
  const pdfThumbnails = new Map<number, string>();
  const pendingPdfThumbnails = new Set<number>();

  const pdfContext = {
    viewer: null as PDFViewer | null,
    linkService: null as PDFLinkService | null,
    eventBus: null as EventBus | null,
    findController: null as PDFFindController | null,
    resource: null as PdfResource | null,
    document: null as PdfDocumentProxy | null,
    search: '',
  };

  const root = createElement(documentRef, 'div', 'pdf-shell');
  root.dataset.viewerSearchProvider = 'pdf';
  root.dataset.viewerZoomProvider = 'pdf';

  const toolbar = createElement(documentRef, 'div', 'pdf-toolbar');
  const navToggleButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.toggleNavigation'));
  navToggleButton.setAttribute('aria-pressed', String(navVisible));
  navToggleButton.append(createElement(documentRef, 'span', 'pdf-panel-icon'));

  const pageGroup = createElement(documentRef, 'div', 'pdf-toolbar-group');
  const previousPageButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.previousPage'), '‹');
  const pageMeter = createElement(documentRef, 'span', 'pdf-page-meter');
  const pageMeterCurrent = createElement(documentRef, 'strong', undefined, '1');
  const pageMeterTotal = createElement(documentRef, 'span', undefined, '/ -');
  pageMeter.append(pageMeterCurrent, pageMeterTotal);
  const nextPageButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.nextPage'), '›');
  pageGroup.append(previousPageButton, pageMeter, nextPageButton);

  const zoomGroup = createElement(documentRef, 'div', 'pdf-toolbar-group pdf-toolbar-group--zoom');
  const zoomOutButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.zoomOut'), '−');
  const scaleButton = createElement(documentRef, 'button', 'pdf-scale-button', '100%') as HTMLButtonElement;
  scaleButton.type = 'button';
  scaleButton.title = t('pdf.toolbar.fitWidth');
  scaleButton.setAttribute('aria-label', t('pdf.toolbar.fitWidth'));
  const zoomInButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.zoomIn'), '+');
  zoomGroup.append(zoomOutButton, scaleButton, zoomInButton);

  const rotateGroup = createElement(documentRef, 'div', 'pdf-toolbar-group pdf-toolbar-group--rotate');
  const rotateLeftButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.rotateLeft'), '↺');
  const rotationMeter = createElement(documentRef, 'span', 'pdf-rotation-meter', `${currentRotation}°`);
  const rotateRightButton = createButton(documentRef, 'pdf-icon-button', t('pdf.toolbar.rotateRight'), '↻');
  rotateGroup.append(rotateLeftButton, rotationMeter, rotateRightButton);

  if (navigationEnabled) {
    toolbar.append(navToggleButton);
  }
  toolbar.append(pageGroup, zoomGroup, rotateGroup);

  const content = createElement(documentRef, 'div', 'pdf-content');
  const navPane = createElement(documentRef, 'aside', 'pdf-nav-pane');
  const navHead = createElement(documentRef, 'div', 'pdf-nav-head');
  const navTitle = createElement(documentRef, 'span', undefined, t('pdf.nav.pagesTitle'));
  const navCount = createElement(documentRef, 'strong', undefined, t('pdf.nav.pageCount', { count: 0 }));
  navHead.append(navTitle, navCount);

  const navTabs = createElement(documentRef, 'div', 'pdf-nav-tabs');
  navTabs.setAttribute('role', 'tablist');
  navTabs.setAttribute('aria-label', t('pdf.nav.typeLabel'));
  const pagesTab = createButton(documentRef, '', t('pdf.nav.pagesTab')) as HTMLButtonElement;
  const outlineTab = createButton(documentRef, '', t('pdf.nav.outlineTab')) as HTMLButtonElement;
  pagesTab.textContent = t('pdf.nav.pagesTab');
  outlineTab.textContent = t('pdf.nav.outlineTab');
  pagesTab.setAttribute('role', 'tab');
  outlineTab.setAttribute('role', 'tab');
  navTabs.append(pagesTab, outlineTab);

  const navList = createElement(documentRef, 'div');
  navPane.append(navHead, navTabs, navList);

  const viewport = createElement(documentRef, 'div', 'pdf-viewport');
  const container = createElement(documentRef, 'div', 'pdf-wrapper');
  container.dataset.viewerScrollContainer = 'true';
  const pdfViewerRoot = createElement(documentRef, 'div', 'pdfViewer');
  const stateNode = createElement(documentRef, 'div', 'pdf-state', t('pdf.state.loading'));
  container.append(pdfViewerRoot, stateNode);
  viewport.append(container);
  content.append(navPane, viewport);
  root.append(content);
  if (toolbarVisible) {
    root.insertBefore(toolbar, content);
  }
  target.replaceChildren(createStyle(documentRef), root);

  const scaleText = () => `${Math.round(currentScale * 100)}%`;
  const rotationText = () => `${currentRotation}°`;
  const canGoPrevious = () => currentPage > 1;
  const canGoNext = () => currentPage < pageCount;
  const canZoomOut = () => currentScale > MIN_SCALE;
  const canZoomIn = () => currentScale < MAX_SCALE;
  const outlineCount = () => {
    const countItems = (items: PdfOutlineItemView[]): number => (
      items.reduce((total, item) => total + 1 + countItems(item.items), 0)
    );
    return countItems(outlineItems);
  };
  const flattenedOutlineItems = () => {
    const result: PdfFlattenedOutlineItem[] = [];
    const visit = (items: PdfOutlineItemView[], depth: number) => {
      items.forEach(item => {
        result.push({ item, depth });
        if (item.expanded && item.items.length) {
          visit(item.items, depth + 1);
        }
      });
    };
    visit(outlineItems, 0);
    return result;
  };

  const renderNavList = () => {
    navList.replaceChildren();
    navList.className = navMode === 'pages' ? 'pdf-page-list' : 'pdf-outline-list';

    if (navMode === 'pages') {
      thumbnailObserver?.disconnect();
      for (let page = 1; page <= pageCount; page += 1) {
        const button = createElement(documentRef, 'button', 'pdf-page-button') as HTMLButtonElement;
        button.type = 'button';
        button.classList.toggle('pdf-page-button--active', page === currentPage);
        button.classList.toggle('pdf-page-button--with-thumbnail', thumbnailsEnabled);
        const thumb = createElement(documentRef, 'span', 'pdf-page-thumb');
        if (thumbnailsEnabled) {
          thumb.classList.add('pdf-page-thumb--thumbnail');
          queuePdfThumbnail(page, thumb);
        } else {
          thumb.textContent = String(page);
        }
        button.append(
          thumb,
          createElement(documentRef, 'span', 'pdf-page-label', t('pdf.nav.pageLabel', { page }))
        );
        button.addEventListener('click', () => goToPage(page));
        navList.append(button);
      }
      return;
    }

    const entries = flattenedOutlineItems();
    entries.forEach(entry => {
      const button = createElement(documentRef, 'button', 'pdf-outline-button') as HTMLButtonElement;
      button.type = 'button';
      button.style.setProperty('--outline-depth', String(entry.depth));
      const toggle = createElement(documentRef, 'span', 'pdf-outline-toggle');
      toggle.classList.toggle('pdf-outline-toggle--open', entry.item.expanded);
      toggle.classList.toggle('pdf-outline-toggle--empty', !entry.item.items.length);
      toggle.setAttribute('aria-hidden', 'true');
      toggle.addEventListener('click', event => {
        event.stopPropagation();
        toggleOutlineItem(entry.item);
      });
      button.append(toggle, createElement(documentRef, 'span', 'pdf-outline-title', entry.item.title));
      button.addEventListener('click', () => goToOutlineItem(entry.item));
      navList.append(button);
    });

    if (!entries.length) {
      navList.append(createElement(documentRef, 'div', 'pdf-outline-empty', t('pdf.nav.outlineEmpty')));
    }
  };

  const paintPdfThumbnail = (pageNumber: number, thumb: HTMLElement) => {
    const imageUrl = pdfThumbnails.get(pageNumber);
    thumb.dataset.pdfThumbnailPage = String(pageNumber);
    if (!imageUrl) {
      thumb.replaceChildren(createElement(documentRef, 'span', undefined, String(pageNumber)));
      return false;
    }

    const image = documentRef.createElement('img');
    image.src = imageUrl;
    image.alt = t('pdf.thumbnail.alt', { page: pageNumber });
    image.loading = 'lazy';
    thumb.replaceChildren(image);
    return true;
  };

  const renderPdfThumbnail = async (pageNumber: number) => {
    const pdfDocument = pdfContext.document;
    if (!pdfDocument || pdfThumbnails.has(pageNumber) || pendingPdfThumbnails.has(pageNumber)) {
      return;
    }

    pendingPdfThumbnails.add(pageNumber);
    try {
      const page = await pdfDocument.getPage(pageNumber);
      if (destroyed || pdfContext.document !== pdfDocument) {
        return;
      }

      const baseViewport = page.getViewport({
        scale: PixelsPerInch.PDF_TO_CSS_UNITS,
        rotation: currentRotation,
      });
      const deviceScale = Math.min(2, Math.max(1, targetWindow.devicePixelRatio || 1));
      const thumbnailWidth = 46;
      const ratio = Math.min(1, thumbnailWidth / Math.max(baseViewport.width, 1));
      const renderViewport = page.getViewport({
        scale: PixelsPerInch.PDF_TO_CSS_UNITS * ratio * deviceScale,
        rotation: currentRotation,
      });
      const canvas = documentRef.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
      if (!canvasContext) {
        return;
      }

      canvas.width = Math.max(1, Math.ceil(renderViewport.width));
      canvas.height = Math.max(1, Math.ceil(renderViewport.height));
      await page.render({ canvas, canvasContext, viewport: renderViewport }).promise;
      if (destroyed || pdfContext.document !== pdfDocument) {
        return;
      }

      pdfThumbnails.set(pageNumber, canvas.toDataURL('image/png'));
      canvas.width = 0;
      canvas.height = 0;
      (page as { cleanup?: () => void }).cleanup?.();
      navList
        .querySelectorAll<HTMLElement>(`.pdf-page-thumb--thumbnail[data-pdf-thumbnail-page="${pageNumber}"]`)
        .forEach(thumb => paintPdfThumbnail(pageNumber, thumb));
    } catch (error) {
      console.warn('[file-viewer] PDF 缩略图渲染失败。', error);
    } finally {
      pendingPdfThumbnails.delete(pageNumber);
    }
  };

  const ensureThumbnailObserver = () => {
    if (!thumbnailsEnabled || thumbnailObserver || typeof targetWindow.IntersectionObserver !== 'function') {
      return;
    }

    thumbnailObserver = new targetWindow.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          return;
        }
        const targetElement = entry.target as HTMLElement;
        const pageNumber = Number(targetElement.dataset.pdfThumbnailPage || '0');
        thumbnailObserver?.unobserve(targetElement);
        if (pageNumber > 0) {
          void renderPdfThumbnail(pageNumber);
        }
      });
    }, {
      root: navList,
      rootMargin: '96px 0px',
    });
  };

  const queuePdfThumbnail = (pageNumber: number, thumb: HTMLElement) => {
    if (paintPdfThumbnail(pageNumber, thumb)) {
      return;
    }

    ensureThumbnailObserver();
    if (thumbnailObserver) {
      thumbnailObserver.observe(thumb);
      return;
    }
    void renderPdfThumbnail(pageNumber);
  };

  const syncUi = () => {
    root.classList.toggle('pdf-shell--compact', isCompactViewport());
    root.classList.toggle('pdf-shell--nav-hidden', !navigationEnabled || !navVisible);
    root.classList.toggle('pdf-shell--toolbar-hidden', !toolbarVisible);
    navToggleButton.classList.toggle('pdf-icon-button--active', navVisible);
    navToggleButton.setAttribute('aria-pressed', String(navVisible));
    navPane.hidden = !navigationEnabled || !navVisible;
    pagesTab.classList.toggle('active', navMode === 'pages');
    outlineTab.classList.toggle('active', navMode === 'outline');
    pagesTab.setAttribute('aria-selected', navMode === 'pages' ? 'true' : 'false');
    outlineTab.setAttribute('aria-selected', navMode === 'outline' ? 'true' : 'false');
    navTitle.textContent = navMode === 'pages' ? t('pdf.nav.pagesTitle') : t('pdf.nav.outlineTitle');
    navCount.textContent = navMode === 'pages'
      ? t('pdf.nav.pageCount', { count: pageCount })
      : t('pdf.nav.itemCount', { count: outlineCount() });
    pageMeterCurrent.textContent = String(currentPage);
    pageMeterTotal.textContent = `/ ${pageCount || '-'}`;
    scaleButton.textContent = scaleText();
    rotationMeter.textContent = rotationText();
    previousPageButton.disabled = !canGoPrevious();
    nextPageButton.disabled = !canGoNext();
    zoomOutButton.disabled = !canZoomOut();
    zoomInButton.disabled = !canZoomIn();
    stateNode.hidden = loadStatus === 'ready';
    stateNode.classList.toggle('pdf-state--error', loadStatus === 'error');
    stateNode.textContent = loadStatus === 'error' ? errorMessage : t('pdf.state.loading');
    renderNavList();
  };

  const writeLegacyCompatiblePageDimensions = () => {
    const pdfViewer = pdfContext.viewer;
    if (!pdfViewer) {
      return;
    }

    const totalPages = pageCount || (pdfViewer as { pagesCount?: number }).pagesCount || 0;
    for (let index = 0; index < totalPages; index += 1) {
      const pageView = pdfViewer.getPageView(index) as {
        div?: HTMLElement;
        viewport?: { width?: number; height?: number };
      } | null;
      const pageElement = pageView?.div ||
        pdfViewerRoot.querySelector<HTMLElement>(`.page[data-page-number="${index + 1}"]`);
      const width = pageView?.viewport?.width;
      const height = pageView?.viewport?.height;
      if (!pageElement || !Number.isFinite(width) || !Number.isFinite(height)) {
        continue;
      }

      pageElement.style.setProperty('width', `${Math.max(1, Math.round(width || 0))}px`, 'important');
      pageElement.style.setProperty('height', `${Math.max(1, Math.round(height || 0))}px`, 'important');
    }
  };

  const scheduleLegacyPageDimensionPatch = () => {
    targetWindow.cancelAnimationFrame(pageDimensionFrame);
    pageDimensionFrame = targetWindow.requestAnimationFrame(() => {
      writeLegacyCompatiblePageDimensions();
      targetWindow.requestAnimationFrame(writeLegacyCompatiblePageDimensions);
    });
  };

  const canUseResolvedPdfWorkerUrl = async (workerUrl: string) => {
    const fetcher = targetWindow.fetch?.bind(targetWindow) || globalThis.fetch?.bind(globalThis);
    const AbortControllerCtor = targetWindow.AbortController || globalThis.AbortController;
    if (!fetcher || !AbortControllerCtor) {
      return false;
    }

    try {
      const parsed = new URL(workerUrl, documentRef.baseURI || targetWindow.location.href);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }
    } catch {
      return false;
    }

    const controller = new AbortControllerCtor();
    const timer = targetWindow.setTimeout(() => controller.abort(), PDF_WORKER_PROBE_TIMEOUT_MS);
    try {
      const response = await fetcher(workerUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      if (response.ok) {
        return isJavaScriptLikeResponse(response);
      }

      if (response.status !== 405 && response.status !== 501) {
        return false;
      }

      const fallbackResponse = await fetcher(workerUrl, {
        method: 'GET',
        cache: 'no-cache',
        headers: { Range: 'bytes=0-0' },
        signal: controller.signal,
      });
      return (fallbackResponse.ok || fallbackResponse.status === 206) &&
        isJavaScriptLikeResponse(fallbackResponse);
    } catch {
      return false;
    } finally {
      targetWindow.clearTimeout(timer);
    }
  };

  const createPdfWorker = async () => {
    const workerUrl = resolvePdfWorkerUrl(options, documentRef.URL || undefined);
    const hasExplicitWorkerUrl = isConfiguredUrl(options?.workerUrl);
    const shouldUseRealWorker = !!targetWindow?.Worker &&
      (hasExplicitWorkerUrl || await canUseResolvedPdfWorkerUrl(workerUrl));

    if (shouldUseRealWorker) {
      GlobalWorkerOptions.workerSrc = workerUrl;
      try {
        const worker = PdfJsWorker.create({ name: 'file-viewer-pdf-worker' }) as PdfWorkerInstance;
        await worker.promise;
        return worker;
      } catch (error) {
        console.warn('[file-viewer] PDF Worker 初始化失败，改用包内 PDF.js 兜底。', error);
      }
    }

    try {
      await installBundledPdfFakeWorker();
    } catch (error) {
      console.warn('[file-viewer] PDF.js 包内 worker 兜底加载失败，继续使用 PDF.js 默认策略。', error);
      GlobalWorkerOptions.workerSrc = workerUrl;
    }
    return null;
  };

  const resolvePdfSearchWaiters = (state: FileViewerSearchState) => {
    const waiters = pdfSearchWaiters;
    pdfSearchWaiters = [];
    waiters.forEach(waiter => {
      targetWindow.clearTimeout(waiter.timer);
      waiter.resolve(state);
    });
  };

  const readPdfMatchesCount = (): PdfFindMatchesCount => {
    const findController = pdfContext.findController;
    if (!findController) {
      return { current: 0, total: 0 };
    }

    const pageMatches = findController.pageMatches || [];
    const selected = findController.selected;
    const total = pageMatches.reduce((sum: number, matches: number[] | undefined) => sum + (matches?.length || 0), 0);
    let current = 0;
    if (selected && selected.pageIdx >= 0 && selected.matchIdx >= 0 && total > 0) {
      for (let index = 0; index < selected.pageIdx; index += 1) {
        current += pageMatches[index]?.length || 0;
      }
      current += selected.matchIdx + 1;
    }
    return { current, total };
  };

  const commitPdfSearchState = (
    matchesCount: PdfFindMatchesCount = readPdfMatchesCount(),
    query = pdfContext.search,
    shouldResolve = false
  ) => {
    pdfMatchesCount = matchesCount;
    const current = Math.max(0, matchesCount.current || 0);
    const total = Math.max(0, matchesCount.total || 0);
    const selected = pdfContext.findController?.selected;
    const page = selected && selected.pageIdx >= 0 ? selected.pageIdx + 1 : undefined;
    pdfSearchState = {
      query,
      total,
      currentIndex: current > 0 ? current - 1 : -1,
      current: current > 0
        ? {
            id: `pdf-search-match-${current}`,
            index: current - 1,
            text: query,
            anchor: null,
            page,
          }
        : null,
      matches: [],
    };

    if (shouldResolve) {
      resolvePdfSearchWaiters(pdfSearchState);
    }
    return pdfSearchState;
  };

  const waitForPdfSearchState = (query: string) => new Promise<FileViewerSearchState>(resolve => {
    const timer = targetWindow.setTimeout(() => {
      const waiterIndex = pdfSearchWaiters.findIndex(waiter => waiter.resolve === resolve);
      if (waiterIndex >= 0) {
        pdfSearchWaiters.splice(waiterIndex, 1);
      }
      resolve(commitPdfSearchState(readPdfMatchesCount(), query));
    }, 1200);
    pdfSearchWaiters.push({ resolve, timer });
  });

  const handlePdfFindMatchesCount = (event: { matchesCount?: PdfFindMatchesCount }) => {
    if (event.matchesCount) {
      commitPdfSearchState(event.matchesCount, pdfContext.search);
    }
  };

  const handlePdfFindControlState = (event: {
    state?: number;
    matchesCount?: PdfFindMatchesCount;
    rawQuery?: string | null;
  }) => {
    const query = typeof event.rawQuery === 'string' ? event.rawQuery : pdfContext.search;
    pdfContext.search = query;
    const matchesCount = event.matchesCount?.total ? event.matchesCount : readPdfMatchesCount();
    const shouldResolve = event.state !== 3 && (matchesCount.total > 0 || event.state === 1);
    commitPdfSearchState(matchesCount, query, shouldResolve);
  };

  const clampHorizontalScroll = (scrollLeft: number) => {
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    return Math.min(Math.max(0, scrollLeft), maxScrollLeft);
  };

  const restoreHorizontalScroll = (scrollLeft: number) => {
    container.scrollLeft = clampHorizontalScroll(scrollLeft);
  };

  const stabilizeHorizontalScroll = (scrollLeft: number) => {
    restoreHorizontalScroll(scrollLeft);
    void waitForPaint(targetWindow).then(() => restoreHorizontalScroll(scrollLeft));
    targetWindow.requestAnimationFrame(() => {
      restoreHorizontalScroll(scrollLeft);
      targetWindow.requestAnimationFrame(() => restoreHorizontalScroll(scrollLeft));
    });
    targetWindow.setTimeout(() => restoreHorizontalScroll(scrollLeft), 120);
  };

  const runPdfFind = async (
    query: string,
    searchOptionsInput: FileViewerSearchOptions | undefined,
    type: '' | 'again',
    findPrevious = false
  ) => {
    if (!pdfContext.eventBus) {
      return commitPdfSearchState({ current: 0, total: 0 }, query);
    }

    pdfContext.search = query;
    pdfSearchOptions = searchOptionsInput || pdfSearchOptions;
    const searchOptions = searchOptionsInput || pdfSearchOptions;
    const previousScrollLeft = clampHorizontalScroll(container.scrollLeft || 0);
    pdfContext.eventBus.dispatch('find', {
      source: root,
      type,
      query,
      phraseSearch: true,
      caseSensitive: !!searchOptions?.caseSensitive,
      entireWord: !!searchOptions?.wholeWord,
      highlightAll: true,
      findPrevious,
      matchDiacritics: false,
    });

    try {
      return await waitForPdfSearchState(query);
    } finally {
      stabilizeHorizontalScroll(previousScrollLeft);
    }
  };

  const clearPdfFind = () => {
    pdfContext.search = '';
    pdfSearchOptions = undefined;
    pdfMatchesCount = { current: 0, total: 0 };
    pdfContext.eventBus?.dispatch('findbarclose', {
      source: root,
    });
    return commitPdfSearchState(pdfMatchesCount, '', true);
  };

  const getPdfZoomState = (): FileViewerZoomState => ({
    scale: currentScale,
    label: scaleText(),
    canZoomIn: !!pdfContext.viewer && canZoomIn(),
    canZoomOut: !!pdfContext.viewer && canZoomOut(),
    canReset: !!pdfContext.viewer,
    minScale: MIN_SCALE,
    maxScale: MAX_SCALE,
  });

  const setScale = (scale: number) => {
    if (!pdfContext.viewer) {
      return;
    }
    const normalizedScale = clampScale(scale);
    pdfContext.viewer.currentScale = normalizedScale;
    currentScale = normalizedScale;
    scheduleLegacyPageDimensionPatch();
    zoomEmitter.emit();
    syncUi();
  };

  const getPageWidthAtScaleOne = (pdfViewer: PDFViewer) => {
    const pageView = pdfViewer.getPageView(0);
    const pdfPage = pageView?.pdfPage;
    if (pdfPage) {
      return pdfPage.getViewport({
        scale: PixelsPerInch.PDF_TO_CSS_UNITS,
        rotation: currentRotation,
      }).width;
    }

    const viewportWidth = pageView?.viewport?.width;
    if (viewportWidth && currentScale) {
      return viewportWidth / currentScale;
    }
    return 0;
  };

  const getFitWidthScale = (pdfViewer: PDFViewer) => {
    const pageWidth = getPageWidthAtScaleOne(pdfViewer);
    const containerWidth = container.clientWidth || targetWindow.innerWidth;
    const availableWidth = Math.max(containerWidth - FIT_HORIZONTAL_PADDING - PAGE_BORDER_WIDTH, 96);
    return pageWidth ? clampScale(availableWidth / pageWidth) : 1;
  };

  const fitToWidth = () => {
    if (!pdfContext.viewer) {
      return;
    }
    autoFitWidth = true;
    setScale(getFitWidthScale(pdfContext.viewer));
    void waitForPaint(targetWindow).then(() => {
      pdfContext.viewer?.update();
    });
  };

  const scheduleFitToWidth = () => {
    if (!autoFitWidth || !pdfContext.viewer) {
      return;
    }
    targetWindow.cancelAnimationFrame(fitFrame);
    fitFrame = targetWindow.requestAnimationFrame(() => fitToWidth());
  };

  const zoomIn = () => {
    autoFitWidth = false;
    setScale(currentScale + SCALE_STEP);
  };

  const zoomOut = () => {
    autoFitWidth = false;
    setScale(currentScale - SCALE_STEP);
  };

  const applyRotation = (rotation: number) => {
    const normalized = normalizeRotation(rotation);
    currentRotation = normalized;
    pdfThumbnails.clear();
    pendingPdfThumbnails.clear();
    if (!pdfContext.viewer) {
      syncUi();
      return;
    }
    pdfContext.viewer.pagesRotation = normalized;
    void waitForPaint(targetWindow).then(() => {
      if (autoFitWidth) {
        fitToWidth();
        return;
      }
      pdfContext.viewer?.update();
      scheduleLegacyPageDimensionPatch();
      syncUi();
    });
  };

  const runWithStableHorizontalScroll = (action: () => PdfNavigationResult) => {
    const previousScrollLeft = clampHorizontalScroll(container.scrollLeft || 0);
    const result = action();
    stabilizeHorizontalScroll(previousScrollLeft);
    if (result && typeof result.then === 'function') {
      void Promise.resolve(result).finally(() => stabilizeHorizontalScroll(previousScrollLeft));
    }
  };

  function goToPage(pageNumber: number) {
    if (!pdfContext.viewer || !pageCount) {
      return;
    }
    const nextPage = Math.min(pageCount, Math.max(1, pageNumber));
    runWithStableHorizontalScroll(() => {
      pdfContext.viewer!.currentPageNumber = nextPage;
      currentPage = nextPage;
      syncUi();
    });
  }

  const toggleNav = () => {
    if (!navigationEnabled) {
      return;
    }
    navVisible = !navVisible;
    syncUi();
    void waitForPaint(targetWindow).then(() => {
      if (autoFitWidth) {
        fitToWidth();
        return;
      }
      pdfContext.viewer?.update();
    });
  };

  const setNavMode = (mode: PdfNavMode) => {
    navMode = mode;
    syncUi();
  };

  const toggleOutlineItem = (item: PdfOutlineItemView) => {
    if (!item.items.length) {
      return;
    }
    item.expanded = !item.expanded;
    syncUi();
  };

  const goToOutlineItem = (item: PdfOutlineItemView) => {
    if (!item.dest || !pdfContext.linkService) {
      return;
    }
    runWithStableHorizontalScroll(() => pdfContext.linkService!.goToDestination(item.dest!));
  };

  const destroyPdfResource = async (resource: PdfResource | null) => {
    if (!resource) {
      return;
    }
    const restorePdfJsConsoleErrors = suppressPdfJsDestroyedTransportPageInitErrors(targetWindow);
    try {
      await resource.loadingTask.destroy();
    } catch (error) {
      console.warn('PDF 加载任务销毁失败', error);
    } finally {
      try {
        resource.worker?.destroy();
      } finally {
        restorePdfJsConsoleErrors();
      }
    }
  };

  const loadOutline = async (pdfDocument: PdfDocumentProxy) => {
    try {
      const outline = await pdfDocument.getOutline();
      if (destroyed || pdfContext.document !== pdfDocument) {
        return;
      }
      outlineItems = Array.isArray(outline)
        ? buildOutlineItems(
            outline as Array<{ title?: string; dest?: string | unknown[] | null; items?: unknown[] }>,
            'outline',
            index => t('pdf.nav.outlineFallbackTitle', { index: index + 1 })
          )
        : [];
      syncUi();
    } catch (error) {
      console.warn('PDF 大纲读取失败', error);
      outlineItems = [];
      syncUi();
    }
  };

  const getPdfExportRatio = (width: number, height: number, mode: FileRenderExportOptions['mode']) => {
    const preferredRatio = mode === 'print' ? 1.75 : 1.5;
    const maxRatio = Math.sqrt(PDF_EXPORT_MAX_PAGE_PIXELS / Math.max(width * height, 1));
    return Math.max(0.75, Math.min(preferredRatio, maxRatio));
  };

  const getPdfPrintPageSize = async (pageNumber = 1) => {
    const pdfDocument = pdfContext.document;
    if (!pdfDocument) {
      throw new Error(t('pdf.error.notLoaded'));
    }
    const page = await pdfDocument.getPage(Math.min(Math.max(pageNumber, 1), pdfDocument.numPages));
    const viewport = page.getViewport({
      scale: PixelsPerInch.PDF_TO_CSS_UNITS,
      rotation: currentRotation,
    });
    (page as { cleanup?: () => void }).cleanup?.();
    return {
      width: Math.ceil(viewport.width),
      height: Math.ceil(viewport.height),
    };
  };

  const buildPdfPrintStyle = async () => {
    const size = await getPdfPrintPageSize();
    return buildPrintPageStyle({
      selector: '.viewer-export-content .pdf-export-page',
      width: size.width,
      height: size.height,
    });
  };

  const renderPdfPagesForExport = async (exportOptions: FileRenderExportOptions) => {
    const pdfDocument = pdfContext.document;
    if (!pdfDocument) {
      throw new Error(t('pdf.error.notLoaded'));
    }

    const pagesHtml: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      if (destroyed) {
        throw new Error(t('pdf.error.unloaded'));
      }

      const page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({
        scale: PixelsPerInch.PDF_TO_CSS_UNITS,
        rotation: currentRotation,
      });
      const pageWidth = Math.ceil(baseViewport.width);
      const pageHeight = Math.ceil(baseViewport.height);
      const exportRatio = getPdfExportRatio(baseViewport.width, baseViewport.height, exportOptions.mode);
      const renderViewport = page.getViewport({
        scale: PixelsPerInch.PDF_TO_CSS_UNITS * exportRatio,
        rotation: currentRotation,
      });
      const canvas = documentRef.createElement('canvas');
      const canvasContext = canvas.getContext('2d');
      if (!canvasContext) {
        throw new Error(t('pdf.error.canvasUnavailable'));
      }

      canvas.width = Math.ceil(renderViewport.width);
      canvas.height = Math.ceil(renderViewport.height);
      await page.render({ canvas, canvasContext, viewport: renderViewport }).promise;

      const pageTitle = t('pdf.export.pageTitle', { title: exportOptions.title, page: pageNumber });
      const pageStyle = [
        `--viewer-print-page-width:${formatCssPixels(pageWidth)}`,
        `--viewer-print-page-height:${formatCssPixels(pageHeight)}`,
        `width:${formatCssPixels(pageWidth)}`,
        `height:${formatCssPixels(pageHeight)}`,
      ].join(';');
      pagesHtml.push(`<section class="pdf-export-page viewer-print-page" style="${pageStyle}" aria-label="${escapeAttribute(pageTitle)}"><img src="${canvas.toDataURL('image/png')}" alt="${escapeAttribute(pageTitle)}" /></section>`);

      canvas.width = 0;
      canvas.height = 0;
      (page as { cleanup?: () => void }).cleanup?.();
    }

    return `<div class="pdf-export-document">${pagesHtml.join('')}</div>`;
  };

  const loadFile = async () => {
    const requestVersion = ++loadVersion;
    loadStatus = 'loading';
    errorMessage = '';
    pdfContext.document = null;
    outlineItems = [];
    pdfThumbnails.clear();
    pendingPdfThumbnails.clear();
    thumbnailObserver?.disconnect();
    context?.registerExportAdapter?.(null);
    syncUi();
    let resource: PdfResource | null = null;

    try {
      if (destroyed || requestVersion !== loadVersion) {
        return;
      }

      const eventBus = new EventBus();
      const pdfLinkService = new PDFLinkService({ eventBus });
      const pdfFindController = new PDFFindController({
        eventBus,
        linkService: pdfLinkService,
        updateMatchesCountOnProgress: true,
      });

      const pdfViewer = new PDFViewer({
        container,
        eventBus,
        linkService: pdfLinkService,
        findController: pdfFindController,
        l10n: new GenericL10n(resolvedLocale),
        enableAutoLinking: false,
      });
      pdfContext.viewer = pdfViewer;
      pdfContext.linkService = pdfLinkService;
      pdfContext.eventBus = eventBus;
      pdfContext.findController = pdfFindController;
      pdfLinkService.setViewer(pdfViewer);

      eventBus.on('updatefindmatchescount', handlePdfFindMatchesCount);
      eventBus.on('updatefindcontrolstate', handlePdfFindControlState);
      eventBus.on('pagesinit', () => {
        applyRotation(currentRotation);
        fitToWidth();
        scheduleLegacyPageDimensionPatch();
        loadStatus = 'ready';
        syncUi();
        context?.onProgressiveRender?.();
        if (pdfContext.search) {
          eventBus.dispatch('find', { type: '', query: pdfContext.search });
        }
      });
      eventBus.on('pagechanging', ({ pageNumber }: { pageNumber: number }) => {
        currentPage = pageNumber;
        syncUi();
      });
      eventBus.on('scalechanging', ({ scale }: { scale: number }) => {
        currentScale = clampScale(scale);
        scheduleLegacyPageDimensionPatch();
        zoomEmitter.emit();
        syncUi();
      });
      eventBus.on('pagerendered', scheduleLegacyPageDimensionPatch);

      if (!context?.streamUrl && !buffer.byteLength) {
        throw new Error(t('pdf.error.missingSource'));
      }

      const worker = await createPdfWorker();
      const pdfAssets = resolveFileViewerPdfAssetUrls(
        options,
        documentRef.URL || documentRef.baseURI
      );
      const source = context?.streamUrl
        ? {
            url: context.streamUrl,
            rangeChunkSize: options?.rangeChunkSize || DEFAULT_PDF_RANGE_CHUNK_SIZE,
            withCredentials: options?.withCredentials === true,
          }
        : {
            data: buffer,
          };
      const loadingTask = getDocument({
        ...source,
        worker: worker || undefined,
        cMapUrl: pdfAssets.cMapUrl,
        wasmUrl: pdfAssets.wasmUrl,
        standardFontDataUrl: pdfAssets.standardFontDataUrl,
        useWorkerFetch: true,
        cMapPacked: true,
        enableXfa: true,
      });
      resource = { loadingTask, worker };
      pdfContext.resource = resource;

      const pdfDocument = await loadingTask.promise;
      if (destroyed || requestVersion !== loadVersion || pdfContext.resource !== resource) {
        if (pdfContext.resource === resource) {
          pdfContext.resource = null;
          await destroyPdfResource(resource);
        }
        return;
      }

      pageCount = pdfDocument.numPages;
      currentPage = 1;
      pdfContext.document = pdfDocument;
      context?.registerExportAdapter?.({
        includeDocumentStyles: false,
        printStyle: buildPdfPrintStyle,
        toHtml: renderPdfPagesForExport,
      });
      void loadOutline(pdfDocument);
      pdfViewer.setDocument(pdfDocument);
      pdfLinkService.setDocument(pdfDocument, null);
      syncUi();
    } catch (error) {
      if (pdfContext.resource === resource) {
        pdfContext.resource = null;
        void destroyPdfResource(resource);
      }
      if (destroyed || requestVersion !== loadVersion) {
        return;
      }
      loadStatus = 'error';
      errorMessage = error instanceof Error ? error.message : t('pdf.error.loadFailed');
      syncUi();
    }
  };

  registerFileViewerSearchProvider(root, {
    search: (query, searchOptions) => runPdfFind(query, searchOptions, '', false),
    next: () => pdfContext.search
      ? runPdfFind(pdfContext.search, undefined, 'again', false)
      : pdfSearchState,
    previous: () => pdfContext.search
      ? runPdfFind(pdfContext.search, undefined, 'again', true)
      : pdfSearchState,
    clear: clearPdfFind,
    getState: () => pdfSearchState,
  });

  registerFileViewerZoomProvider(root, {
    zoomIn: () => {
      zoomIn();
      return getPdfZoomState();
    },
    zoomOut: () => {
      zoomOut();
      return getPdfZoomState();
    },
    resetZoom: () => {
      fitToWidth();
      return getPdfZoomState();
    },
    setZoom: scale => {
      autoFitWidth = false;
      setScale(scale);
      return getPdfZoomState();
    },
    getState: getPdfZoomState,
    subscribe: zoomEmitter.subscribe,
  });

  navToggleButton.addEventListener('click', toggleNav);
  previousPageButton.addEventListener('click', () => goToPage(currentPage - 1));
  nextPageButton.addEventListener('click', () => goToPage(currentPage + 1));
  zoomOutButton.addEventListener('click', zoomOut);
  zoomInButton.addEventListener('click', zoomIn);
  scaleButton.addEventListener('click', fitToWidth);
  rotateLeftButton.addEventListener('click', () => applyRotation(currentRotation - 90));
  rotateRightButton.addEventListener('click', () => applyRotation(currentRotation + 90));
  pagesTab.addEventListener('click', () => setNavMode('pages'));
  outlineTab.addEventListener('click', () => setNavMode('outline'));

  if (targetWindow.ResizeObserver) {
    resizeObserver = new targetWindow.ResizeObserver(() => scheduleFitToWidth());
    resizeObserver.observe(container);
  }

  syncUi();
  void loadFile();

  return {
    $el: root,
    unmount() {
      destroyed = true;
      loadVersion += 1;
      targetWindow.cancelAnimationFrame(fitFrame);
      targetWindow.cancelAnimationFrame(pageDimensionFrame);
      thumbnailObserver?.disconnect();
      thumbnailObserver = null;
      resizeObserver?.disconnect();
      resizeObserver = null;
      unregisterFileViewerSearchProvider(root);
      unregisterFileViewerZoomProvider(root);
      outlineItems = [];
      context?.registerExportAdapter?.(null);
      const resource = pdfContext.resource;
      pdfContext.viewer = null;
      pdfContext.linkService = null;
      pdfContext.eventBus = null;
      pdfContext.findController = null;
      pdfContext.document = null;
      pdfContext.resource = null;
      pdfSearchWaiters.forEach(waiter => targetWindow.clearTimeout(waiter.timer));
      pdfSearchWaiters = [];
      void destroyPdfResource(resource);
      target.replaceChildren();
    },
  };
}

import JSZip from 'jszip';
import Panzoom, { type PanzoomObject } from '@panzoom/panzoom';
import {
  parseXmind8Xml,
  parseXmind2020Json,
} from '@ljheee/xmind-parser';
import {
  createFileViewerZoomChangeEmitter,
  registerFileViewerZoomProvider,
  unregisterFileViewerZoomProvider,
  type FileRenderContext,
  type FileViewerRenderedInstance,
  type FileViewerZoomState,
} from '@file-viewer/core';

type XMindStatus = 'loading' | 'ready' | 'error';

interface KmNodeData {
  text?: string;
  hyperlink?: string;
  note?: string;
  label?: string[];
  priority?: number;
  progress?: number;
  markers?: string[];
  image?: string;
  imageSize?: { width?: number; height?: number };
  style?: Record<string, unknown>;
  expandState?: 'collapse' | string;
  comment?: Array<{ author?: string; content?: string }>;
  attachment?: boolean;
  internalLink?: boolean;
  'xmind-structure'?: string;
  'xmind-detached'?: boolean;
  'xmind-summary'?: boolean;
  'xmind-callout'?: boolean;
}

interface KmNode {
  data?: KmNodeData;
  children?: KmNode[];
}

interface KmDocument {
  root?: KmNode;
  title?: string;
  theme?: string;
  template?: string;
  version?: string;
}

interface MindNodeView {
  id: string;
  title: string;
  labels: string[];
  markers: string[];
  note: string;
  hyperlink: string;
  image: string;
  priority?: number;
  progress?: number;
  structure: string;
  collapsed: boolean;
  detached: boolean;
  summary: boolean;
  callout: boolean;
  depth: number;
  children: MindNodeView[];
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeHeight: number;
}

interface SheetView {
  title: string;
  theme: string;
  template: string;
  version: string;
  root: MindNodeView;
  nodeCount: number;
  maxDepth: number;
  width: number;
  height: number;
}

const NODE_WIDTH = 236;
const ROOT_WIDTH = 260;
const LEVEL_GAP = 112;
const SIBLING_GAP = 24;
const CANVAS_PADDING = 44;
const MAX_RENDER_NODES = 1800;
const PAN_CLICK_THRESHOLD = 5;
const PAN_BOUNDARY_MARGIN = 180;
const PAN_MIN_VISIBLE_RATIO = 0.08;
const PAN_MIN_VISIBLE_PX = 56;
const WHEEL_ZOOM_STEP = 0.12;
const KEYBOARD_PAN_STEP = 42;
const KEYBOARD_PAN_FAST_STEP = 96;
const CLICK_SUPPRESSION_MS = 120;
const PANZOOM_EXCLUDE_CLASS = 'xmind-pan-exclude';

const xmindStyle = `
.xmind-viewer{height:100%;min-height:0;display:flex;flex-direction:column;background:#eef3f7;color:#172033}
.xmind-viewer *{box-sizing:border-box}
.xmind-toolbar{min-height:62px;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 16px;border-bottom:1px solid rgba(23,32,51,.08);background:#fff}
.xmind-title{min-width:0}.xmind-title span{color:#159365;font-size:12px;font-weight:900}.xmind-title strong{display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:18px}
.xmind-actions{display:flex;align-items:center;gap:8px}.xmind-actions button{min-width:34px;min-height:30px;border:0;border-radius:8px;background:rgba(15,23,42,.06);color:#26364d;cursor:pointer;font-size:12px;font-weight:900}.xmind-actions button:hover{background:rgba(33,163,102,.14);color:#0f8f62}.xmind-actions span{min-width:48px;color:#64748b;text-align:center;font-size:12px;font-weight:900}
.xmind-tabs{display:flex;min-height:46px;gap:8px;align-items:center;overflow:auto;padding:8px 12px;border-bottom:1px solid rgba(23,32,51,.08);background:#f8fafc}
.xmind-tabs button{min-height:30px;max-width:220px;flex:0 0 auto;border:1px solid rgba(148,163,184,.28);border-radius:999px;padding:0 12px;background:#fff;color:#475569;cursor:pointer;font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.xmind-tabs button.active{border-color:rgba(33,163,102,.35);background:rgba(33,163,102,.12);color:#0f8f62}
.xmind-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(220px,280px) minmax(0,1fr)}
.xmind-sidebar{min-height:0;overflow:auto;border-right:1px solid rgba(23,32,51,.08);background:rgba(255,255,255,.72);padding:14px}
.xmind-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px}.xmind-stats div{border-radius:12px;background:#fff;padding:10px;box-shadow:inset 0 0 0 1px rgba(23,32,51,.06)}.xmind-stats span{display:block;color:#718096;font-size:12px}.xmind-stats strong{display:block;margin-top:4px;font-size:18px;color:#172033}
.xmind-outline{display:flex;flex-direction:column;gap:6px}.xmind-outline button{display:block;width:100%;min-height:32px;border:0;border-radius:9px;background:transparent;color:#334155;cursor:pointer;font:inherit;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.xmind-outline button:hover{background:rgba(33,163,102,.1);color:#0f766e}
.xmind-stage{position:relative;min-width:0;min-height:0;overflow:hidden;cursor:grab;touch-action:none;overscroll-behavior:contain;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;-webkit-tap-highlight-color:transparent;contain:layout paint;background:linear-gradient(90deg,rgba(15,23,42,.04) 1px,transparent 1px),linear-gradient(180deg,rgba(15,23,42,.04) 1px,transparent 1px),#f3f7fb;background-size:32px 32px;outline:none}
.xmind-stage *{touch-action:none;-webkit-user-drag:none}
.xmind-stage:focus-visible{box-shadow:inset 0 0 0 2px rgba(59,130,246,.42)}
.xmind-stage:active{cursor:grabbing}
.xmind-stage.is-panning,.xmind-stage.is-space-panning,.xmind-stage.is-panning *,.xmind-stage.is-space-panning *{cursor:grabbing!important;user-select:none}
.xmind-zoom-box{position:absolute;inset:0;transform-origin:top left;will-change:transform;cursor:inherit}.xmind-surface{position:absolute;left:0;top:0;transform-origin:top left;will-change:transform;cursor:inherit}.xmind-edges{position:absolute;inset:0;overflow:visible;pointer-events:none}.xmind-edges path{fill:none;stroke:#9db2c7;stroke-width:2.2;stroke-linecap:round}
.xmind-node{position:absolute;width:236px;min-height:58px;border:1px solid rgba(15,23,42,.1);border-radius:14px;padding:12px 12px 10px;background:#fff;box-shadow:0 12px 28px rgba(23,32,51,.11);color:#172033;cursor:grab;user-select:none;-webkit-user-select:none}
.xmind-node:active,.xmind-stage.is-panning .xmind-node{cursor:grabbing}
.xmind-node.root{width:260px;border-color:rgba(33,163,102,.28);background:linear-gradient(135deg,#effdf5,#fff);box-shadow:0 18px 38px rgba(33,163,102,.16)}
.xmind-node.detached{border-style:dashed}.xmind-node.summary{background:#fff8e7}.xmind-node.callout{background:#eef6ff}
.xmind-node h3{margin:0;color:#172033;font-size:14px;line-height:1.35;word-break:break-word}.xmind-node.root h3{font-size:16px}
.xmind-badges,.xmind-labels{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.xmind-badges span,.xmind-labels span{max-width:100%;border-radius:999px;padding:3px 7px;font-size:11px;font-weight:800;line-height:1.3}.xmind-badges span{background:#eef6f7;color:#0b7480}.xmind-labels span{background:#edf2ff;color:#3557a5}
.xmind-note{margin:8px 0 0;color:#64748b;font-size:12px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.xmind-link{display:block;margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0f766e;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}.xmind-image{display:block;max-width:100%;max-height:96px;margin-top:8px;border-radius:8px;object-fit:contain;background:#f8fafc}
.xmind-stage.is-panning .xmind-link{pointer-events:none}
.xmind-state{position:absolute;inset:0;z-index:4;display:flex;align-items:center;justify-content:center;padding:24px;color:#64748b;font-weight:800;text-align:center;background:rgba(238,243,247,.88)}.xmind-state[hidden]{display:none!important}.xmind-state.error{color:#b42318}
.file-viewer[data-viewer-theme='dark'] .xmind-viewer{background:#111827;color:#e5eef8}.file-viewer[data-viewer-theme='dark'] .xmind-toolbar,.file-viewer[data-viewer-theme='dark'] .xmind-tabs,.file-viewer[data-viewer-theme='dark'] .xmind-sidebar{background:#fff;color:#172033}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .xmind-viewer{background:#111827;color:#e5eef8}.file-viewer[data-viewer-theme='system'] .xmind-toolbar,.file-viewer[data-viewer-theme='system'] .xmind-tabs,.file-viewer[data-viewer-theme='system'] .xmind-sidebar{background:#fff;color:#172033}}
@media (max-width:860px){.xmind-body{grid-template-columns:1fr}.xmind-sidebar{display:none}.xmind-toolbar{align-items:flex-start;flex-direction:column}.xmind-actions{width:100%;justify-content:flex-end}}
`;

const createStyle = () => {
  const style = document.createElement('style');
  style.textContent = xmindStyle;
  return style;
};

const createElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  text?: string
) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
};

const clampZoom = (value: number) => Math.min(2.5, Math.max(0.25, Number(value.toFixed(2))));

const normalizeArray = <T>(value: T[] | undefined | null) => Array.isArray(value) ? value : [];

const textValue = (value: unknown, fallback = '') => {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const truncate = (value: string, max = 220) => {
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
};

const estimateNodeHeight = (node: MindNodeView) => {
  const lineCount = Math.max(1, Math.ceil(node.title.length / 22));
  let height = 34 + lineCount * 18;
  if (node.labels.length || node.markers.length || node.priority || node.progress || node.collapsed || node.detached || node.summary || node.callout) {
    height += 28;
  }
  if (node.note) {
    height += Math.min(60, 18 + Math.ceil(node.note.length / 34) * 16);
  }
  if (node.hyperlink) {
    height += 24;
  }
  if (node.image) {
    height += 96;
  }
  return Math.max(58, height);
};

const createMindNode = (node: KmNode, depth: number, indexPath: string, counter: { value: number }): MindNodeView => {
  counter.value += 1;
  const data = node.data || {};
  const children = counter.value >= MAX_RENDER_NODES
    ? []
    : normalizeArray(node.children).map((child, index) => createMindNode(child, depth + 1, `${indexPath}.${index + 1}`, counter));
  const view: MindNodeView = {
    id: `xmind-node-${indexPath.replace(/[^a-z0-9]+/gi, '-')}`,
    title: textValue(data.text, depth === 0 ? 'Central Topic' : 'Untitled Topic'),
    labels: normalizeArray(data.label).map(item => String(item)).filter(Boolean),
    markers: normalizeArray(data.markers).map(item => String(item)).filter(Boolean),
    note: textValue(data.note),
    hyperlink: textValue(data.hyperlink),
    image: textValue(data.image),
    priority: typeof data.priority === 'number' ? data.priority : undefined,
    progress: typeof data.progress === 'number' ? data.progress : undefined,
    structure: textValue(data['xmind-structure']),
    collapsed: data.expandState === 'collapse',
    detached: data['xmind-detached'] === true,
    summary: data['xmind-summary'] === true,
    callout: data['xmind-callout'] === true,
    depth,
    children,
    x: 0,
    y: 0,
    width: depth === 0 ? ROOT_WIDTH : NODE_WIDTH,
    height: 0,
    subtreeHeight: 0,
  };
  view.height = estimateNodeHeight(view);
  return view;
};

const walkMindNodes = (node: MindNodeView, visit: (node: MindNodeView) => void) => {
  visit(node);
  node.children.forEach(child => walkMindNodes(child, visit));
};

const computeSubtree = (node: MindNodeView) => {
  if (!node.children.length) {
    node.subtreeHeight = node.height;
    return node.subtreeHeight;
  }
  const childHeight = node.children.reduce((sum, child, index) => (
    sum + computeSubtree(child) + (index > 0 ? SIBLING_GAP : 0)
  ), 0);
  node.subtreeHeight = Math.max(node.height, childHeight);
  return node.subtreeHeight;
};

const assignLayout = (node: MindNodeView, top: number) => {
  node.x = CANVAS_PADDING + node.depth * (NODE_WIDTH + LEVEL_GAP);
  node.y = top + (node.subtreeHeight - node.height) / 2;
  if (!node.children.length) {
    return;
  }
  const childTotal = node.children.reduce((sum, child, index) => (
    sum + child.subtreeHeight + (index > 0 ? SIBLING_GAP : 0)
  ), 0);
  let childTop = top + (node.subtreeHeight - childTotal) / 2;
  node.children.forEach(child => {
    assignLayout(child, childTop);
    childTop += child.subtreeHeight + SIBLING_GAP;
  });
};

const createSheetView = (document: KmDocument, index: number): SheetView => {
  const counter = { value: 0 };
  const root = createMindNode(document.root || { data: { text: document.title || `Sheet ${index + 1}` } }, 0, String(index + 1), counter);
  computeSubtree(root);
  assignLayout(root, CANVAS_PADDING);

  let maxDepth = 0;
  let maxRight = 0;
  let maxBottom = 0;
  walkMindNodes(root, node => {
    maxDepth = Math.max(maxDepth, node.depth);
    maxRight = Math.max(maxRight, node.x + node.width);
    maxBottom = Math.max(maxBottom, node.y + node.height);
  });

  return {
    title: textValue(document.title, `Sheet ${index + 1}`),
    theme: textValue(document.theme, '-'),
    template: textValue(document.template, '-'),
    version: textValue(document.version, '-'),
    root,
    nodeCount: counter.value,
    maxDepth,
    width: Math.max(840, maxRight + CANVAS_PADDING),
    height: Math.max(520, maxBottom + CANVAS_PADDING),
  };
};

const loadXMindSheets = async (buffer: ArrayBuffer): Promise<KmDocument[]> => {
  const zip = await JSZip.loadAsync(buffer);
  const resources: Record<string, Uint8Array> = {};
  const resourceTasks: Array<Promise<void>> = [];

  zip.forEach((path, entry) => {
    if (entry.dir || (!path.startsWith('resources/') && !path.startsWith('attachments/'))) {
      return;
    }
    resourceTasks.push(entry.async('uint8array').then(bytes => {
      resources[path] = bytes;
    }));
  });
  await Promise.all(resourceTasks);

  const parserOptions = {
    resources: Object.keys(resources).length ? resources : null,
  };
  const contentJson = zip.file(/(^|\/)content\.json$/i)[0];
  if (contentJson) {
    return await parseXmind2020Json(await contentJson.async('text'), parserOptions) as KmDocument[];
  }

  const contentXml = zip.file(/(^|\/)content\.xml$/i)[0];
  if (contentXml) {
    const commentsXml = zip.file(/(^|\/)comments\.xml$/i)[0];
    return await parseXmind8Xml(await contentXml.async('text'), {
      ...parserOptions,
      commentsXml: commentsXml ? await commentsXml.async('text') : undefined,
    }) as KmDocument[];
  }

  throw new Error('无法识别 XMind 文件: ZIP 中未找到 content.json 或 content.xml');
};

const badgeTexts = (node: MindNodeView) => {
  const badges: string[] = [];
  if (node.priority) {
    badges.push(`P${node.priority}`);
  }
  if (node.progress) {
    badges.push(node.progress === 10 ? '暂停' : `${Math.min(100, Math.round((node.progress / 9) * 100))}%`);
  }
  if (node.collapsed) {
    badges.push('折叠');
  }
  if (node.detached) {
    badges.push('浮动');
  }
  if (node.summary) {
    badges.push('概要');
  }
  if (node.callout) {
    badges.push('标注');
  }
  node.markers.slice(0, 4).forEach(marker => badges.push(marker));
  return badges;
};

const createEdgePath = (parent: MindNodeView, child: MindNodeView) => {
  const startX = parent.x + parent.width;
  const startY = parent.y + parent.height / 2;
  const endX = child.x;
  const endY = child.y + child.height / 2;
  const handle = Math.max(48, (endX - startX) * 0.48);
  return `M${startX} ${startY} C${startX + handle} ${startY}, ${endX - handle} ${endY}, ${endX} ${endY}`;
};

const renderEdges = (svg: SVGSVGElement, node: MindNodeView) => {
  node.children.forEach(child => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', createEdgePath(node, child));
    svg.append(path);
    renderEdges(svg, child);
  });
};

const createNodeElement = (
  node: MindNodeView,
  scrollToNode: (node: MindNodeView) => void,
  shouldSuppressClick: () => boolean
) => {
  const card = createElement('article', [
    'xmind-node',
    node.depth === 0 ? 'root' : '',
    node.detached ? 'detached' : '',
    node.summary ? 'summary' : '',
    node.callout ? 'callout' : '',
  ].filter(Boolean).join(' '));
  card.id = node.id;
  card.style.left = `${node.x}px`;
  card.style.top = `${node.y}px`;
  card.style.width = `${node.width}px`;
  card.style.minHeight = `${node.height}px`;

  card.append(createElement('h3', undefined, node.title));

  const badges = badgeTexts(node);
  if (badges.length) {
    const badgeList = createElement('div', 'xmind-badges');
    badges.forEach(item => badgeList.append(createElement('span', undefined, item)));
    card.append(badgeList);
  }
  if (node.labels.length) {
    const labelList = createElement('div', 'xmind-labels');
    node.labels.slice(0, 8).forEach(item => labelList.append(createElement('span', undefined, item)));
    card.append(labelList);
  }
  if (node.note) {
    card.append(createElement('p', 'xmind-note', truncate(node.note)));
  }
  if (node.image) {
    if (/^data:image\//i.test(node.image) || /^https?:\/\//i.test(node.image)) {
      const image = document.createElement('img');
      image.className = 'xmind-image';
      image.alt = node.title;
      image.src = node.image;
      image.draggable = false;
      card.append(image);
    } else {
      card.append(createElement('p', 'xmind-note', `图片资源: ${node.image}`));
    }
  }
  if (node.hyperlink) {
    const link = document.createElement('a');
    link.className = `xmind-link ${PANZOOM_EXCLUDE_CLASS}`;
    link.textContent = node.hyperlink;
    link.href = node.hyperlink.startsWith('http') ? node.hyperlink : '#';
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.draggable = false;
    card.append(link);
  }

  card.addEventListener('click', event => {
    if (shouldSuppressClick()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    scrollToNode(node);
  });
  return card;
};

export default async function renderXMind(
  buffer: ArrayBuffer,
  target: HTMLDivElement,
  _type = 'xmind',
  context?: FileRenderContext
): Promise<FileViewerRenderedInstance> {
  const zoomEmitter = createFileViewerZoomChangeEmitter();
  let status: XMindStatus = 'loading';
  let errorMessage = '';
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let disposed = false;
  let activeSheetIndex = 0;
  let sheets: SheetView[] = [];
  let suppressNodeClick = false;
  let spacePanning = false;
  let userAdjustedViewport = false;
  let resizeFrame: number | undefined;
  let panzoom: PanzoomObject | null = null;
  let programmaticPanzoomUpdate = false;
  let panStartState: { x: number; y: number; scale: number } | null = null;

  const root = createElement('section', 'xmind-viewer');
  root.dataset.viewerZoomProvider = 'xmind';
  const toolbar = createElement('header', 'xmind-toolbar');
  const title = createElement('div', 'xmind-title');
  title.append(createElement('span', undefined, 'XMIND MIND MAP'), createElement('strong', undefined, context?.filename || 'XMind'));
  const actions = createElement('div', 'xmind-actions');
  const zoomOutButton = createElement('button', undefined, '-') as HTMLButtonElement;
  const zoomLabel = createElement('span', undefined, '100%');
  const zoomInButton = createElement('button', undefined, '+') as HTMLButtonElement;
  const resetButton = createElement('button', undefined, '适合') as HTMLButtonElement;
  [zoomOutButton, zoomInButton, resetButton].forEach(button => {
    button.type = 'button';
  });
  zoomOutButton.title = '缩小';
  zoomInButton.title = '放大';
  resetButton.title = '适配画布';
  actions.append(zoomOutButton, zoomLabel, zoomInButton, resetButton);
  toolbar.append(title, actions);

  const tabs = createElement('nav', 'xmind-tabs');
  const body = createElement('div', 'xmind-body');
  const sidebar = createElement('aside', 'xmind-sidebar');
  const stage = createElement('main', 'xmind-stage');
  const ownerDocument = target.ownerDocument || document;
  const ownerWindow = ownerDocument.defaultView || window;
  stage.tabIndex = 0;
  stage.setAttribute('role', 'application');
  stage.setAttribute('aria-label', 'XMind canvas. Drag to pan, pinch on touch screens to zoom, double click to fit, use Ctrl or Command with wheel to zoom.');
  stage.setAttribute('aria-keyshortcuts', 'Space ArrowLeft ArrowRight ArrowUp ArrowDown Control+0 Meta+0');
  const zoomBox = createElement('div', 'xmind-zoom-box');
  const surface = createElement('div', 'xmind-surface');
  const state = createElement('div', 'xmind-state', '正在解析 XMind 脑图...');
  zoomBox.append(surface);
  stage.append(zoomBox, state);
  body.append(sidebar, stage);
  root.append(toolbar, tabs, body);
  target.replaceChildren(createStyle(), root);

  const getZoomState = (): FileViewerZoomState => ({
    scale: zoom,
    label: `${Math.round(zoom * 100)}%`,
    canZoomIn: zoom < 2.5,
    canZoomOut: zoom > 0.25,
    canReset: zoom !== 1 || panX !== 0 || panY !== 0,
    minScale: 0.25,
    maxScale: 2.5,
  });

  const clampPan = () => {
    const sheet = sheets[activeSheetIndex];
    if (!sheet) {
      return;
    }

    const viewportWidth = Math.max(1, stage.clientWidth);
    const viewportHeight = Math.max(1, stage.clientHeight);
    const scaledWidth = sheet.width * zoom;
    const scaledHeight = sheet.height * zoom;

    const resolveBounds = (viewportSize: number, contentSize: number) => {
      if (contentSize <= viewportSize) {
        const centered = (viewportSize - contentSize) / 2;
        const slack = Math.max(PAN_BOUNDARY_MARGIN, viewportSize * 0.45);
        return {
          min: centered - slack,
          max: centered + slack,
        };
      }
      const visibleEdge = Math.min(
        Math.max(PAN_MIN_VISIBLE_PX, viewportSize * PAN_MIN_VISIBLE_RATIO),
        Math.max(PAN_MIN_VISIBLE_PX, contentSize * 0.35)
      );
      return {
        min: visibleEdge - contentSize,
        max: viewportSize - visibleEdge,
      };
    };

    const xBounds = resolveBounds(viewportWidth, scaledWidth);
    const yBounds = resolveBounds(viewportHeight, scaledHeight);
    panX = Math.min(xBounds.max, Math.max(xBounds.min, panX));
    panY = Math.min(yBounds.max, Math.max(yBounds.min, panY));
  };

  const syncPanzoomState = (markUserAdjusted: boolean) => {
    if (!panzoom) {
      return;
    }
    const pan = panzoom.getPan();
    panX = Number.isFinite(pan.x) ? pan.x : panX;
    panY = Number.isFinite(pan.y) ? pan.y : panY;
    zoom = clampZoom(panzoom.getScale());
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    if (markUserAdjusted) {
      userAdjustedViewport = true;
    }
    zoomEmitter.emit();
  };

  const updatePanzoom = (update: () => void) => {
    programmaticPanzoomUpdate = true;
    try {
      update();
    } finally {
      programmaticPanzoomUpdate = false;
    }
    syncPanzoomState(false);
  };

  const applyZoom = () => {
    const sheet = sheets[activeSheetIndex];
    if (sheet) {
      zoomBox.style.width = `${sheet.width}px`;
      zoomBox.style.height = `${sheet.height}px`;
      surface.style.width = `${sheet.width}px`;
      surface.style.height = `${sheet.height}px`;
    }
    clampPan();
    surface.style.transform = '';
    if (panzoom) {
      updatePanzoom(() => {
        panzoom?.zoom(zoom, { animate: false, force: true });
        panzoom?.pan(panX, panY, { animate: false, force: true });
      });
    } else {
      zoomBox.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
    }
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  };

  const setZoom = (scale: number) => {
    userAdjustedViewport = true;
    zoom = clampZoom(scale);
    applyZoom();
    zoomEmitter.emit();
    return getZoomState();
  };

  const setZoomAtPoint = (scale: number, clientX: number, clientY: number) => {
    const nextZoom = clampZoom(scale);
    if (nextZoom === zoom) {
      return getZoomState();
    }

    userAdjustedViewport = true;
    if (panzoom) {
      updatePanzoom(() => {
        panzoom?.zoomToPoint(nextZoom, { clientX, clientY }, { animate: false, force: true });
      });
    } else {
      const rect = stage.getBoundingClientRect();
      const viewportX = clientX - rect.left;
      const viewportY = clientY - rect.top;
      const logicalX = (viewportX - panX) / zoom;
      const logicalY = (viewportY - panY) / zoom;
      zoom = nextZoom;
      panX = viewportX - logicalX * zoom;
      panY = viewportY - logicalY * zoom;
      applyZoom();
      zoomEmitter.emit();
    }
    return getZoomState();
  };

  const setZoomAtStageCenter = (scale: number) => {
    const rect = stage.getBoundingClientRect();
    return setZoomAtPoint(scale, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const fitSheetToStage = (markAsUserReset = false) => {
    const sheet = sheets[activeSheetIndex];
    if (!sheet) {
      return getZoomState();
    }

    userAdjustedViewport = markAsUserReset ? false : userAdjustedViewport;
    const availableWidth = Math.max(1, stage.clientWidth - CANVAS_PADDING);
    const availableHeight = Math.max(1, stage.clientHeight - CANVAS_PADDING);
    const fitScale = Math.min(1, availableWidth / sheet.width, availableHeight / sheet.height);
    zoom = clampZoom(fitScale);
    panX = (stage.clientWidth - sheet.width * zoom) / 2;
    panY = (stage.clientHeight - sheet.height * zoom) / 2;
    applyZoom();
    zoomEmitter.emit();
    return getZoomState();
  };

  const scrollToNode = (node: MindNodeView) => {
    userAdjustedViewport = true;
    panX = stage.clientWidth / 2 - (node.x + node.width / 2) * zoom;
    panY = stage.clientHeight / 2 - (node.y + node.height / 2) * zoom;
    applyZoom();
    zoomEmitter.emit();
  };

  const renderSidebar = (sheet: SheetView) => {
    sidebar.replaceChildren();
    const stats = createElement('div', 'xmind-stats');
    [
      ['节点', sheet.nodeCount],
      ['层级', sheet.maxDepth + 1],
      ['主题', sheet.theme],
      ['模板', sheet.template],
    ].forEach(([label, value]) => {
      const cell = document.createElement('div');
      cell.append(createElement('span', undefined, String(label)), createElement('strong', undefined, String(value)));
      stats.append(cell);
    });
    sidebar.append(stats);

    const outline = createElement('div', 'xmind-outline');
    walkMindNodes(sheet.root, node => {
      const item = createElement('button', undefined, `${'  '.repeat(node.depth)}${node.title}`) as HTMLButtonElement;
      item.type = 'button';
      item.style.paddingLeft = `${8 + node.depth * 14}px`;
      item.addEventListener('click', () => scrollToNode(node));
      outline.append(item);
    });
    sidebar.append(outline);
  };

  const renderSheet = () => {
    const sheet = sheets[activeSheetIndex];
    if (!sheet) {
      return;
    }
    surface.replaceChildren();
    userAdjustedViewport = false;
    surface.style.width = `${sheet.width}px`;
    surface.style.height = `${sheet.height}px`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('xmind-edges');
    svg.setAttribute('width', String(sheet.width));
    svg.setAttribute('height', String(sheet.height));
    svg.setAttribute('viewBox', `0 0 ${sheet.width} ${sheet.height}`);
    renderEdges(svg, sheet.root);
    surface.append(svg);

    walkMindNodes(sheet.root, node => {
      surface.append(createNodeElement(node, scrollToNode, () => suppressNodeClick));
    });

    renderSidebar(sheet);
    applyZoom();
    requestAnimationFrame(() => fitSheetToStage());
  };

  const renderTabs = () => {
    tabs.replaceChildren();
    sheets.forEach((sheet, index) => {
      const button = createElement('button', index === activeSheetIndex ? 'active' : '', sheet.title) as HTMLButtonElement;
      button.type = 'button';
      button.title = sheet.title;
      button.addEventListener('click', () => {
        activeSheetIndex = index;
        renderTabs();
        renderSheet();
      });
      tabs.append(button);
    });
  };

  const syncState = () => {
    state.hidden = status === 'ready';
    state.classList.toggle('error', status === 'error');
    state.textContent = status === 'error'
      ? errorMessage
      : '正在解析 XMind 脑图...';
  };

  const load = async () => {
    status = 'loading';
    errorMessage = '';
    syncState();
    try {
      const parsed = await loadXMindSheets(buffer);
      if (disposed) {
        return;
      }
      if (!Array.isArray(parsed) || !parsed.length) {
        throw new Error('XMind 文件中没有可预览的画布');
      }
      sheets = parsed.map(createSheetView);
      activeSheetIndex = 0;
      renderTabs();
      renderSheet();
      status = 'ready';
      syncState();
    } catch (error) {
      if (disposed) {
        return;
      }
      console.error(error);
      errorMessage = error instanceof Error ? error.message : String(error);
      status = 'error';
      syncState();
    }
  };

  registerFileViewerZoomProvider(root, {
    zoomIn: () => setZoomAtStageCenter(zoom + 0.15),
    zoomOut: () => setZoomAtStageCenter(zoom - 0.15),
    resetZoom: () => fitSheetToStage(true),
    setZoom,
    getState: getZoomState,
    subscribe: zoomEmitter.subscribe,
  });

  const getPanTargetElement = (targetValue: EventTarget | null) => {
    const ElementCtor = ownerWindow.Element || Element;
    return targetValue instanceof ElementCtor ? targetValue as Element : null;
  };

  const isPanBlockedTarget = (targetValue: EventTarget | null) => {
    const element = getPanTargetElement(targetValue);
    if (!element) {
      return false;
    }
    if (element.closest('.xmind-toolbar,.xmind-tabs,.xmind-sidebar')) {
      return true;
    }
    const interactive = element.closest('a,button,input,textarea,select,[contenteditable="true"]');
    return Boolean(interactive && !interactive.closest('.xmind-node'));
  };

  const shouldPreventPanStartDefault = (targetValue: EventTarget | null) => {
    const element = getPanTargetElement(targetValue);
    return !element?.closest('a[href],button,input,textarea,select,[contenteditable="true"]');
  };

  const setSpacePanning = (enabled: boolean) => {
    spacePanning = enabled;
    stage.classList.toggle('is-space-panning', enabled);
  };

  const focusStage = () => {
    try {
      stage.focus({ preventScroll: true });
    } catch {
      try {
        stage.focus();
      } catch {
        // Some embedded WebViews expose focus but reject focus options.
      }
    }
  };

  const suppressNextNodeClick = () => {
    suppressNodeClick = true;
    ownerWindow.setTimeout(() => {
      suppressNodeClick = false;
    }, CLICK_SUPPRESSION_MS);
  };

  const onPanzoomStart = () => {
    focusStage();
    panStartState = { x: panX, y: panY, scale: zoom };
    stage.classList.add('is-panning');
  };

  const onPanzoomChange = () => {
    syncPanzoomState(!programmaticPanzoomUpdate);
  };

  const onPanzoomEnd = () => {
    syncPanzoomState(!programmaticPanzoomUpdate);
    stage.classList.remove('is-panning');
    if (panStartState) {
      const moved = Math.abs(panX - panStartState.x) +
        Math.abs(panY - panStartState.y) +
        Math.abs(zoom - panStartState.scale) * 100;
      if (moved > PAN_CLICK_THRESHOLD) {
        suppressNextNodeClick();
      }
    }
    panStartState = null;
  };

  const initializePanzoom = () => {
    panzoom = Panzoom(zoomBox, {
      canvas: true,
      cursor: 'grab',
      minScale: 0.25,
      maxScale: 2.5,
      step: 0.15,
      animate: false,
      origin: '0 0',
      touchAction: 'none',
      excludeClass: PANZOOM_EXCLUDE_CLASS,
      handleStartEvent: event => {
        if (status !== 'ready' || (!spacePanning && isPanBlockedTarget(event.target))) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (shouldPreventPanStartDefault(event.target)) {
          event.preventDefault();
        }
        event.stopPropagation();
        focusStage();
      },
    });
    zoomBox.addEventListener('panzoomstart', onPanzoomStart);
    zoomBox.addEventListener('panzoomchange', onPanzoomChange);
    zoomBox.addEventListener('panzoomend', onPanzoomEnd);
    applyZoom();
  };

  const onStageWheel = (event: WheelEvent) => {
    if (status !== 'ready') {
      return;
    }
    event.preventDefault();
    if (!event.ctrlKey && !event.metaKey) {
      userAdjustedViewport = true;
      if (panzoom) {
        updatePanzoom(() => {
          panzoom?.pan(-event.deltaX, -event.deltaY, {
            animate: false,
            force: true,
            relative: true,
          });
        });
      } else {
        panX -= event.deltaX;
        panY -= event.deltaY;
        applyZoom();
        zoomEmitter.emit();
      }
      return;
    }
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoomAtPoint(zoom + direction * WHEEL_ZOOM_STEP, event.clientX, event.clientY);
  };

  const onStageKeyDown = (event: KeyboardEvent) => {
    if (status !== 'ready') {
      return;
    }
    const step = event.shiftKey ? KEYBOARD_PAN_FAST_STEP : KEYBOARD_PAN_STEP;
    if (event.key === ' ') {
      setSpacePanning(true);
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowLeft') {
      userAdjustedViewport = true;
      panX += step;
    } else if (event.key === 'ArrowRight') {
      userAdjustedViewport = true;
      panX -= step;
    } else if (event.key === 'ArrowUp') {
      userAdjustedViewport = true;
      panY += step;
    } else if (event.key === 'ArrowDown') {
      userAdjustedViewport = true;
      panY -= step;
    } else if ((event.key === '0' || event.key === 'Home') && (event.ctrlKey || event.metaKey)) {
      fitSheetToStage(true);
      event.preventDefault();
      return;
    } else {
      return;
    }
    if (panzoom) {
      updatePanzoom(() => {
        panzoom?.pan(panX, panY, { animate: false, force: true });
      });
    } else {
      applyZoom();
      zoomEmitter.emit();
    }
    event.preventDefault();
  };

  const onStageKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      setSpacePanning(false);
      event.preventDefault();
    }
  };

  const onStageDblClick = (event: MouseEvent) => {
    if (status !== 'ready' || isPanBlockedTarget(event.target)) {
      return;
    }
    fitSheetToStage(true);
    event.preventDefault();
  };

  const onStageDragStart = (event: DragEvent) => {
    event.preventDefault();
  };

  const onStageContextMenu = (event: MouseEvent) => {
    if (stage.classList.contains('is-panning')) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onStageSelectStart = (event: Event) => {
    if (stage.classList.contains('is-panning')) {
      event.preventDefault();
    }
  };

  const stopPanInteractions = () => {
    panStartState = null;
    stage.classList.remove('is-panning');
    setSpacePanning(false);
  };

  const onDocumentVisibilityChange = () => {
    if (ownerDocument.visibilityState === 'hidden') {
      stopPanInteractions();
    }
  };

  const refreshViewport = () => {
    if (disposed || status !== 'ready') {
      return;
    }
    if (userAdjustedViewport) {
      applyZoom();
      zoomEmitter.emit();
      return;
    }
    fitSheetToStage();
  };

  const scheduleViewportRefresh = () => {
    if (resizeFrame !== undefined) {
      ownerWindow.cancelAnimationFrame(resizeFrame);
    }
    resizeFrame = ownerWindow.requestAnimationFrame(() => {
      resizeFrame = undefined;
      refreshViewport();
    });
  };

  const resizeObserver = typeof ownerWindow.ResizeObserver === 'function'
    ? new ownerWindow.ResizeObserver(scheduleViewportRefresh)
    : null;
  resizeObserver?.observe(stage);
  ownerWindow.addEventListener('resize', scheduleViewportRefresh);

  initializePanzoom();
  stage.addEventListener('wheel', onStageWheel, { passive: false });
  stage.addEventListener('keydown', onStageKeyDown);
  stage.addEventListener('keyup', onStageKeyUp);
  stage.addEventListener('dblclick', onStageDblClick);
  stage.addEventListener('dragstart', onStageDragStart);
  stage.addEventListener('contextmenu', onStageContextMenu);
  stage.addEventListener('selectstart', onStageSelectStart);
  ownerWindow.addEventListener('keyup', onStageKeyUp);
  ownerWindow.addEventListener('blur', stopPanInteractions);
  ownerDocument.addEventListener('visibilitychange', onDocumentVisibilityChange);
  zoomOutButton.addEventListener('click', () => setZoomAtStageCenter(zoom - 0.15));
  zoomInButton.addEventListener('click', () => setZoomAtStageCenter(zoom + 0.15));
  resetButton.addEventListener('click', () => fitSheetToStage(true));
  syncState();
  void load();

  return {
    $el: root,
    unmount() {
      disposed = true;
      if (resizeFrame !== undefined) {
        ownerWindow.cancelAnimationFrame(resizeFrame);
        resizeFrame = undefined;
      }
      resizeObserver?.disconnect();
      unregisterFileViewerZoomProvider(root);
      zoomBox.removeEventListener('panzoomstart', onPanzoomStart);
      zoomBox.removeEventListener('panzoomchange', onPanzoomChange);
      zoomBox.removeEventListener('panzoomend', onPanzoomEnd);
      panzoom?.destroy();
      panzoom = null;
      stage.removeEventListener('wheel', onStageWheel);
      stage.removeEventListener('keydown', onStageKeyDown);
      stage.removeEventListener('keyup', onStageKeyUp);
      stage.removeEventListener('dblclick', onStageDblClick);
      stage.removeEventListener('dragstart', onStageDragStart);
      stage.removeEventListener('contextmenu', onStageContextMenu);
      stage.removeEventListener('selectstart', onStageSelectStart);
      ownerWindow.removeEventListener('keyup', onStageKeyUp);
      ownerWindow.removeEventListener('resize', scheduleViewportRefresh);
      ownerWindow.removeEventListener('blur', stopPanInteractions);
      ownerDocument.removeEventListener('visibilitychange', onDocumentVisibilityChange);
      target.replaceChildren();
    },
  };
}

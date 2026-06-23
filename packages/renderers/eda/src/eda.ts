import type { FileRenderContext, FileViewerRenderedInstance } from '@file-viewer/core';
import {
  createEdaLayoutWebglBatch,
  type EdaLayoutWebglBatch,
} from '@file-viewer/eda-layout';
import {
  parseEdaFile,
  type EdaDomainRole,
  type EdaEntity,
  type EdaLayoutElement,
  type EdaLayoutPreview,
  type EdaParseResult,
  type EdaStreamKind,
  type EdaStreamView,
  type EdaTreeNode,
} from './edaParser';

interface TreeRow extends EdaTreeNode {
  depth: number;
}

const roleLabels: Record<EdaDomainRole, string> = {
  root: '根',
  library: '库',
  symbol: '元件符号',
  footprint: '封装',
  padstack: 'Padstack',
  drawing: '图纸',
  metadata: '元数据',
  property: '属性',
  geometry: '几何',
  net: '网络',
  unknown: '未知',
};

const confidenceLabels: Record<EdaParseResult['stats']['confidence'], string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const edaStyle = `
.eda-viewer{position:relative;height:100%;min-height:0;display:flex;flex-direction:column;background:#edf1f5;color:#172033;box-sizing:border-box}
.eda-viewer *{box-sizing:border-box}
.eda-header{min-height:84px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 176px 18px 22px;border-bottom:1px solid rgba(23,32,51,.08);background:#fff}
.eda-header span,.eda-panel-head span{color:#0b7480;font-size:12px;font-weight:900;letter-spacing:0}
.eda-header h2{margin:4px 0 0;font-size:22px;line-height:1.2}
.eda-header dl{display:grid;grid-template-columns:repeat(4,minmax(70px,auto));gap:10px;margin:0}
.eda-header dt,.eda-header dd,.eda-entity-group dl,.eda-entity-group dt,.eda-entity-group dd{margin:0}
.eda-header dt{color:#718096;font-size:12px}
.eda-header dd{color:#172033;font-weight:900}
.eda-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(300px,32%) minmax(0,1fr)}
.eda-sidebar{min-height:0;display:flex;flex-direction:column;gap:12px;padding:16px;border-right:1px solid rgba(23,32,51,.08);background:rgba(255,255,255,.74)}
.eda-summary,.eda-warning,.eda-panel,.eda-error{border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px rgba(23,32,51,.06)}
.eda-summary,.eda-warning{padding:12px}
.eda-summary strong{display:block;color:#172033}
.eda-summary p,.eda-warning p,.eda-empty p,.eda-entity-group p{margin:6px 0 0;color:#64748b;line-height:1.55}
.eda-mini-grid,.eda-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.eda-mini-grid div,.eda-stat-grid div{min-width:0;padding:10px;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1px rgba(23,32,51,.06)}
.eda-mini-grid span,.eda-stat-grid span{display:block;color:#718096;font-size:12px}
.eda-mini-grid strong,.eda-stat-grid strong{display:block;margin-top:4px;overflow:hidden;color:#172033;font-size:18px;text-overflow:ellipsis;white-space:nowrap}
.eda-warning{background:#fff7e8;color:#8a4b00}
.eda-search{height:42px;padding:0 12px;border-radius:12px;border:1px solid rgba(23,32,51,.1);outline:none;background:#fff;font:inherit}
.eda-stream-list{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px}
.eda-stream{min-height:78px;display:grid;grid-template-columns:74px minmax(0,1fr);gap:8px 10px;align-items:center;padding:10px;border:1px solid rgba(23,32,51,.08);border-radius:13px;background:#fff;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eda-stream:hover,.eda-stream.active,.eda-tree button:hover,.eda-tree button.active,.eda-entity-group button:hover{border-color:rgba(11,116,128,.3);box-shadow:0 10px 22px rgba(23,32,51,.08)}
.eda-stream span{grid-row:span 3;min-height:40px;display:inline-flex;align-items:center;justify-content:center;padding:0 8px;border-radius:10px;background:rgba(11,116,128,.12);color:#0b7480;font-size:11px;font-weight:900}
.eda-stream span[data-role='symbol']{background:rgba(34,134,90,.14);color:#1d7a52}
.eda-stream span[data-role='footprint'],.eda-stream span[data-role='padstack']{background:rgba(111,87,190,.14);color:#5c47a5}
.eda-stream strong,.eda-stream em,.eda-tree strong,.eda-tree em,.eda-tree small,.eda-entity-group strong,.eda-entity-group span,.eda-entity-group dd{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-stream em,.eda-stream small{color:#718096;font-size:12px;font-style:normal}
.eda-preview{min-width:0;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:14px;padding:16px}
.eda-panel{min-height:0;overflow:hidden}
.eda-panel-head{min-height:54px;padding:12px 14px;border-bottom:1px solid rgba(23,32,51,.08)}
.eda-panel-head strong{display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-panel--compact .eda-panel-head{min-height:auto}
.eda-stat-grid{padding:14px}
.eda-stat-grid div{background:#f6f9fb}
.eda-topology,.eda-bottom{min-height:300px;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:14px}
.eda-topology>.eda-panel{min-height:360px;max-height:min(58vh,620px);display:flex;flex-direction:column}
.eda-tree,.eda-entities,.eda-diagnostics,.eda-string-grid{min-height:0;max-height:380px;overflow:auto;overscroll-behavior:contain}
.eda-tree{flex:1;max-height:none;padding:10px}
.eda-entities{flex:1;max-height:none;padding:12px}
.eda-tree button{width:100%;min-height:42px;display:grid;grid-template-columns:minmax(22px,auto) minmax(0,1fr) minmax(72px,auto) minmax(72px,auto);gap:8px;align-items:center;margin-bottom:6px;padding:8px;border:1px solid rgba(23,32,51,.06);border-radius:10px;background:#f8fafc;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eda-tree span{color:#0b7480;font-weight:900}
.eda-tree em,.eda-tree small{color:#718096;font-size:12px;font-style:normal}
.eda-entity-group+.eda-entity-group{margin-top:16px}
.eda-entity-group h3{margin:0 0 8px;color:#172033;font-size:14px}
.eda-entity-group button{width:100%;display:block;margin-bottom:8px;padding:12px;border:1px solid rgba(23,32,51,.08);border-radius:12px;background:#f8fafc;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eda-entity-group button>span{display:block;margin-top:4px;color:#718096;font-size:12px}
.eda-entity-group dl{display:grid;gap:6px;margin-top:10px}
.eda-entity-group dl div{min-width:0;display:grid;grid-template-columns:90px minmax(0,1fr);gap:8px;color:#475569;font-size:12px}
.eda-entity-group dt{color:#718096;font-weight:800}
.eda-selected-meta,.eda-property-grid,.eda-local-strings{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px 0}
.eda-selected-meta span,.eda-property-grid div,.eda-local-strings span{min-width:0;display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#eef6f7;color:#0b7480;font-size:12px;font-weight:800}
.eda-selected-meta span,.eda-local-strings span{padding:6px 10px}
.eda-property-grid div{max-width:100%;padding:6px 10px}
.eda-property-grid span{color:#64748b;font-weight:700}
.eda-property-grid strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-panel pre{min-height:220px;max-height:440px;margin:12px 0 0;overflow:auto;padding:16px;border-top:1px solid rgba(23,32,51,.08);background:#101725;color:#d9e7ff;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.eda-layout-panel{min-height:360px;display:flex;flex-direction:column}
.eda-layout-meta{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(23,32,51,.08)}
.eda-layout-meta span{border-radius:999px;padding:6px 10px;background:#eef6f7;color:#0b7480;font-size:12px;font-weight:800}
.eda-layout-canvas{flex:1;min-height:320px;overflow:auto;background:#111827}
.eda-layout-svg{display:block;min-width:860px;min-height:420px;background:#111827}
.eda-layout-webgl-wrap{position:relative;display:inline-block;min-width:860px;min-height:420px;background:#111827}
.eda-layout-webgl{display:block;background:#111827}
.eda-layout-label-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.eda-layout-label-layer span{position:absolute;max-width:220px;transform:translate(8px,-18px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d9f99d;text-shadow:0 1px 3px #020617;font:700 12px ui-sans-serif,system-ui,sans-serif}
.eda-layout-svg polygon{fill-opacity:.28;stroke-width:1.4;vector-effect:non-scaling-stroke}
.eda-layout-svg polyline{fill:none;stroke-width:2;vector-effect:non-scaling-stroke}
.eda-layout-svg circle{stroke-width:1.4;vector-effect:non-scaling-stroke}
.eda-layout-svg text{paint-order:stroke;stroke:#111827;stroke-width:3px;stroke-linejoin:round;font:700 13px ui-sans-serif,system-ui,sans-serif}
.eda-empty{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}
.eda-string-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));align-content:start;gap:8px;padding:14px}
.eda-string-grid span{min-width:0;padding:8px 10px;border-radius:10px;background:#f6f9fb;color:#334155;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-diagnostics{padding:14px}
.eda-diagnostics p{margin:0 0 8px;padding:10px;border-radius:10px;background:#f6f9fb;color:#475569;line-height:1.5}
.eda-diagnostics p[data-level='warning']{background:#fff7e8;color:#8a4b00}
.eda-diagnostics span{display:inline-flex;margin-right:8px;color:#0b7480;font-size:11px;font-weight:900;text-transform:uppercase}
.eda-local-strings{padding-bottom:14px}
.eda-local-strings strong{width:100%;color:#172033;font-size:13px}
.eda-state{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;background:rgba(237,241,245,.9);z-index:2}
.eda-state span{width:32px;height:32px;border-radius:999px;border:3px solid rgba(11,116,128,.16);border-top-color:#0b7480;animation:eda-spin .9s linear infinite}
.eda-error{position:absolute;right:18px;bottom:18px;width:min(440px,calc(100% - 36px));padding:14px;background:#fff7e8;color:#8a4b00;z-index:3}
@keyframes eda-spin{to{transform:rotate(360deg)}}
.file-viewer[data-viewer-theme='dark'] .eda-viewer{background:#172033;color:#e5eef8}
.file-viewer[data-viewer-theme='dark'] .eda-header,.file-viewer[data-viewer-theme='dark'] .eda-summary,.file-viewer[data-viewer-theme='dark'] .eda-panel,.file-viewer[data-viewer-theme='dark'] .eda-sidebar{background:#fff;color:#172033}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .eda-viewer{background:#172033;color:#e5eef8}.file-viewer[data-viewer-theme='system'] .eda-header,.file-viewer[data-viewer-theme='system'] .eda-summary,.file-viewer[data-viewer-theme='system'] .eda-panel,.file-viewer[data-viewer-theme='system'] .eda-sidebar{background:#fff;color:#172033}}
@media (max-width:980px){.eda-header,.eda-body,.eda-topology,.eda-bottom{grid-template-columns:1fr}.eda-header{align-items:flex-start;flex-direction:column;padding-right:22px}.eda-body{display:flex;flex-direction:column}.eda-sidebar{max-height:42vh;border-right:0;border-bottom:1px solid rgba(23,32,51,.08)}}
@media (max-width:640px){.eda-header dl,.eda-mini-grid,.eda-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.eda-tree button{grid-template-columns:minmax(22px,auto) minmax(0,1fr)}.eda-tree em,.eda-tree small{display:none}}
`;

const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return '-';
  }
  if (value < 1024) {
    return `${value} B`;
  }
  const mb = value / 1024 / 1024;
  if (mb >= 1) {
    return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  }
  return `${(value / 1024).toFixed(value < 10 * 1024 ? 1 : 0)} KB`;
};

const roleLabel = (role: EdaDomainRole) => roleLabels[role] || role;

const kindLabel = (kind: EdaStreamKind) => {
  return kind === 'storage' ? '目录' : kind === 'text' ? '文本' : '二进制';
};

const normalizePath = (value: string) => value.replace(/^\/+/, '').toLowerCase();

const flattenTree = (nodes: EdaTreeNode[], depth = 0): TreeRow[] => {
  return nodes.flatMap(node => [
    { ...node, depth },
    ...flattenTree(node.children, depth + 1),
  ]);
};

const createStyle = () => {
  const style = document.createElement('style');
  style.textContent = edaStyle;
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

const appendDefinition = (list: HTMLDListElement, label: string, value: string) => {
  const item = document.createElement('div');
  item.append(createElement('dt', undefined, label), createElement('dd', undefined, value));
  list.append(item);
};

const appendPanelHead = (panel: HTMLElement, title: string, value: string) => {
  const head = createElement('div', 'eda-panel-head');
  head.append(createElement('span', undefined, title), createElement('strong', undefined, value));
  panel.append(head);
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const layoutPalette = [
  '#5eead4',
  '#93c5fd',
  '#c4b5fd',
  '#f9a8d4',
  '#fde68a',
  '#86efac',
  '#fdba74',
  '#67e8f9',
];

const WEBGL_LAYOUT_ELEMENT_THRESHOLD = 360;
const WEBGL_LAYOUT_VERTEX_THRESHOLD = 1800;
const WEBGL_FLOATS_PER_VERTEX = 5;

const layoutColor = (element: EdaLayoutElement) => {
  const layer = Number.isFinite(element.layer) ? Number(element.layer) : 0;
  return layoutPalette[Math.abs(layer) % layoutPalette.length];
};

const countLayoutVertices = (layout: EdaLayoutPreview) => {
  return layout.elements.reduce((total, element) => total + element.xy.length, 0);
};

const shouldUseWebglLayoutPreview = (layout: EdaLayoutPreview) => {
  return layout.format === 'gdsii' && (
    layout.elements.length >= WEBGL_LAYOUT_ELEMENT_THRESHOLD ||
    countLayoutVertices(layout) >= WEBGL_LAYOUT_VERTEX_THRESHOLD
  );
};

const formatOptionalNumber = (value?: number) => {
  if (!Number.isFinite(value)) {
    return '-';
  }
  return Math.abs(Number(value)) < 0.001 ? Number(value).toExponential(2) : String(value);
};

const createSvgElement = <K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string | number>
) => {
  const element = document.createElementNS(SVG_NS, tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });
  return element;
};

const createWebglShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const createWebglProgram = (gl: WebGLRenderingContext) => {
  const vertexShader = createWebglShader(gl, gl.VERTEX_SHADER, `
    attribute vec2 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      gl_PointSize = 5.0;
      v_color = a_color;
    }
  `);
  const fragmentShader = createWebglShader(gl, gl.FRAGMENT_SHADER, `
    precision mediump float;
    varying vec3 v_color;
    uniform float u_alpha;
    void main() {
      gl_FragColor = vec4(v_color, u_alpha);
    }
  `);
  if (!vertexShader || !fragmentShader) {
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

const drawWebglVertices = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  vertices: Float32Array,
  mode: number,
  alpha: number
) => {
  if (!vertices.length) {
    return;
  }
  const buffer = gl.createBuffer();
  if (!buffer) {
    return;
  }
  const stride = WEBGL_FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getAttribLocation(program, 'a_color');
  const alphaLocation = gl.getUniformLocation(program, 'u_alpha');
  if (positionLocation < 0 || colorLocation < 0 || !alphaLocation) {
    gl.deleteBuffer(buffer);
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(colorLocation);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
  gl.uniform1f(alphaLocation, alpha);
  gl.drawArrays(mode, 0, vertices.length / WEBGL_FLOATS_PER_VERTEX);
  gl.deleteBuffer(buffer);
};

const renderWebglBatch = (
  gl: WebGLRenderingContext,
  batch: EdaLayoutWebglBatch,
  width: number,
  height: number
) => {
  const program = createWebglProgram(gl);
  if (!program) {
    return false;
  }
  gl.viewport(0, 0, width, height);
  gl.clearColor(0.066, 0.094, 0.153, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  drawWebglVertices(gl, program, batch.triangleVertices, gl.TRIANGLES, 0.32);
  drawWebglVertices(gl, program, batch.lineVertices, gl.LINES, 0.92);
  drawWebglVertices(gl, program, batch.pointVertices, gl.POINTS, 0.98);
  gl.deleteProgram(program);
  return true;
};

const createWebglLayoutPreview = (
  layout: EdaLayoutPreview,
  width: number,
  height: number
) => {
  const batch = createEdaLayoutWebglBatch(layout, { palette: layoutPalette });
  const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const wrap = createElement('div', 'eda-layout-webgl-wrap');
  wrap.style.width = `${width}px`;
  wrap.style.height = `${height}px`;
  const canvas = document.createElement('canvas');
  canvas.className = 'eda-layout-webgl';
  canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
  canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: true,
    preserveDrawingBuffer: true,
  }) || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  if (!gl || !renderWebglBatch(gl, batch, canvas.width, canvas.height)) {
    return null;
  }

  if (batch.labels.length) {
    const labelLayer = createElement('div', 'eda-layout-label-layer');
    batch.labels.forEach(label => {
      const item = createElement('span', undefined, label.text);
      item.title = label.text;
      item.style.left = `${((label.clipX + 1) / 2) * width}px`;
      item.style.top = `${((1 - label.clipY) / 2) * height}px`;
      labelLayer.append(item);
    });
    wrap.append(canvas, labelLayer);
  } else {
    wrap.append(canvas);
  }

  return {
    element: wrap,
    batch,
  };
};

const createLayoutPreview = (layout: EdaLayoutPreview) => {
  const panel = createElement('section', 'eda-panel eda-layout-panel');
  const layoutLabel = layout.format === 'oasis' ? 'OASIS' : 'GDSII';
  appendPanelHead(panel, '版图预览', `${layoutLabel} · ${layout.structureCount || layout.structures.length} structures · ${layout.elements.length} elements`);

  const meta = createElement('div', 'eda-layout-meta');
  [
    `Library: ${layout.libraryName || '-'}`,
    `User unit: ${formatOptionalNumber(layout.userUnit)}`,
    `DB unit: ${formatOptionalNumber(layout.databaseUnit)}`,
  ].forEach(item => meta.append(createElement('span', undefined, item)));
  panel.append(meta);

  if (!layout.bounds || !layout.elements.length) {
    panel.append(createEmpty('没有可绘制几何', `已读取 ${layoutLabel} 头部和 structure 信息，但未发现 boundary、path、text 或 reference 元素。`));
    return panel;
  }

  const bounds = layout.bounds;
  const rawWidth = Math.max(1, bounds.maxX - bounds.minX);
  const rawHeight = Math.max(1, bounds.maxY - bounds.minY);
  const targetWidth = 1200;
  const targetHeight = Math.max(460, Math.min(1100, Math.round(targetWidth * rawHeight / rawWidth)));
  const padding = 40;
  const scale = Math.min(
    (targetWidth - padding * 2) / rawWidth,
    (targetHeight - padding * 2) / rawHeight
  );
  const svgWidth = Math.max(860, Math.round(rawWidth * scale + padding * 2));
  const svgHeight = Math.max(420, Math.round(rawHeight * scale + padding * 2));
  const mapPoint = (point: { x: number; y: number }) => ({
    x: (point.x - bounds.minX) * scale + padding,
    y: (bounds.maxY - point.y) * scale + padding,
  });
  const pointList = (points: Array<{ x: number; y: number }>) => points
    .map(point => {
      const mapped = mapPoint(point);
      return `${mapped.x.toFixed(2)},${mapped.y.toFixed(2)}`;
    })
    .join(' ');

  const canvas = createElement('div', 'eda-layout-canvas');
  const webglPreview = shouldUseWebglLayoutPreview(layout)
    ? createWebglLayoutPreview(layout, svgWidth, svgHeight)
    : null;
  if (webglPreview) {
    meta.append(createElement('span', undefined, `Renderer: WebGL · ${webglPreview.batch.elementCount} elements`));
    webglPreview.batch.warnings.forEach(item => {
      const warning = createElement('div', 'eda-warning');
      warning.append(createElement('p', undefined, item));
      panel.append(warning);
    });
    canvas.append(webglPreview.element);
    panel.append(canvas);
    return panel;
  }

  meta.append(createElement('span', undefined, 'Renderer: SVG'));
  const svg = createSvgElement('svg', {
    class: 'eda-layout-svg',
    width: svgWidth,
    height: svgHeight,
    viewBox: `0 0 ${svgWidth} ${svgHeight}`,
    role: 'img',
    'aria-label': `${layoutLabel} layout preview`,
  });
  svg.append(createSvgElement('rect', {
    x: 0,
    y: 0,
    width: svgWidth,
    height: svgHeight,
    fill: '#111827',
  }));

  layout.elements.forEach(element => {
    const color = layoutColor(element);
    if ((element.kind === 'boundary' || element.kind === 'aref') && element.xy.length >= 3) {
      svg.append(createSvgElement('polygon', {
        points: pointList(element.xy),
        fill: color,
        stroke: color,
      }));
      return;
    }

    if (element.kind === 'path' && element.xy.length >= 2) {
      const strokeWidth = Math.max(1.4, Math.min(10, (element.width || rawWidth / 500) * scale));
      svg.append(createSvgElement('polyline', {
        points: pointList(element.xy),
        stroke: color,
        'stroke-width': strokeWidth,
      }));
      return;
    }

    const anchor = element.xy[0];
    if (!anchor) {
      return;
    }
    const mapped = mapPoint(anchor);
    svg.append(createSvgElement('circle', {
      cx: mapped.x,
      cy: mapped.y,
      r: 4.5,
      fill: '#111827',
      stroke: color,
    }));
    const label = element.text || element.reference || element.kind.toUpperCase();
    if (label) {
      const text = createSvgElement('text', {
        x: mapped.x + 8,
        y: mapped.y - 8,
        fill: color,
      });
      text.append(document.createTextNode(label));
      svg.append(text);
    }
  });

  canvas.append(svg);
  panel.append(canvas);
  return panel;
};

const buildStatsCards = (parsed: EdaParseResult) => {
  const stats = parsed.stats;
  return [
    { label: '文本流', value: stats.textStreams },
    { label: '二进制流', value: stats.binaryStreams },
    { label: '目录', value: stats.storageEntries },
    { label: '属性', value: stats.propertyCount },
    { label: '符号', value: stats.symbolCount },
    { label: '封装', value: stats.footprintCount },
    { label: 'Padstack', value: stats.padstackCount },
    { label: '可信度', value: confidenceLabels[stats.confidence] },
  ];
};

const buildEntityGroups = (entities: EdaEntity[]) => {
  const groups: Array<{ role: EdaDomainRole; label: string; items: EdaEntity[] }> = [
    { role: 'symbol', label: '元件符号', items: [] },
    { role: 'footprint', label: '封装图形', items: [] },
    { role: 'padstack', label: 'Padstack', items: [] },
    { role: 'drawing', label: '图纸信息', items: [] },
  ];
  groups.forEach(group => {
    group.items = entities.filter(entity => entity.role === group.role);
  });
  return groups.filter(group => group.items.length);
};

const appendStatGrid = (target: HTMLElement, items: Array<{ label: string; value: string | number }>, className: string) => {
  const grid = createElement('div', className);
  items.forEach(item => {
    const cell = document.createElement('div');
    cell.append(createElement('span', undefined, item.label), createElement('strong', undefined, String(item.value)));
    grid.append(cell);
  });
  target.append(grid);
};

const createEmpty = (title: string, description: string) => {
  const empty = createElement('div', 'eda-empty');
  empty.append(createElement('strong', undefined, title), createElement('p', undefined, description));
  return empty;
};

export default async function renderEda(
  buffer: ArrayBuffer,
  target: HTMLDivElement,
  type = 'olb',
  context?: FileRenderContext
): Promise<FileViewerRenderedInstance> {
  const normalizedType = ['dra', 'gds', 'oas', 'oasis'].includes(type) ? type : 'olb';
  const filename = context?.filename || `preview.${normalizedType}`;
  const root = createElement('section', 'eda-viewer');
  const style = createStyle();
  const cleanups: Array<() => void> = [];
  let selectedStream: EdaStreamView | null = null;
  let parsedResult: EdaParseResult | null = null;

  target.replaceChildren(style, root);

  const listen = <K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    listener: (event: HTMLElementEventMap[K]) => void
  ) => {
    element.addEventListener(event, listener as EventListener);
    cleanups.push(() => element.removeEventListener(event, listener as EventListener));
  };

  const showLoading = () => {
    const state = createElement('div', 'eda-state');
    state.append(createElement('span'), createElement('strong', undefined, `正在解析 ${normalizedType.toUpperCase()}...`));
    root.append(state);
    return state;
  };

  const showError = (message: string) => {
    const error = createElement('div', 'eda-error');
    error.append(createElement('strong', undefined, 'EDA 预览提示'), createElement('p', undefined, message));
    root.append(error);
  };

  const renderParsed = (parsed: EdaParseResult) => {
    parsedResult = parsed;
    selectedStream = parsed.streams.find(stream => stream.properties.length)
      || parsed.streams.find(stream => stream.kind === 'text')
      || parsed.streams[0]
      || null;

    const statsCards = buildStatsCards(parsed);
    const treeRows = flattenTree(parsed.tree);
    const entityGroups = buildEntityGroups(parsed.entities);

    root.replaceChildren();

    const header = createElement('header', 'eda-header');
    const headerTitle = document.createElement('div');
    headerTitle.append(
      createElement('span', undefined, parsed.parser === 'cfb' ? 'CFB STRUCTURE VIEWER' : 'BINARY STRUCTURE VIEWER'),
      createElement('h2', undefined, filename)
    );
    const headerStats = document.createElement('dl');
    appendDefinition(headerStats, '格式', parsed.type.toUpperCase());
    appendDefinition(headerStats, '大小', formatBytes(parsed.byteLength));
    appendDefinition(headerStats, '条目', String(parsed.streamCount));
    appendDefinition(headerStats, '可信度', confidenceLabels[parsed.stats.confidence]);
    header.append(headerTitle, headerStats);

    const body = createElement('div', 'eda-body');
    const sidebar = createElement('aside', 'eda-sidebar');
    const summary = createElement('div', 'eda-summary');
    summary.append(
      createElement('strong', undefined, parsed.title),
      createElement('p', undefined, parsed.type === 'gds' || parsed.type === 'oas' || parsed.type === 'oasis'
        ? parsed.layout
          ? `${parsed.layout.format === 'oasis' ? 'OASIS' : 'GDSII'} 属于芯片版图工程文件。预览器已在浏览器端解析可识别几何，小图生成 SVG，大图自动切换 WebGL canvas，同时保留结构、字符串和诊断索引。`
          : 'GDSII / OASIS 属于芯片版图工程文件。预览器优先索引结构、属性、可读字符串和二进制线索，并在纯前端安全退化。'
        : 'OLB / DRA 属于 OrCAD / Allegro 生态的私有设计数据。预览器优先解析 CFB 结构、对象候选、属性和可读文本，并在纯前端安全退化。')
    );
    sidebar.append(summary);
    appendStatGrid(sidebar, statsCards.slice(0, 4), 'eda-mini-grid');

    if (parsed.warnings.length) {
      const warning = createElement('div', 'eda-warning');
      parsed.warnings.forEach(item => warning.append(createElement('p', undefined, item)));
      sidebar.append(warning);
    }

    const search = createElement('input', 'eda-search') as HTMLInputElement;
    search.type = 'search';
    search.placeholder = '筛选路径、角色、属性或文本';
    sidebar.append(search);

    const streamList = createElement('div', 'eda-stream-list');
    const preview = createElement('main', 'eda-preview');
    let streamButtons: Array<{ path: string; button: HTMLButtonElement }> = [];

    const currentPanel = createElement('section', 'eda-panel');
    const selectedHead = createElement('div', 'eda-panel-head');
    const selectedTitle = createElement('span', undefined, '当前条目');
    const selectedPath = createElement('strong', undefined, '未选择');
    selectedHead.append(selectedTitle, selectedPath);
    const selectedMeta = createElement('div', 'eda-selected-meta');
    const selectedProperties = createElement('div', 'eda-property-grid');
    const selectedPreviewContainer = document.createElement('div');
    currentPanel.append(selectedHead, selectedMeta, selectedProperties, selectedPreviewContainer);

    const localStrings = createElement('div', 'eda-local-strings');

    const syncSelection = () => {
      streamButtons.forEach(({ path, button }) => {
        button.classList.toggle('active', normalizePath(path) === normalizePath(selectedStream?.path || ''));
      });
      selectedPath.textContent = selectedStream?.path || '未选择';
      selectedMeta.replaceChildren();
      selectedProperties.replaceChildren();
      selectedPreviewContainer.replaceChildren();
      localStrings.replaceChildren();

      if (!selectedStream) {
        selectedPreviewContainer.append(createEmpty('目录条目', '该节点用于组织下级流，没有可直接展示的文本或十六进制片段。'));
        return;
      }

      selectedMeta.append(
        createElement('span', undefined, roleLabel(selectedStream.role)),
        createElement('span', undefined, kindLabel(selectedStream.kind)),
        createElement('span', undefined, formatBytes(selectedStream.size))
      );

      selectedStream.properties.forEach(property => {
        const item = document.createElement('div');
        item.append(createElement('span', undefined, property.key), createElement('strong', undefined, property.value));
        selectedProperties.append(item);
      });

      const previewText = selectedStream.sample || selectedStream.hex || '';
      if (previewText) {
        selectedPreviewContainer.append(createElement('pre', undefined, previewText));
      } else {
        selectedPreviewContainer.append(createEmpty('目录条目', '该节点用于组织下级流，没有可直接展示的文本或十六进制片段。'));
      }

      if (selectedStream.strings.length) {
        localStrings.append(createElement('strong', undefined, '当前条目字符串'));
        selectedStream.strings.forEach(item => localStrings.append(createElement('span', undefined, item)));
      }
    };

    const selectStream = (stream: EdaStreamView) => {
      selectedStream = stream;
      syncSelection();
    };

    const selectTreeRow = (row: TreeRow) => {
      const rowPath = normalizePath(row.path);
      const stream = parsed.streams.find(item => normalizePath(item.path) === rowPath);
      if (stream) {
        selectStream(stream);
      }
    };

    const selectEntity = (entity: EdaEntity) => {
      const entityPath = normalizePath(entity.path);
      const stream = parsed.streams.find(item => {
        const streamPath = normalizePath(item.path);
        return streamPath === entityPath || streamPath.startsWith(`${entityPath}/`);
      });
      if (stream) {
        selectStream(stream);
      }
    };

    const matchesFilter = (stream: EdaStreamView, keyword: string) => {
      if (!keyword) {
        return true;
      }
      const propertyText = stream.properties.map(property => `${property.key}=${property.value}`).join('\n');
      const text = `${stream.path}\n${stream.name}\n${stream.kind}\n${stream.role}\n${stream.sample || ''}\n${stream.strings.join('\n')}\n${propertyText}`.toLowerCase();
      return text.includes(keyword);
    };

    const renderStreams = () => {
      const keyword = search.value.trim().toLowerCase();
      streamList.replaceChildren();
      streamButtons = [];
      parsed.streams.filter(stream => matchesFilter(stream, keyword)).forEach(stream => {
        const button = createElement('button', 'eda-stream') as HTMLButtonElement;
        button.type = 'button';
        const role = createElement('span', undefined, roleLabel(stream.role));
        role.dataset.role = stream.role;
        button.append(
          role,
          createElement('strong', undefined, stream.name || stream.path),
          createElement('em', undefined, stream.path),
          createElement('small', undefined, `${kindLabel(stream.kind)} · ${formatBytes(stream.size)}`)
        );
        listen(button, 'click', () => selectStream(stream));
        streamButtons.push({ path: stream.path, button });
        streamList.append(button);
      });
      syncSelection();
    };

    listen(search, 'input', renderStreams);
    sidebar.append(streamList);

    const overview = createElement('section', 'eda-panel eda-panel--compact');
    appendPanelHead(overview, '解析概览', `${parsed.parser.toUpperCase()} · ${formatBytes(parsed.totalStreamBytes)}`);
    appendStatGrid(overview, statsCards, 'eda-stat-grid');

    const topology = createElement('section', 'eda-topology');
    const treePanel = createElement('div', 'eda-panel');
    appendPanelHead(treePanel, '结构树', `${treeRows.length} 节点`);
    const tree = createElement('div', 'eda-tree');
    treeRows.forEach(row => {
      const button = createElement('button') as HTMLButtonElement;
      button.type = 'button';
      const twist = createElement('span', undefined, row.children.length ? '▸' : '•');
      twist.style.paddingLeft = `${row.depth * 14}px`;
      button.append(
        twist,
        createElement('strong', undefined, row.name),
        createElement('em', undefined, roleLabel(row.role)),
        createElement('small', undefined, row.size ? formatBytes(row.size) : kindLabel(row.kind))
      );
      listen(button, 'click', () => selectTreeRow(row));
      tree.append(button);
    });
    treePanel.append(tree);

    const entityPanel = createElement('div', 'eda-panel');
    appendPanelHead(entityPanel, 'EDA 对象', `${parsed.entities.length} 项`);
    if (entityGroups.length) {
      const entityRoot = createElement('div', 'eda-entities');
      entityGroups.forEach(group => {
        const groupRoot = createElement('div', 'eda-entity-group');
        groupRoot.append(createElement('h3', undefined, group.label));
        group.items.forEach(entity => {
          const button = createElement('button') as HTMLButtonElement;
          button.type = 'button';
          button.append(
            createElement('strong', undefined, entity.name),
            createElement('span', undefined, `${formatBytes(entity.byteLength)} · ${entity.streamCount} 条目`)
          );
          if (entity.description) {
            button.append(createElement('p', undefined, entity.description));
          }
          const detail = document.createElement('dl');
          const addDetail = (label: string, values: string | string[] | undefined) => {
            const normalized = Array.isArray(values) ? values.join(', ') : values;
            if (!normalized) {
              return;
            }
            appendDefinition(detail, label, normalized);
          };
          addDetail('Footprint', entity.footprint);
          addDetail('Pins', entity.pins);
          addDetail('Layers', entity.layers);
          addDetail('Keywords', entity.keywords);
          button.append(detail);
          listen(button, 'click', () => selectEntity(entity));
          groupRoot.append(button);
        });
        entityRoot.append(groupRoot);
      });
      entityPanel.append(entityRoot);
    } else {
      entityPanel.append(createEmpty('没有明确对象候选', '仍可从结构树、属性和字符串索引中查看可读内容。'));
    }
    topology.append(treePanel, entityPanel);

    const bottom = createElement('section', 'eda-bottom');
    const stringsPanel = createElement('div', 'eda-panel');
    appendPanelHead(stringsPanel, '可读字符串', `${parsed.strings.length} 项`);
    const stringGrid = createElement('div', 'eda-string-grid');
    parsed.strings.forEach(item => stringGrid.append(createElement('span', undefined, item)));
    stringsPanel.append(stringGrid);

    const diagnosticsPanel = createElement('div', 'eda-panel');
    appendPanelHead(diagnosticsPanel, '诊断', `${parsed.diagnostics.length} 条`);
    const diagnostics = createElement('div', 'eda-diagnostics');
    parsed.diagnostics.forEach(diagnostic => {
      const item = createElement('p');
      item.dataset.level = diagnostic.level;
      item.append(createElement('span', undefined, diagnostic.level), document.createTextNode(diagnostic.message));
      diagnostics.append(item);
    });
    diagnosticsPanel.append(diagnostics, localStrings);
    bottom.append(stringsPanel, diagnosticsPanel);

    if (parsed.layout) {
      preview.append(createLayoutPreview(parsed.layout));
    }
    preview.append(overview, topology, currentPanel, bottom);
    body.append(sidebar, preview);
    root.append(header, body);
    renderStreams();
  };

  const loading = showLoading();
  try {
    const parsed = await parseEdaFile(buffer, normalizedType);
    renderParsed(parsed);
  } catch (nextError) {
    console.error(nextError);
    root.replaceChildren();
    showError(nextError instanceof Error ? nextError.message : String(nextError));
  } finally {
    loading.remove();
  }

  return {
    $el: root,
    unmount() {
      cleanups.splice(0).forEach(cleanup => cleanup());
      parsedResult = null;
      selectedStream = null;
      target.replaceChildren();
    },
  };
}

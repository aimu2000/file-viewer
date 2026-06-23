import {
  createFileViewerZoomChangeEmitter,
  registerFileViewerZoomProvider,
  unregisterFileViewerZoomProvider,
  type FileViewerRenderedInstance,
  type FileViewerZoomState
} from '@file-viewer/core'

interface PsdLayerItem {
  id: string
  name: string
  depth: number
  left: number
  top: number
  width: number
  height: number
  hidden: boolean
  canvas?: HTMLCanvasElement
}

const psdStyle = `
.psd-viewer{display:grid;height:100%;min-height:460px;grid-template-rows:auto minmax(0,1fr);--psd-bg:#eef1f4;--psd-surface:#fff;--psd-border:rgba(15,23,42,.1);--psd-text:#132235;--psd-muted:#64748b;--psd-accent:#0f766e;background:var(--psd-bg);color:var(--psd-text);box-sizing:border-box}
.psd-toolbar{position:sticky;top:0;z-index:2;display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:14px;padding:10px 16px;border-bottom:1px solid var(--psd-border);background:rgba(255,255,255,.92);backdrop-filter:blur(12px);box-sizing:border-box}
.psd-title{display:flex;min-width:0;flex-direction:column;gap:2px}
.psd-title strong{overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}
.psd-title span{color:var(--psd-muted);font-size:12px;font-weight:700}
.psd-actions{display:flex;flex-shrink:0;align-items:center;gap:6px}
.psd-actions button{height:30px;min-width:34px;border:1px solid rgba(100,116,139,.28);border-radius:6px;background:#fff;color:#132235;cursor:pointer;font-size:12px;font-weight:800}
.psd-actions button:hover{border-color:rgba(15,118,110,.45);color:var(--psd-accent)}
.psd-actions span{min-width:48px;color:var(--psd-muted);font-size:12px;font-weight:800;text-align:center}
.psd-layout{display:grid;min-height:0;grid-template-columns:280px minmax(0,1fr)}
.psd-sidebar{min-height:0;overflow:auto;border-right:1px solid var(--psd-border);background:rgba(248,250,252,.86)}
.psd-sidebar-header{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border-bottom:1px solid var(--psd-border);background:rgba(248,250,252,.94);font-size:12px;font-weight:800}
.psd-layer-list{margin:0;padding:8px;list-style:none}
.psd-layer{display:grid;grid-template-columns:auto minmax(0,1fr);gap:8px;align-items:start;margin:0 0 6px;padding:8px;border:1px solid transparent;border-radius:8px;background:#fff}
.psd-layer:hover{border-color:rgba(15,118,110,.24)}
.psd-layer input{margin-top:2px;accent-color:var(--psd-accent)}
.psd-layer strong{display:block;overflow:hidden;font-size:12px;text-overflow:ellipsis;white-space:nowrap}
.psd-layer span{display:block;margin-top:3px;color:var(--psd-muted);font-size:11px}
.psd-stage{min-width:0;min-height:0;overflow:auto;padding:28px}
.psd-canvas-wrap{display:inline-block;transform-origin:top left;transition:transform .18s ease}
.psd-canvas-shell{display:inline-block;padding:18px;border:1px solid var(--psd-border);border-radius:8px;background:
  linear-gradient(45deg,#e5e7eb 25%,transparent 25%),
  linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),
  linear-gradient(45deg,transparent 75%,#e5e7eb 75%),
  linear-gradient(-45deg,transparent 75%,#e5e7eb 75%);
  background-color:#fff;background-position:0 0,0 10px,10px -10px,-10px 0;background-size:20px 20px;box-shadow:0 18px 48px rgba(15,23,42,.14)}
.psd-canvas-shell canvas{display:block;max-width:none;background:transparent}
.psd-empty{padding:20px;color:var(--psd-muted);font-weight:700}
.file-viewer[data-viewer-theme='dark'] .psd-viewer{--psd-bg:#0d1117;--psd-surface:#161b22;--psd-border:rgba(139,148,158,.24);--psd-text:#e6edf3;--psd-muted:#8b949e}
.file-viewer[data-viewer-theme='dark'] .psd-toolbar{background:rgba(13,17,23,.92)}
.file-viewer[data-viewer-theme='dark'] .psd-sidebar,.file-viewer[data-viewer-theme='dark'] .psd-sidebar-header{background:rgba(22,27,34,.92)}
.file-viewer[data-viewer-theme='dark'] .psd-layer,.file-viewer[data-viewer-theme='dark'] .psd-actions button{background:#161b22;color:#e6edf3}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .psd-viewer{--psd-bg:#0d1117;--psd-surface:#161b22;--psd-border:rgba(139,148,158,.24);--psd-text:#e6edf3;--psd-muted:#8b949e}.file-viewer[data-viewer-theme='system'] .psd-toolbar{background:rgba(13,17,23,.92)}.file-viewer[data-viewer-theme='system'] .psd-sidebar,.file-viewer[data-viewer-theme='system'] .psd-sidebar-header{background:rgba(22,27,34,.92)}.file-viewer[data-viewer-theme='system'] .psd-layer,.file-viewer[data-viewer-theme='system'] .psd-actions button{background:#161b22;color:#e6edf3}}
@media (max-width:760px){.psd-layout{grid-template-columns:1fr}.psd-sidebar{max-height:240px;border-right:0;border-bottom:1px solid var(--psd-border)}.psd-stage{padding:14px}}
`

const createElement = <TagName extends keyof HTMLElementTagNameMap>(
  documentRef: Document,
  tagName: TagName,
  className?: string,
  text?: string
) => {
  const element = documentRef.createElement(tagName)
  if (className) {
    element.className = className
  }
  if (typeof text === 'string') {
    element.textContent = text
  }
  return element
}

const createStyle = (documentRef: Document) => {
  const style = documentRef.createElement('style')
  style.textContent = psdStyle
  return style
}

const toCanvas = (documentRef: Document, source: unknown): HTMLCanvasElement | undefined => {
  if (!source) {
    return undefined
  }
  const ownerWindow = documentRef.defaultView || (typeof window !== 'undefined' ? window : undefined)
  if (ownerWindow && source instanceof ownerWindow.HTMLCanvasElement) {
    return source
  }
  if (ownerWindow && source instanceof ownerWindow.ImageData) {
    const canvas = documentRef.createElement('canvas')
    canvas.width = source.width
    canvas.height = source.height
    canvas.getContext('2d')?.putImageData(source, 0, 0)
    return canvas
  }
  if (
    typeof source === 'object' &&
    'data' in source &&
    'width' in source &&
    'height' in source
  ) {
    const pixelData = source as { data: Uint8ClampedArray | Uint8Array; width: number; height: number }
    const canvas = documentRef.createElement('canvas')
    canvas.width = pixelData.width
    canvas.height = pixelData.height
    const clamped = new Uint8ClampedArray(pixelData.data.length)
    clamped.set(pixelData.data)
    const ImageDataConstructor = ownerWindow?.ImageData || ImageData
    canvas.getContext('2d')?.putImageData(new ImageDataConstructor(clamped, pixelData.width, pixelData.height), 0, 0)
    return canvas
  }
  return undefined
}

const flattenLayers = (
  documentRef: Document,
  layers: any[] | undefined,
  depth = 0,
  path = ''
): PsdLayerItem[] => {
  if (!Array.isArray(layers)) {
    return []
  }
  return layers.flatMap((layer, index) => {
    const name = String(layer.name || `Layer ${index + 1}`)
    const id = `${path}${index}`
    const canvas = toCanvas(documentRef, layer.canvas || layer.imageData)
    const item: PsdLayerItem = {
      id,
      name,
      depth,
      left: Number(layer.left || 0),
      top: Number(layer.top || 0),
      width: Math.max(0, Number(layer.right || 0) - Number(layer.left || 0)),
      height: Math.max(0, Number(layer.bottom || 0) - Number(layer.top || 0)),
      hidden: Boolean(layer.hidden),
      canvas
    }
    return [item, ...flattenLayers(documentRef, layer.children, depth + 1, `${id}.`)]
  })
}

const clampZoom = (value: number) => {
  return Math.min(4, Math.max(0.1, Number(value.toFixed(2))))
}

export default async function renderPsdAsset(
  buffer: ArrayBuffer,
  target: HTMLDivElement
): Promise<FileViewerRenderedInstance> {
  const documentRef = target.ownerDocument || document
  const { readPsd } = await import('ag-psd')
  const psd = readPsd(buffer, { useImageData: true })
  const compositeCanvas = toCanvas(documentRef, (psd as any).canvas || (psd as any).imageData)
  const layers = flattenLayers(documentRef, (psd as any).children)
  const drawableLayers = layers.filter(layer => layer.canvas)
  const selected = new Set(drawableLayers.filter(layer => !layer.hidden).map(layer => layer.id))
  let zoom = 1
  const zoomEmitter = createFileViewerZoomChangeEmitter()

  const root = createElement(documentRef, 'div', 'psd-viewer')
  root.dataset.viewerZoomProvider = 'psd'
  const toolbar = createElement(documentRef, 'div', 'psd-toolbar')
  const title = createElement(documentRef, 'div', 'psd-title')
  title.append(
    createElement(documentRef, 'strong', undefined, 'PSD 图层预览'),
    createElement(documentRef, 'span', undefined, `${psd.width || 0} x ${psd.height || 0} · ${layers.length} layers · ag-psd`)
  )
  const actions = createElement(documentRef, 'div', 'psd-actions')
  const zoomOut = createElement(documentRef, 'button', undefined, '-') as HTMLButtonElement
  const zoomLabel = createElement(documentRef, 'span', undefined, '100%')
  const zoomIn = createElement(documentRef, 'button', undefined, '+') as HTMLButtonElement
  const reset = createElement(documentRef, 'button', undefined, '适合') as HTMLButtonElement
  const showAll = createElement(documentRef, 'button', undefined, '全显') as HTMLButtonElement
  const hideAll = createElement(documentRef, 'button', undefined, '全隐') as HTMLButtonElement
  ;[zoomOut, zoomIn, reset, showAll, hideAll].forEach(button => {
    button.type = 'button'
  })
  actions.append(zoomOut, zoomLabel, zoomIn, reset, showAll, hideAll)
  toolbar.append(title, actions)

  const layout = createElement(documentRef, 'div', 'psd-layout')
  const sidebar = createElement(documentRef, 'aside', 'psd-sidebar')
  const sidebarHeader = createElement(documentRef, 'div', 'psd-sidebar-header')
  sidebarHeader.append(
    createElement(documentRef, 'span', undefined, '图层'),
    createElement(documentRef, 'span', undefined, `${drawableLayers.length} 可重绘`)
  )
  const list = createElement(documentRef, 'ul', 'psd-layer-list')
  sidebar.append(sidebarHeader, list)

  const stage = createElement(documentRef, 'main', 'psd-stage')
  const wrap = createElement(documentRef, 'div', 'psd-canvas-wrap')
  const shell = createElement(documentRef, 'div', 'psd-canvas-shell')
  const canvas = createElement(documentRef, 'canvas') as HTMLCanvasElement
  canvas.width = Math.max(1, Number(psd.width || compositeCanvas?.width || 1))
  canvas.height = Math.max(1, Number(psd.height || compositeCanvas?.height || 1))
  shell.appendChild(canvas)
  wrap.appendChild(shell)
  stage.appendChild(wrap)
  layout.append(sidebar, stage)
  root.append(toolbar, layout)
  target.replaceChildren(createStyle(documentRef), root)

  const redraw = () => {
    const context = canvas.getContext('2d')
    if (!context) {
      return
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    const visibleLayerCanvases = drawableLayers.filter(layer => selected.has(layer.id))
    if (!visibleLayerCanvases.length && compositeCanvas) {
      context.drawImage(compositeCanvas, 0, 0)
      return
    }
    visibleLayerCanvases.slice().reverse().forEach(layer => {
      if (layer.canvas) {
        context.drawImage(layer.canvas, layer.left, layer.top)
      }
    })
  }

  if (!layers.length) {
    list.appendChild(createElement(documentRef, 'li', 'psd-empty', '未发现可展示图层，使用合成图预览。'))
  }

  layers.forEach(layer => {
    const item = createElement(documentRef, 'li', 'psd-layer')
    item.style.paddingLeft = `${8 + layer.depth * 14}px`
    const checkbox = createElement(documentRef, 'input') as HTMLInputElement
    checkbox.type = 'checkbox'
    checkbox.disabled = !layer.canvas
    checkbox.checked = selected.has(layer.id)
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selected.add(layer.id)
      } else {
        selected.delete(layer.id)
      }
      redraw()
    })
    const copy = createElement(documentRef, 'div')
    copy.append(
      createElement(documentRef, 'strong', undefined, layer.name),
      createElement(documentRef, 'span', undefined, `${layer.left},${layer.top} · ${layer.width} x ${layer.height}${layer.hidden ? ' · hidden' : ''}`)
    )
    item.append(checkbox, copy)
    list.appendChild(item)
  })

  const getZoomState = (): FileViewerZoomState => ({
    scale: zoom,
    label: `${Math.round(zoom * 100)}%`,
    canZoomIn: zoom < 4,
    canZoomOut: zoom > 0.1,
    canReset: zoom !== 1,
    minScale: 0.1,
    maxScale: 4
  })

  const setZoom = (scale: number) => {
    zoom = clampZoom(scale)
    wrap.style.transform = `scale(${zoom})`
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`
    zoomEmitter.emit()
    return getZoomState()
  }

  zoomOut.addEventListener('click', () => setZoom(zoom - 0.1))
  zoomIn.addEventListener('click', () => setZoom(zoom + 0.1))
  reset.addEventListener('click', () => setZoom(1))
  showAll.addEventListener('click', () => {
    drawableLayers.forEach(layer => selected.add(layer.id))
    list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => {
      if (!input.disabled) input.checked = true
    })
    redraw()
  })
  hideAll.addEventListener('click', () => {
    selected.clear()
    list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => {
      if (!input.disabled) input.checked = false
    })
    redraw()
  })

  registerFileViewerZoomProvider(root, {
    zoomIn: () => setZoom(zoom + 0.1),
    zoomOut: () => setZoom(zoom - 0.1),
    resetZoom: () => setZoom(1),
    setZoom,
    getState: getZoomState,
    subscribe: zoomEmitter.subscribe
  })

  redraw()
  setZoom(1)

  return {
    $el: root,
    unmount() {
      unregisterFileViewerZoomProvider(root)
      target.replaceChildren()
    }
  }
}

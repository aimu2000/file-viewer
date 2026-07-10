import JSZip from 'jszip'

type DOMParserConstructor = new () => DOMParser

const localName = (node: Node) => {
  const name = (node as Element).localName || node.nodeName
  return name.split(':').pop() || name
}

const elementsByLocal = (node: Node | null | undefined, name: string): Element[] => {
  const result: Element[] = []
  const visit = (current: Node) => {
    childElements(current).forEach((child) => {
      if (localName(child) === name) {
        result.push(child)
      }
      visit(child)
    })
  }
  if (node) {
    visit(node)
  }
  return result
}

const childElements = (node: Node | null | undefined): Element[] => {
  return node
    ? Array.from(node.childNodes).filter((child): child is Element => child.nodeType === 1)
    : []
}

const firstChildByLocal = (node: Node | null | undefined, name: string) => {
  return childElements(node).find((child) => localName(child) === name)
}

const relationshipId = (element: Element) => {
  return (
    element.getAttribute('r:id') ||
    element.getAttributeNS(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'id'
    ) ||
    ''
  )
}

const resolvePartPath = (sourcePart: string, target: string) => {
  const sourceDirectory = sourcePart.slice(0, Math.max(0, sourcePart.lastIndexOf('/')))
  const parts = (target.startsWith('/') ? target.slice(1) : `${sourceDirectory}/${target}`).split(
    '/'
  )
  const normalized: string[] = []

  for (const part of parts) {
    if (!part || part === '.') {
      continue
    }
    if (part === '..') {
      normalized.pop()
    } else {
      normalized.push(part)
    }
  }
  return normalized.join('/')
}

const readXml = async (zip: JSZip, path: string, DOMParserCtor: DOMParserConstructor) => {
  const file = zip.file(path)
  if (!file) {
    return null
  }
  return new DOMParserCtor().parseFromString(await file.async('text'), 'application/xml')
}

const extractSeriesName = (series: Element) => {
  const tx = firstChildByLocal(series, 'tx')
  if (!tx) {
    return ''
  }

  const points = elementsByLocal(tx, 'pt')
    .map((point) => ({
      index: Number(point.getAttribute('idx')) || 0,
      value: firstChildByLocal(point, 'v')?.textContent?.trim() || ''
    }))
    .sort((left, right) => left.index - right.index)
    .map((point) => point.value)
    .filter(Boolean)
  if (points.length) {
    return points.join(' ')
  }

  const richText = elementsByLocal(tx, 't')
    .map((text) => text.textContent?.trim() || '')
    .filter(Boolean)
    .join(' ')
  if (richText) {
    return richText
  }

  return elementsByLocal(tx, 'v')[0]?.textContent?.trim() || ''
}

export const collectDocxChartSeriesNames = async (
  buffer: ArrayBuffer,
  DOMParserCtor: DOMParserConstructor
) => {
  const zip = await JSZip.loadAsync(buffer)
  const documentPart = 'word/document.xml'
  const [documentXml, relationshipsXml] = await Promise.all([
    readXml(zip, documentPart, DOMParserCtor),
    readXml(zip, 'word/_rels/document.xml.rels', DOMParserCtor)
  ])
  if (!documentXml || !relationshipsXml) {
    return []
  }

  const relationships = new Map(
    elementsByLocal(relationshipsXml.documentElement, 'Relationship').map(
      (relationship) =>
        [
          relationship.getAttribute('Id') || '',
          {
            target: relationship.getAttribute('Target') || '',
            type: relationship.getAttribute('Type') || ''
          }
        ] as const
    )
  )
  const chartParts = elementsByLocal(documentXml.documentElement, 'chart').flatMap((chart) => {
    const relationship = relationships.get(relationshipId(chart))
    if (!relationship?.target || !relationship.type.endsWith('/chart')) {
      return []
    }
    return [resolvePartPath(documentPart, relationship.target)]
  })

  return Promise.all(
    chartParts.map(async (chartPart) => {
      const chartXml = await readXml(zip, chartPart, DOMParserCtor)
      return chartXml ? elementsByLocal(chartXml.documentElement, 'ser').map(extractSeriesName) : []
    })
  )
}

export const applyDocxChartSeriesNames = async (buffer: ArrayBuffer, target: HTMLDivElement) => {
  const charts = Array.from(target.querySelectorAll<HTMLElement>('.docx-chart'))
  const hasFallbackLegend = charts.some((chart) => /Series\s+\d+/.test(chart.textContent || ''))
  if (!hasFallbackLegend) {
    return
  }

  const DOMParserCtor = target.ownerDocument.defaultView?.DOMParser || globalThis.DOMParser
  if (!DOMParserCtor) {
    return
  }

  try {
    const namesByChart = await collectDocxChartSeriesNames(buffer, DOMParserCtor)
    charts.forEach((chart, chartIndex) => {
      const names = namesByChart[chartIndex]?.filter(Boolean) || []
      if (!names.length) {
        return
      }

      chart.dataset.chartSeriesNames = JSON.stringify(names)
      const textElements = Array.from(chart.querySelectorAll<SVGTextElement>('text'))
      names.forEach((name, seriesIndex) => {
        const fallback = `Series ${seriesIndex + 1}`
        const legend = textElements.find((text) => text.textContent?.trim() === fallback)
        if (legend) {
          legend.textContent = name
        }
      })
    })
  } catch (error) {
    console.warn('[file-viewer] DOCX 图表系列名修复失败，保留基础图表结果。', error)
  }
}

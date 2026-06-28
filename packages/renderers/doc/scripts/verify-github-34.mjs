import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMsDoc, renderMsDoc } from '../dist/index.js'

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)))
const fixturePath = join(packageDir, 'test', 'fixtures', 'github-34-wps-table.doc')
const bytes = await readFile(fixturePath)
const parsed = parseMsDoc(bytes)
const tables = parsed.blocks.filter(block => block.type === 'table')

if (tables.length !== 1) {
  throw new Error(`Expected one table block for GitHub #34 fixture, found ${tables.length}`)
}

const table = tables[0]
if (table.rows.length !== 16) {
  throw new Error(`Expected 16 table rows for GitHub #34 fixture, found ${table.rows.length}`)
}

if (!table.rows.every(row => row.cells.filter(cell => !cell.hidden).length === 5)) {
  throw new Error('Expected every GitHub #34 table row to expose five visible cells')
}

const rendered = renderMsDoc(parsed)
if (!rendered.html.includes('<table') || !rendered.html.includes('测试组分A')) {
  throw new Error('Rendered GitHub #34 HTML did not include the restored table content')
}

console.log('[doc] GitHub #34 WPS table fixture parsed and rendered successfully.')

import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMsDoc, parseMsDocToHtml } from '../dist/index.js'

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)))
const fixturePath = join(packageDir, 'test', 'fixtures', 'image-embedded.doc')
const bytes = await readFile(fixturePath)
const parsed = parseMsDoc(bytes)
const images = (parsed.assets || []).filter(asset => asset.type === 'image')

if (images.length !== 2) {
  throw new Error(`Expected 2 embedded image assets for GitHub #87 fixture, found ${images.length}`)
}

const mimes = images.map(asset => asset.mime).sort()
if (mimes.join(',') !== 'image/jpeg,image/png') {
  throw new Error(`Expected PNG+JPEG OfficeArt blips, found ${mimes.join(',')}`)
}

for (const asset of images) {
  if (!asset.bytes?.length) {
    throw new Error(`Image asset ${asset.mime} has empty payload`)
  }
  if (asset.displayable === false) {
    throw new Error(`Image asset ${asset.mime} should be browser-displayable`)
  }
  if (asset.meta?.sourceKind !== 'embedded') {
    throw new Error(`Image asset ${asset.mime} should be marked as embedded OfficeArt`)
  }
  if (!/^data:image\/(?:png|jpeg);base64,/.test(asset.dataUrl || '')) {
    throw new Error(`Image asset ${asset.mime} is missing a browser-ready data URL`)
  }
}

const rendered = await parseMsDocToHtml(bytes)
const imgTags = rendered.html.match(/<img class="msdoc-image"/g) || []
if (imgTags.length !== 2) {
  throw new Error(`Expected 2 rendered <img> tags, found ${imgTags.length}`)
}
if (rendered.html.includes('image/emf') || rendered.html.includes('application/octet-stream')) {
  throw new Error('Rendered HTML still contains the pre-fix EMF/octet-stream misdetection')
}

console.log('[doc] GitHub #87 embedded OfficeArt images parsed and rendered successfully.')

// 回归覆盖 J0001-01-0003.ofd（OFD R&W 导出的图文混排版式）暴露出的一组渲染缺陷：
// 1. ImageObject 的 Boundary 被导出工具统一写成整页大小，真实位置/尺寸只能靠 CTM 还原；
// 2. PathObject/TextObject 通过 DrawParam 引用取色时，渲染器只取了 LineWidth，从没取过 FillColor/StrokeColor；
// 3. 路径精简数据里的 Q（二次贝塞尔）操作符完全没被解析，导致后续 token 错位、图形丢失；
// 4. 背景装饰路径依赖 Clips 裁剪成小范围形状，不处理会整块铺满盖住下层内容；
// 5. 渲染器按 Image/Path/Text 分类型整批绘制，丢失了原始文档里交错出现的先后关系（pfIndex 未赋值）。
// 任何一处回归都会导致这份真实客户文件重新变成"渲染完全错误"。
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { DOMParser, parseHTML } from 'linkedom'
import JsZip from 'jszip'

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)))
const fixturesDir = join(packageDir, 'test', 'fixtures')
const fixturePath = join(fixturesDir, 'render-fidelity.ofd')

// 1x1 红色像素 PNG（用于验证 ImageObject + CTM 定位，不关心具体像素内容）。
const PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

const buildFixtureOfd = async () => {
  const zip = new JsZip()
  zip.file('OFD.xml', `<?xml version="1.0" encoding="UTF-8"?>
<ofd:OFD xmlns:ofd="http://www.ofdspec.org/2016" Version="1.2" DocType="OFD">
  <ofd:DocBody>
    <ofd:DocInfo><ofd:DocID>render-fidelity-fixture</ofd:DocID></ofd:DocInfo>
    <ofd:DocRoot>Doc_0/Document.xml</ofd:DocRoot>
  </ofd:DocBody>
</ofd:OFD>`)
  zip.file('Doc_0/Document.xml', `<?xml version="1.0" encoding="UTF-8"?>
<ofd:Document xmlns:ofd="http://www.ofdspec.org/2016">
  <ofd:CommonData>
    <ofd:PageArea><ofd:PhysicalBox>0 0 100 100</ofd:PhysicalBox></ofd:PageArea>
    <ofd:DocumentRes>DocumentRes.xml</ofd:DocumentRes>
  </ofd:CommonData>
  <ofd:Pages><ofd:Page ID="1" BaseLoc="Pages/Page_0/Content.xml"/></ofd:Pages>
</ofd:Document>`)
  zip.file('Doc_0/DocumentRes.xml', `<?xml version="1.0" encoding="UTF-8"?>
<ofd:Res xmlns:ofd="http://www.ofdspec.org/2016" BaseLoc="Res">
  <ofd:DrawParams>
    <ofd:DrawParam ID="1"><ofd:FillColor Value="200 0 0"/></ofd:DrawParam>
    <ofd:DrawParam ID="2"><ofd:FillColor Value="0 100 0"/></ofd:DrawParam>
  </ofd:DrawParams>
  <ofd:MultiMedias>
    <ofd:MultiMedia ID="30" Type="Image"><ofd:MediaFile>pixel.png</ofd:MediaFile></ofd:MultiMedia>
  </ofd:MultiMedias>
</ofd:Res>`)
  zip.file('Doc_0/Res/pixel.png', Buffer.from(PIXEL_PNG_BASE64, 'base64'))
  // 文档顺序（用于验证 pfIndex 绘制顺序）：clippedRect(11) -> drawParamOnly(12) -> image(40) -> quadraticCurve(13)
  // 期望绘制顺序与文档顺序一致：quadraticCurve 的 z-index 应大于 image，image 应大于 drawParamOnly。
  zip.file('Doc_0/Pages/Page_0/Content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<ofd:Page xmlns:ofd="http://www.ofdspec.org/2016">
  <ofd:Content>
    <ofd:Layer Type="Body" ID="2">
      <ofd:PageBlock ID="3">
        <ofd:PathObject ID="11" Boundary="0 0 100 100" Fill="true" Stroke="false" DrawParam="1">
          <ofd:AbbreviatedData>M 0 0 L 100 0 L 100 100 L 0 100 C</ofd:AbbreviatedData>
          <ofd:Clips>
            <ofd:Clip>
              <ofd:Area>
                <ofd:Path Boundary="0 0 100 100">
                  <ofd:AbbreviatedData>M 10 10 L 30 10 L 30 30 L 10 30 C</ofd:AbbreviatedData>
                </ofd:Path>
              </ofd:Area>
            </ofd:Clip>
          </ofd:Clips>
        </ofd:PathObject>
        <ofd:PathObject ID="12" Boundary="40 10 30 30" Fill="true" Stroke="false" DrawParam="2">
          <ofd:AbbreviatedData>M 0 0 L 30 0 L 30 30 L 0 30 C</ofd:AbbreviatedData>
        </ofd:PathObject>
        <ofd:ImageObject ID="40" ResourceID="30" Boundary="0 0 100 100" CTM="20 0 0 15 60 60"/>
        <ofd:PathObject ID="13" Boundary="0 0 100 100" Fill="true" Stroke="false">
          <ofd:FillColor Value="0 0 200"/>
          <ofd:AbbreviatedData>M 10 50 Q 20 40 30 50 Q 40 60 50 50 C</ofd:AbbreviatedData>
        </ofd:PathObject>
      </ofd:PageBlock>
    </ofd:Layer>
  </ofd:Content>
</ofd:Page>`)
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
}

globalThis.DOMParser = DOMParser
const { document, window } = parseHTML('<!doctype html><html><body></body></html>')
globalThis.document = document
globalThis.HTMLElement = window.HTMLElement
if (typeof globalThis.btoa !== 'function') {
  globalThis.btoa = (value) => Buffer.from(value, 'binary').toString('base64')
}

const { parseOfdDocument, renderOfd, setPageScale } = await import(
  pathToFileURL(join(packageDir, 'vendor/dltech/ofd/ofd.js')).href
)

const parseOfd = (bytes) =>
  new Promise((resolve, reject) => {
    parseOfdDocument({ ofd: bytes, success: resolve, fail: reject })
  })

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`verify-render-fidelity: ${message}`)
  }
}

await mkdir(fixturesDir, { recursive: true })
const fixtureBytes = await buildFixtureOfd()
await writeFile(fixturePath, fixtureBytes)

const docs = await parseOfd(fixtureBytes.buffer.slice(fixtureBytes.byteOffset, fixtureBytes.byteOffset + fixtureBytes.byteLength))
setPageScale(1)
const page = renderOfd(400, docs[0])[0]
assert(!!page, 'expected page 0 to render')

// --- 1. ImageObject 必须按 CTM 定位/定尺寸，而不是共享的整页 Boundary ---
const img = page.querySelector('img')
assert(!!img, 'expected the image object to render an <img>')
const imgBox = img.parentElement.tagName === 'DIV' ? img.parentElement : img
const style = imgBox.getAttribute('style') || ''
const left = parseFloat(/left:\s*([\d.]+)px/.exec(style)?.[1] ?? 'NaN')
const top = parseFloat(/top:\s*([\d.]+)px/.exec(style)?.[1] ?? 'NaN')
const width = parseFloat(/width:\s*([\d.]+)px/.exec(style)?.[1] ?? 'NaN')
const height = parseFloat(/height:\s*([\d.]+)px/.exec(style)?.[1] ?? 'NaN')
// calPageBox 的缩放比例为 ((screenWidth - 10) / 页面宽度mm).toFixed(1)，即 (400-10)/100 = 3.9。
// CTM="20 0 0 15 60 60" 期望 left=60*3.9=234 top=234 width=20*3.9=78 height=15*3.9=58.5
const scale = ((400 - 10) / 100)
assert(Math.abs(left - 60 * scale) < 1, `expected image left≈${60 * scale}px from CTM, got ${left}`)
assert(Math.abs(top - 60 * scale) < 1, `expected image top≈${60 * scale}px from CTM, got ${top}`)
assert(Math.abs(width - 20 * scale) < 1, `expected image width≈${20 * scale}px from CTM (not full-page Boundary), got ${width}`)
assert(Math.abs(height - 15 * scale) < 1, `expected image height≈${15 * scale}px from CTM (not full-page Boundary), got ${height}`)

// --- 2. PathObject 引用 DrawParam 取色（没有内联 FillColor）时必须生效 ---
const paths = Array.from(page.querySelectorAll('svg path, g path'))
const drawParamOnlyPath = paths.find((p) => (p.getAttribute('style') || '').includes('rgb(0, 100, 0)'))
assert(!!drawParamOnlyPath, 'expected a path with DrawParam-resolved fill rgb(0, 100, 0), path colors via DrawParam reference are broken')

// --- 3. AbbreviatedData 里的 Q（二次贝塞尔）必须被解析成 SVG 的 Q 命令 ---
const quadraticPath = paths.find((p) => (p.getAttribute('style') || '').includes('rgb(0, 0, 200)'))
assert(!!quadraticPath, 'expected the blue quadratic-curve path to render')
const quadraticD = quadraticPath.getAttribute('d') || ''
assert(/Q/.test(quadraticD), `expected rendered path data to contain a Q command, got "${quadraticD}"`)

// --- 4. Clips 必须裁剪装饰路径，而不是让它铺满整个（伪造的）整页 Boundary ---
const clipPaths = page.querySelectorAll('clipPath')
const clippedGroups = page.querySelectorAll('g[clip-path]')
assert(clipPaths.length >= 1, 'expected a <clipPath> to be generated for PathObject Clips')
assert(clippedGroups.length >= 1, 'expected the clipped path to be wrapped in a <g clip-path=...>')

// --- 5. pfIndex 必须还原原始文档顺序：quadraticCurve(13) > image(40) > drawParamOnly(12) ---
const zIndexOf = (el) => parseFloat(/z-index:\s*(-?\d+)/.exec(el.getAttribute('style') || '')?.[1] ?? 'NaN')
const imageZ = zIndexOf(imgBox)
const drawParamOnlyZ = zIndexOf(drawParamOnlyPath.closest('svg'))
const quadraticZ = zIndexOf(quadraticPath.closest('svg'))
assert(Number.isFinite(imageZ) && Number.isFinite(drawParamOnlyZ) && Number.isFinite(quadraticZ), 'expected all objects to carry a numeric pfIndex-based z-index')
assert(drawParamOnlyZ < imageZ, `expected document order drawParamOnly(12) < image(40) in z-index, got ${drawParamOnlyZ} vs ${imageZ}`)
assert(imageZ < quadraticZ, `expected document order image(40) < quadraticCurve(13) in z-index, got ${imageZ} vs ${quadraticZ}`)

console.log('verify-render-fidelity: CTM image placement, DrawParam color, Q curves, Clips and document-order z-index all OK')

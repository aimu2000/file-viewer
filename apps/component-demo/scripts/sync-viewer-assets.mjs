import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const demoDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoDir = resolve(demoDir, '../..')
const sourceDir = resolve(repoDir, 'packages/components/web/viewer')
const targetDirs = [
  resolve(demoDir, 'public/file-viewer'),
  resolve(demoDir, 'public/vendor/file-viewer')
]
const helperSourceDir = resolve(repoDir, 'packages/components/web/dist')
const helperTargetDir = resolve(demoDir, 'public/vendor/file-viewer-web')
const helperFiles = ['flyfish-file-viewer-web.iife.js']
const exampleSourceDir = resolve(repoDir, 'apps/viewer-demo/public/example')
const exampleTargetDir = resolve(demoDir, 'public/example')

if (!existsSync(resolve(sourceDir, 'flyfish-viewer-assets.json'))) {
  throw new Error('缺少 packages/components/web/viewer/flyfish-viewer-assets.json，请先运行 pnpm build:viewer-assets')
}

const removeMacMetadata = async dir => {
  const entries = await readdir(dir, { withFileTypes: true })
  await Promise.all(entries.map(entry => {
    const path = resolve(dir, entry.name)
    if (entry.name === '.DS_Store') {
      return rm(path, { force: true })
    }
    if (entry.isDirectory()) {
      return removeMacMetadata(path)
    }
    return undefined
  }))
}

for (const targetDir of targetDirs) {
  await rm(targetDir, { force: true, recursive: true })
  await mkdir(targetDir, { recursive: true })
  await cp(sourceDir, targetDir, { recursive: true })
  await removeMacMetadata(targetDir)
  console.log(`[file-viewer-demo] viewer assets copied to ${targetDir}`)
}

for (const assetRoot of ['vendor', 'wasm']) {
  const sourceAssetRoot = resolve(sourceDir, assetRoot)
  if (!existsSync(sourceAssetRoot)) {
    continue
  }

  const targetAssetRoot = resolve(demoDir, 'public', assetRoot)
  await mkdir(targetAssetRoot, { recursive: true })

  const entries = await readdir(sourceAssetRoot, { withFileTypes: true })
  await Promise.all(entries.map(entry => rm(resolve(targetAssetRoot, entry.name), { force: true, recursive: true })))
  await cp(sourceAssetRoot, targetAssetRoot, { recursive: true })
  await removeMacMetadata(targetAssetRoot)
  console.log(`[file-viewer-demo] viewer root ${assetRoot} assets copied to ${targetAssetRoot}`)
}

await rm(helperTargetDir, { force: true, recursive: true })
await mkdir(helperTargetDir, { recursive: true })
for (const helperFile of helperFiles) {
  const sourceFile = resolve(helperSourceDir, helperFile)
  if (!existsSync(sourceFile)) {
    throw new Error(`缺少 ${sourceFile}，请先运行 pnpm --filter @file-viewer/web build`)
  }
  await cp(sourceFile, resolve(helperTargetDir, helperFile))
}
console.log(`[file-viewer-demo] web helper assets copied to ${helperTargetDir}`)

await mkdir(exampleTargetDir, { recursive: true })
await cp(resolve(exampleSourceDir, 'word.docx'), resolve(exampleTargetDir, 'word.docx'))
console.log(`[file-viewer-demo] docx example copied to ${exampleTargetDir}`)

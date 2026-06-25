import { existsSync } from 'node:fs'
import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = join(packageDir, 'src', 'global.ts')
const excalidrawStub = resolve(packageDir, '..', 'web', 'scripts', 'excalidraw-iife-stub.ts')
const outDir = join(packageDir, 'dist')
const fileName = 'flyfish-file-viewer-web-full.iife.js'

if (!existsSync(entry)) {
  throw new Error(`Missing web full global entry: ${entry}`)
}

await mkdir(outDir, { recursive: true })

await build({
  configFile: false,
  publicDir: false,
  logLevel: 'warn',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': JSON.stringify({ NODE_ENV: 'production' }),
    'import.meta.url': 'document.currentScript?.src || location.href'
  },
  resolve: {
    alias: {
      // Keep the CDN full bundle usable without React peer dependencies.
      '@excalidraw/excalidraw': excalidrawStub
    },
    dedupe: ['@file-viewer/core']
  },
  build: {
    emptyOutDir: false,
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2020',
    lib: {
      entry,
      name: 'FlyfishFileViewerWebFull',
      formats: ['iife'],
      fileName: () => fileName
    },
    rollupOptions: {
      output: {
        exports: 'named',
        extend: true
      }
    }
  }
})

const assetSourceCandidates = [
  resolve(packageDir, '..', 'web', 'viewer'),
  resolve(packageDir, '..', '..', 'compat', 'web', 'viewer'),
  resolve(packageDir, '..', '..', '..', 'apps', 'viewer-demo', 'dist')
]
const assetSource = assetSourceCandidates.find(candidate =>
  existsSync(resolve(candidate, 'flyfish-viewer-assets.json')) ||
  existsSync(resolve(candidate, 'vendor')) ||
  existsSync(resolve(candidate, 'wasm'))
)

if (assetSource) {
  for (const entry of [
    'vendor',
    'wasm',
    'flyfish-viewer-assets.json',
    'flyfish-viewer-manifest.json'
  ]) {
    const sourcePath = resolve(assetSource, entry)
    if (!existsSync(sourcePath)) {
      continue
    }
    const targetPath = resolve(outDir, entry)
    await rm(targetPath, { recursive: true, force: true })
    await cp(sourcePath, targetPath, { recursive: true })
  }
  console.log(`[web-full-iife] Copied viewer assets from ${assetSource}`)
} else {
  console.warn('[web-full-iife] Viewer assets were not copied. Run pnpm build:viewer-assets before publishing the full CDN package.')
}

console.log(`[web-full-iife] Built ${join(outDir, fileName)}`)

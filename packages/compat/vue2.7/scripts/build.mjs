import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(packageDir, 'dist')

await mkdir(distDir, { recursive: true })

await Promise.all([
  writeFile(resolve(distDir, 'index.js'), [
    "export { default } from '@file-viewer/vue2.7';",
    "export * from '@file-viewer/vue2.7';",
    ''
  ].join('\n')),
  writeFile(resolve(distDir, 'index.d.ts'), [
    "export { default } from '@file-viewer/vue2.7';",
    "export * from '@file-viewer/vue2.7';",
    ''
  ].join('\n'))
])

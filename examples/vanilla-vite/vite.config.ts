import { fileViewerRenderers } from '@file-viewer/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    fileViewerRenderers({
      preset: 'lite',
      copyAssets: true
    })
  ]
})

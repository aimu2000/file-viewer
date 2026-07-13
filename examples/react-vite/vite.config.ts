import { fileViewerRenderers } from '@file-viewer/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    fileViewerRenderers({
      preset: 'office',
      copyAssets: true
    })
  ]
})

import { fileViewerRenderers } from '@file-viewer/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    fileViewerRenderers({
      preset: 'all',
      copyAssets: true
    })
  ]
})

import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const demoRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  server: {
    host: '127.0.0.1'
  },
  preview: {
    host: '127.0.0.1'
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(demoRoot, 'index.html'),
        jquery: resolve(demoRoot, 'jquery.html'),
        'manual-js': resolve(demoRoot, 'manual-js.html'),
        'manual-iife': resolve(demoRoot, 'manual-iife.html'),
        'svelte-action': resolve(demoRoot, 'svelte-action.html'),
        vue3: resolve(demoRoot, 'vue3.html')
      }
    }
  }
})

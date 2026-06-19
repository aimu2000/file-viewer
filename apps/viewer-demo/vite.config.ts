import { createRequire } from 'node:module'
import { fileURLToPath, URL } from 'node:url'

import type { Plugin, UserConfigExport } from 'vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const require = createRequire(import.meta.url)

const viewerQueryFallbackPlugin = (): Plugin => ({
  name: 'viewer-query-fallback',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      // Vite 会把根路径 `?url=` 当成资源查询；Demo 需要保留直接预览参数入口。
      if (req.url?.startsWith('/?url=')) {
        req.url = `/index.html${req.url.slice(1)}`
      }
      next()
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig(ctx => {
  const alias: Record<string, string> = {
    '@/package': fileURLToPath(new URL('../../packages/components/vue3/src/package', import.meta.url)),
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@file-viewer/vue3': fileURLToPath(new URL('../../packages/components/vue3/src/package/index.ts', import.meta.url)),
    '@file-viewer/web': fileURLToPath(new URL('../../packages/components/web/src/index.ts', import.meta.url)),
    '@flyfish-group/file-viewer3': fileURLToPath(new URL('../../packages/components/vue3/src/package/index.ts', import.meta.url)),
    buffer: require.resolve('buffer/'),
    events: require.resolve('events/'),
    path: require.resolve('path-browserify'),
    'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    react: require.resolve('react'),
    'react-dom': require.resolve('react-dom'),
    stream: require.resolve('stream-browserify'),
    zlib: require.resolve('browserify-zlib')
  }

  if (ctx.mode !== 'lib') {
    alias['@file-viewer/core'] = fileURLToPath(new URL('../../packages/core/src/index.ts', import.meta.url))
  }

  const config: UserConfigExport = {
    plugins: [viewerQueryFallbackPlugin(), vue(), vueJsx()],
    base: './',
    define: {
      global: 'globalThis'
    },
    resolve: {
      alias
    }
  }
  config.build = {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        compare: fileURLToPath(new URL('compare.html', import.meta.url))
      }
    },
    outDir: 'dist'
  }

  return config
})

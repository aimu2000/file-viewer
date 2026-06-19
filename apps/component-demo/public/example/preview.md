# Flyfish Viewer 私有化预览

这是一份随演示应用一起发布的本地 Markdown 文件。

- React 组件通过标准包 `@file-viewer/react` 加载。
- 纯 Web 入口通过标准包 `@file-viewer/web` 挂载。
- 如需私有化 Worker/WASM 资源，可通过 `file-viewer-copy-assets` 复制 viewer assets。

构建后只要把 `dist` 目录部署到静态站点根路径，就能直接访问这份预览。

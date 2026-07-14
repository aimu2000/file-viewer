# file-viewer-copy-assets

Flyfish File Viewer 官方静态资源复制 CLI。它让下面这条命令成为可直接从 npm Registry 解析、安装和执行的标准 `npx` 入口：

```bash
npx --yes file-viewer-copy-assets@2.1.28 ./public/file-viewer
```

CLI 自带与当前版本严格匹配的资源载荷，会将 Worker、WASM、字体、PDF、CAD、Typst、Archive、Draw.io 和 Office vendor 资源复制到目标目录，并生成 `flyfish-viewer-assets.json` 完整性清单。安装或执行 `--version` 不会修改项目目录；只有执行复制命令时才会写入指定目标。运行时资源全部自托管，不依赖公共 CDN。

## 用法

```bash
# 默认输出到 ./public/file-viewer
npx --yes file-viewer-copy-assets@2.1.28

# 保留目标目录中已有的其他文件
npx --yes file-viewer-copy-assets@2.1.28 ./public/file-viewer --no-clean

# pnpm 等价命令
pnpm dlx file-viewer-copy-assets@2.1.28 ./public/file-viewer
```

可使用 `FILE_VIEWER_PUBLIC_DIR` 设置默认输出目录，或将 `FILE_VIEWER_SKIP_ASSET_COPY=1` 用于需要跳过复制步骤的 CI 场景。完整部署说明见 [File Viewer 文档](https://doc.file-viewer.app/guide/distribution)。

English: [README.en.md](./README.en.md)

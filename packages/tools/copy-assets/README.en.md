# file-viewer-copy-assets

The official Flyfish File Viewer asset-copy CLI. It makes this command a real npm Registry package that `npx` can resolve, install, and execute directly:

```bash
npx --yes file-viewer-copy-assets@2.1.28 ./public/file-viewer
```

The CLI carries a version-matched asset payload, copies Worker, WASM, font, PDF, CAD, Typst, Archive, Draw.io, and Office vendor assets, and writes a `flyfish-viewer-assets.json` integrity manifest. Installing it or running `--version` does not modify the project; only the copy command writes to the selected target. Runtime assets remain self-hosted with no public CDN dependency.

## Usage

```bash
# Defaults to ./public/file-viewer
npx --yes file-viewer-copy-assets@2.1.28

# Keep unrelated existing files in the target directory
npx --yes file-viewer-copy-assets@2.1.28 ./public/file-viewer --no-clean

# pnpm equivalent
pnpm dlx file-viewer-copy-assets@2.1.28 ./public/file-viewer
```

Set `FILE_VIEWER_PUBLIC_DIR` to override the default output or `FILE_VIEWER_SKIP_ASSET_COPY=1` when a CI step should skip copying. See the [File Viewer deployment guide](https://doc.file-viewer.app/guide/distribution) for full details.

简体中文：[README.md](./README.md)

# @file-viewer/geometry-engine

Flyfish File Viewer 的独立几何内核边界包。它不包含 UI，也不默认打包 OpenCascade、web-ifc 或 rhino3dm 这类重型 WASM 运行时；当前负责 STEP、IGES、IFC、3DM 和 BREP 的格式识别、文件头检查、推荐内核路线和对外提示文本。

```ts
import {
  inspectGeometryKernelFile,
  formatGeometryKernelNotice,
} from '@file-viewer/geometry-engine'

const inspection = inspectGeometryKernelFile(new Uint8Array(buffer), 'step')
const notice = formatGeometryKernelNotice(inspection.format)
```

## 定位

- `inspectGeometryKernelFile()` 读取文件前缀，识别 STEP / IGES / IFC / 3DM / BREP 的常见签名。
- `geometryKernelRoutes` 明确每个格式的推荐 WASM 路线：STEP / IGES / BREP 走 OpenCascade / OCCT，IFC 走 `web-ifc` / That Open，3DM 走 McNeel `rhino3dm`。
- `@file-viewer/renderer-3d` 使用本包展示专业、准确的转换说明；core 和普通 3D 预览不会因此安装 CAD/BIM 几何内核。
- 后续完整可视渲染可以继续在这个包中分层演进，或拆出更细的 `@file-viewer/geometry-occt`、`@file-viewer/geometry-ifc`、`@file-viewer/geometry-3dm`。

## 为什么单独拆包

STEP、IGES、IFC 和 3DM 都不是普通 Three.js loader 可以完整还原的轻量格式。它们需要 CAD/BIM 专业内核、Worker 隔离、WASM 资产托管、许可证边界和真实样本长期回归。把这条路线单独固定下来，可以让 `@file-viewer/core` 保持快速安装，让工程格式能力像 PPTX 一样独立维护、独立发布。

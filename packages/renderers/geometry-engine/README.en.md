# @file-viewer/geometry-engine

Framework-neutral geometry-kernel boundary package for Flyfish File Viewer. It does not bundle heavy OpenCascade, web-ifc, or rhino3dm WASM runtimes by default. It currently provides STEP, IGES, IFC, 3DM, and BREP detection, signature inspection, recommended engine routes, and user-facing notices.

```ts
import {
  inspectGeometryKernelFile,
  formatGeometryKernelNotice,
} from '@file-viewer/geometry-engine'

const inspection = inspectGeometryKernelFile(new Uint8Array(buffer), 'step')
const notice = formatGeometryKernelNotice(inspection.format, 'en-US')
```

## Scope

- `inspectGeometryKernelFile()` reads a small file prefix and detects common STEP / IGES / IFC / 3DM / BREP signatures.
- `geometryKernelRoutes` documents the recommended WASM path: OpenCascade / OCCT for STEP, IGES, and BREP; `web-ifc` / That Open for IFC; McNeel `rhino3dm` for Rhino 3DM.
- `@file-viewer/renderer-3d` consumes this package for accurate conversion guidance without pulling CAD/BIM kernels into core or the default 3D install path.
- Full visual rendering can evolve here later, or split into focused packages such as `@file-viewer/geometry-occt`, `@file-viewer/geometry-ifc`, and `@file-viewer/geometry-3dm`.

## Why This Package Exists

STEP, IGES, IFC, and 3DM are not lightweight formats that ordinary Three.js loaders can faithfully decode. They need CAD/BIM kernels, worker isolation, WASM asset hosting, license review, and real-world sample regression. Keeping the boundary in a separate package lets `@file-viewer/core` stay fast to install while engineering-format fidelity can evolve independently, the same way the native PPTX engine does.

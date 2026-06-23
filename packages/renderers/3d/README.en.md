# @file-viewer/renderer-3d

Standalone 3D model renderer package for Flyfish File Viewer. It uses Three.js, OrbitControls, and format-specific Three.js loaders to preview GLB/GLTF, OBJ, STL, PLY, FBX, DAE, 3DS, 3MF, AMF, USD, KMZ, PCD, VRML, XYZ, VTK, and related model files directly in the browser.

## Usage

```ts
import FileViewer from '@file-viewer/vue3'
import { modelRenderer } from '@file-viewer/renderer-3d'

const options = {
  rendererMode: 'replace',
  renderers: modelRenderer,
}
```

You can combine it with other renderer packages:

```ts
import { modelRenderer } from '@file-viewer/renderer-3d'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: [modelRenderer, cadRenderer],
}
```

## Capabilities

- Supports WebGL preview, orbit controls, fit-to-view, grid, axes, wireframe, and auto-rotate.
- For `gltf`, `dae`, and `fbx` files with external textures or binary resources, the original URL directory is used as the resource base.
- STEP, IGES, IFC, 3DM, and BREP entries use `@file-viewer/geometry-engine` for lightweight signature detection and accurate conversion guidance; full decoding should keep evolving through dedicated OpenCascade / web-ifc / rhino3dm WASM renderer paths.
- `@file-viewer/core` no longer bundles the 3D renderer and no longer depends directly on `three`. Install this package explicitly for 3D model preview, or use `@file-viewer/preset-all`, which aggregates this renderer automatically.

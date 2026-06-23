# @file-viewer/renderer-3d

Flyfish File Viewer 的独立 3D 模型 renderer 包。它使用 Three.js、OrbitControls 和按格式异步加载的 Three.js loaders，为 GLB/GLTF、OBJ、STL、PLY、FBX、DAE、3DS、3MF、AMF、USD、KMZ、PCD、VRML、XYZ、VTK 等模型提供浏览器端只读预览。

## 用法

```ts
import FileViewer from '@file-viewer/vue3'
import { modelRenderer } from '@file-viewer/renderer-3d'

const options = {
  rendererMode: 'replace',
  renderers: modelRenderer,
}
```

也可以和其他 renderer 一起组合：

```ts
import { modelRenderer } from '@file-viewer/renderer-3d'
import { cadRenderer } from '@file-viewer/renderer-cad'

const options = {
  rendererMode: 'replace',
  renderers: [modelRenderer, cadRenderer],
}
```

## 能力边界

- 支持 WebGL 交互预览、轨道控制、适配视图、网格、坐标轴、线框和自动旋转。
- `gltf` / `dae` / `fbx` 等带外部贴图或二进制资源的格式，会以原始 `url` 的目录作为资源基准继续加载。
- STEP、IGES、IFC、3DM、BREP 等工程 B-Rep / BIM 格式入口会通过 `@file-viewer/geometry-engine` 做轻量签名识别和明确转换说明；完整解析应继续沿 OpenCascade / web-ifc / rhino3dm 独立 WASM renderer 路线演进。
- `@file-viewer/core` 已不再内置 3D renderer，也不再直接依赖 `three`。需要 3D 模型预览时，请显式安装本包，或使用会自动聚合本包的 `@file-viewer/preset-all`。

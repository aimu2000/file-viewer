# @file-viewer/renderer-geo

Flyfish File Viewer 的独立地理数据 renderer 包。它负责 GeoJSON、KML、GPX 和 Shapefile 的浏览器端预览，并让 `@tmcw/togeojson`、`shpjs` 只在命中地理数据格式时加载。

## 使用

```ts
import { geoRenderer } from '@file-viewer/renderer-geo'

const options = {
  builtinRenderers: 'none',
  renderers: [geoRenderer],
}
```

也可以通过全量 preset 自动装配：

```ts
import { allRenderers } from '@file-viewer/preset-all'

const options = {
  builtinRenderers: 'none',
  renderers: allRenderers,
}
```

## 能力

- GeoJSON 直接读取 `FeatureCollection`、`Feature` 或单个 geometry。
- KML / GPX 只在命中格式时按需加载 `@tmcw/togeojson`，转换为统一 GeoJSON 管线。
- SHP / Shapefile 只在命中格式时按需加载 `shpjs`，支持常见 ZIP 或二进制 Shapefile 数据转 GeoJSON。
- 渲染层不依赖在线地图瓦片，默认输出离线 SVG 矢量预览，适合内网部署和附件快速审阅。
- 卸载时清理 DOM 资源，和 core 的生命周期、导出 HTML、缩放能力保持一致。

## 迁移说明

`@file-viewer/core` 已不再内置 geo renderer，也不会默认安装 `@tmcw/togeojson` 和 `shpjs`。需要 GeoJSON / KML / GPX / SHP 预览时，请显式安装本包，或直接使用 `@file-viewer/preset-all` 聚合能力。

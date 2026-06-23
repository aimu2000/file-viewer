# @file-viewer/renderer-media

Flyfish File Viewer 的独立音视频 renderer 包。它负责音频、视频、HLS 清单和 MIDI 文件的浏览器端预览，并让 `hls.js`、`@tonejs/midi` 只在命中对应格式时加载。

## 使用

```ts
import { mediaRenderer } from '@file-viewer/renderer-media'

const options = {
  builtinRenderers: 'none',
  renderers: [mediaRenderer],
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

- MP4、WebM 和常见音频格式优先使用浏览器原生 `<video>` / `<audio>` 控件。
- HLS `.m3u8` 优先使用浏览器原生能力，不支持时才按需加载 `hls.js`。
- MIDI / MID 只在命中格式时按需加载 `@tonejs/midi`，展示曲名、时长、PPQ、轨道和音符摘要。
- 所有资源在卸载时清理对象 URL、播放器状态和 HLS 实例，适合长时间运行的后台系统。

## 迁移说明

`@file-viewer/core` 已不再内置 media renderer，也不再直接依赖 `hls.js` 和 `@tonejs/midi`。需要音频、视频、HLS 或 MIDI 预览时，请显式安装本包，或使用会自动聚合本包的 `@file-viewer/preset-all`。

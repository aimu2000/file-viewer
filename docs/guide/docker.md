# Docker 部署

<div class="doc-kicker">Run Anywhere</div>

<p class="doc-lead">
  Flyfish Viewer 可以作为纯静态预览站点打进 Docker 镜像，通过 nginx 托管构建后的 Demo。
  镜像内同时包含主预览入口 <code>/</code> 和文档比对入口 <code>/compare.html</code>，适合内网、私有云和客户现场一键部署。
</p>

## Docker Hub 一键运行

镜像发布后使用多架构 manifest，覆盖 `linux/amd64` 和 `linux/arm64`:

```bash
docker run -d \
  --name flyfish-viewer \
  --restart unless-stopped \
  -p 8080:80 \
  flyfishdev/file-viewer:2.0.0
```

打开:

- 主预览: `http://localhost:8080/`
- 文档比对: `http://localhost:8080/compare.html`
- 健康检查: `http://localhost:8080/healthz`

如果你希望始终使用最新稳定版本:

```bash
docker run -d \
  --name flyfish-viewer \
  --restart unless-stopped \
  -p 8080:80 \
  flyfishdev/file-viewer:latest
```

## Docker Compose

```yaml
services:
  flyfish-viewer:
    image: flyfishdev/file-viewer:2.0.0
    container_name: flyfish-viewer
    restart: unless-stopped
    ports:
      - "8080:80"
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/healthz"]
      interval: 30s
      timeout: 3s
      retries: 3
```

启动:

```bash
docker compose up -d
```

## 本地构建镜像

源码仓库内提供标准 `Dockerfile`。本地只构建当前 CPU 架构并加载到 Docker:

```bash
pnpm docker:build
```

默认镜像名是 `flyfishdev/file-viewer`，标签为当前 `package.json` 版本和 `latest`。如需改成自己的命名空间:

```bash
DOCKER_IMAGE=your-org/file-viewer pnpm docker:build
```

本地运行:

```bash
docker run --rm -p 8080:80 flyfishdev/file-viewer:2.0.0
```

## 通过 Docker Hub API 创建仓库

发布前先准备 Docker Hub Personal Access Token。仓库创建使用 Docker Hub API，镜像上传使用 Docker Registry 推送链路:

```bash
DOCKER_IMAGE=flyfishdev/file-viewer \
DOCKERHUB_USERNAME=your-dockerhub-user \
DOCKERHUB_TOKEN=dckr_pat_xxx \
pnpm docker:repo:create
```

脚本会先检查目标仓库是否存在；如果不存在，会调用 Docker Hub API 创建公开仓库。

## 多架构推送到 Docker Hub

仓库创建完成后登录 Docker Hub，并确认当前账号对目标 namespace 有推送权限。如果使用自己的命名空间，请把 `DOCKER_IMAGE` 改成对应仓库名:

```bash
docker login
```

推送 `linux/amd64` 和 `linux/arm64`:

```bash
DOCKER_IMAGE=flyfishdev/file-viewer pnpm docker:publish
```

脚本默认推送两个标签:

- `flyfishdev/file-viewer:2.0.0`
- `flyfishdev/file-viewer:latest`

如需覆盖平台或标签:

```bash
DOCKER_IMAGE=flyfishdev/file-viewer \
DOCKER_PLATFORMS=linux/amd64,linux/arm64 \
DOCKER_TAGS=2.0.0,latest \
pnpm docker:publish
```

## 镜像内容

Docker 镜像只包含构建后的静态产物，不携带源码工作区:

- `/usr/share/nginx/html/index.html`: 主预览入口
- `/usr/share/nginx/html/compare.html`: 文档比对入口
- `/usr/share/nginx/html/assets/*`: Vite hash 资源
- `/usr/share/nginx/html/example/*`: 示例文件
- `/usr/share/nginx/html/vendor/*`: Worker / WASM 等静态资源

nginx 配置会对 HTML 使用 `max-age=0, must-revalidate`，对 hash 资源和 vendor 资源使用长缓存，避免旧入口页引用已经不存在的异步 chunk。

## 反向代理建议

如果容器前面还有网关或统一域名，建议保持以下路径不被重写:

- `/`
- `/compare.html`
- `/assets/*`
- `/vendor/*`
- `/example/*`

示例文件、WASM 和 Worker 都是静态资源；如果网关把缺失的 `.js` 或 `.wasm` 回退成 HTML，浏览器会触发 MIME 错误。生产环境请让这些资源缺失时返回真实 `404`。

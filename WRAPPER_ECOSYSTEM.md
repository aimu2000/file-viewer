# File Viewer Component Ecosystem

This document records the public component repository plan. `@file-viewer/core` is the framework-neutral TypeScript foundation; every framework package builds its own native component experience on top of the same core contracts. Component packages must not depend on another framework implementation, and all shared low-level rendering contracts stay under the single core package.

## Public Component Packages

| Framework | npm package | GitHub | Gitee | Source directory |
| --- | --- | --- | --- | --- |
| Vue 3 | `@file-viewer/vue3` | `flyfish-dev/file-viewer-vue3` | `flyfish-dev/file-viewer-vue3` | `packages/components/vue3` |
| Vue 2.7 | `@file-viewer/vue2.7` | `flyfish-dev/file-viewer-vue2.7` | `flyfish-dev/file-viewer-vue2.7` | `packages/components/vue2.7` |
| Vue 2.6 | `@file-viewer/vue2.6` | `flyfish-dev/file-viewer-vue2.6` | `flyfish-dev/file-viewer-vue2.6` | `packages/components/vue2.6` |
| React 18/19 | `@file-viewer/react` | `flyfish-dev/file-viewer-react` | `flyfish-dev/file-viewer-react` | `packages/components/react` |
| React 16.8/17 | `@file-viewer/react-legacy` | `flyfish-dev/file-viewer-react-legacy` | `flyfish-dev/file-viewer-react-legacy` | `packages/components/react-legacy` |
| Pure Web | `@file-viewer/web` | `flyfish-dev/file-viewer-web` | `flyfish-dev/file-viewer-web` | `packages/components/web` |
| jQuery | `@file-viewer/jquery` | `flyfish-dev/file-viewer-jquery` | `flyfish-dev/file-viewer-jquery` | `packages/components/jquery` |
| Svelte | `@file-viewer/svelte` | `flyfish-dev/file-viewer-svelte` | `flyfish-dev/file-viewer-svelte` | `packages/components/svelte` |

The canonical machine-readable matrix is [`ecosystem/wrappers.json`](./ecosystem/wrappers.json).

## Standalone Repo Export

Generate local standalone repository folders for review or push:

```bash
pnpm components:export
```

The export command first refreshes all component README files from `ecosystem/wrappers.json` and the core format definitions, then writes to `.release/wrapper-repos/<repository>`. Each folder contains:

- package source and package metadata
- Chinese and English README
- root `LICENSE`
- a standalone `.gitignore`
- `wrapper-repo-manifest.json` with source commit and repository metadata

Workspace dependency specifiers such as `workspace:^2.0.0` are rewritten to normal npm ranges before export, so the folders are ready to initialize as standalone public repositories.

Refresh README files without exporting standalone repositories:

```bash
pnpm components:readme
```

The same command also refreshes the generated public ecosystem block in the root `README.md` and `README.en.md`. Because the open-source main repository copies those files, the repository homepage keeps the standard npm packages, GitHub component repositories, Gitee mirrors, core source visibility note and current format-count summary in sync with `ecosystem/wrappers.json`.

Verify source component packages and exported standalone repositories:

```bash
pnpm components:verify
```

The verifier checks package names, npm entry metadata (`main`, `module`, `types`, `exports`), README language pairs, generated ecosystem/format blocks, official documentation and demo links, Apache-2.0 attribution guidance, standalone manifests, GitHub/Gitee metadata, and the absence of build output, workspace dependencies or private workspace folders in exported repositories.

Prepare the exported folders as standalone Git repositories without pushing:

```bash
pnpm components:publish:dry-run
```

Push every exported component repository to its GitHub `origin` and Gitee `gitee` remotes:

```bash
pnpm components:publish
```

`components:publish` runs the export and verification pipeline first, then initializes or updates each folder in `.release/wrapper-repos`, configures remotes from `ecosystem/wrappers.json`, commits the current export with `chore: sync wrapper release`, and pushes the selected branch. Use `node scripts/publish-wrapper-repos.mjs --id=react --push` or `--package=@file-viewer/react --push` when only one component package needs to be refreshed.

## npm Ecosystem Release

Use the ecosystem release helper to keep core, standard wrappers and compatibility packages on the same version:

```bash
pnpm release:ecosystem:list
pnpm release:ecosystem:pack
pnpm release:ecosystem:publish:dry-run
pnpm release:ecosystem:publish
```

The helper currently covers 14 public npm targets:

- `@file-viewer/core`
- `@file-viewer/vue3`, `@file-viewer/vue2.7`, `@file-viewer/vue2.6`
- `@file-viewer/react`, `@file-viewer/react-legacy`
- `@file-viewer/web`, `@file-viewer/jquery`, `@file-viewer/svelte`
- `@flyfish-group/file-viewer3`, `file-viewer3`, `@flyfish-group/file-viewer`
- `@flyfish-group/file-viewer-web`, `@flyfish-group/file-viewer-react`

It verifies public publish settings, type declarations, package entry files, README language pairs and version alignment before packing or publishing. The compatibility packages remain synchronized for existing customers; new integrations should prefer the standard `@file-viewer/*` names.

## Open-Source Main Sync

`scripts/sync-public-main.mjs` delegates npm tarball creation to the same ecosystem release helper, then reads the generated `npm-release-manifest.json`. During a full open-source main release it packs:

- the compiled core foundation tarball `@file-viewer/core`
- historical compatibility packages such as `@flyfish-group/file-viewer3`, `@flyfish-group/file-viewer`, `@flyfish-group/file-viewer-web`, and `@flyfish-group/file-viewer-react`
- every standard component package listed in the manifest

The unscoped `file-viewer3` compatibility package remains part of the npm release flow, but the open-source main repository omits its duplicate tarball and records that policy in `artifacts/release-manifest.json`. The generated manifest records each package, whether its tarball is included, the GitHub repository, and the Gitee mirror for every public integration.

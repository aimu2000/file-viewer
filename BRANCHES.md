# Branch And Source Boundaries

Flyfish Viewer uses one private aggregate workspace and several public open-source repositories. Keep these roles stable when releasing or synchronizing code.

| Branch | Role | Package responsibility | Source boundary |
| --- | --- | --- | --- |
| `main` | Core foundation | `@file-viewer/core` | Private Gitea aggregate main line. Maintains framework-neutral TypeScript protocols, renderer registry, shared options, capabilities, lifecycle, operations, worker and asset contracts. The public core source is exported to `flyfish-dev/file-viewer-core`. |
| `v2` | Vue 2.7 component line | `@file-viewer/vue2.7`, `@flyfish-group/file-viewer` | Shares `@file-viewer/core`; exported component source is synchronized to the public `flyfish-dev/file-viewer-vue2.7` repositories. |
| `v3` | Vue 3 component line | `@file-viewer/vue3`, `@flyfish-group/file-viewer3`, `file-viewer3` | Shares `@file-viewer/core`; exported component source is synchronized to the public `flyfish-dev/file-viewer-vue3` repositories. |

All other ecosystem packages (`@file-viewer/react`, `@file-viewer/react-legacy`, `@file-viewer/web`, `@file-viewer/jquery`, and `@file-viewer/svelte`) are maintained as standard component packages and exported to public GitHub/Gitee repositories under `flyfish-dev`.

The public `flyfish-dev/file-viewer` repository is the open-source main repository and one-stop distribution entry. It contains runnable main demo source, component demo source, `@file-viewer/core`, standard component packages, compatibility aliases, documentation source, built/minified output, demo/docs output, samples, release tarballs, release manifests, and bilingual README files.

The private Gitea repository remains the complete aggregate workspace with branch cutover history, release automation, internal integration scripts, and priority support context. Sponsorship through the shop is for maintainer support and priority help while the public repositories remain open source.

Before replacing remote branch roles, maintainers should prepare and inspect dry-run snapshots from the private aggregate workspace:

```bash
pnpm branch:cutover:prepare
pnpm branch:cutover:verify
```

The snapshots are written to `.release/branch-cutover/main-core`, `.release/branch-cutover/v2-vue2.7-component`, and `.release/branch-cutover/v3-vue3-component` inside that private workspace. They contain standalone package trees plus `BRANCH_ROLE.md` and `branch-cutover-manifest.json`, so maintainers can verify the exact future `main`, `v2`, and `v3` contents before pushing any branch rewrite.

Run the source-boundary gate before release work:

```bash
pnpm verify:branch-roles
```

This command checks `ecosystem/branch-roles.json`, `ecosystem/wrappers.json`, the configured `origin` remote, component repository ownership, core visibility, and the open-source main repository policy.

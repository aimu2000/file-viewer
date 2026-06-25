import { defineConfig } from 'vitepress'

const githubSocialLink = {
  icon: {
    svg: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>'
  },
  link: 'https://github.com/flyfish-dev/file-viewer'
}

const enNav = [
  { text: 'Docs', link: '/en/guide/' },
  { text: 'Quickstart', link: '/en/guide/quickstart' },
  { text: 'Ecosystem', link: '/en/guide/ecosystem' },
  { text: 'Formats', link: '/en/guide/formats' },
  {
    text: 'Resources',
    items: [
      { text: 'Live Demo', link: 'https://demo.file-viewer.app' },
      { text: 'Compare Demo', link: 'https://demo.file-viewer.app/compare.html' },
      { text: 'npm Core', link: 'https://www.npmjs.com/package/@file-viewer/core' },
      { text: 'npm Web Component', link: 'https://www.npmjs.com/package/@file-viewer/web' },
      { text: 'npm Vue 3', link: 'https://www.npmjs.com/package/@file-viewer/vue3' },
      { text: 'npm React', link: 'https://www.npmjs.com/package/@file-viewer/react' },
      { text: 'npm Svelte', link: 'https://www.npmjs.com/package/@file-viewer/svelte' },
      { text: 'GitHub Repository', link: 'https://github.com/flyfish-dev/file-viewer' },
      { text: 'GitHub Wiki', link: 'https://github.com/flyfish-dev/file-viewer/wiki' },
      { text: 'Sponsor / Priority Support', link: 'https://dev.flyfish.group/shop' }
    ]
  }
]

const enSidebar = {
  '/en/guide/': [
    {
      text: 'Start Here',
      items: [
        { text: 'Docs Home', link: '/en/guide/' },
        { text: 'Overview', link: '/en/guide/overview' },
        { text: 'Demo Guide', link: '/en/guide/demo' },
        { text: 'Quickstart', link: '/en/guide/quickstart' },
      ]
    },
    {
      text: 'Integration',
      items: [
        { text: 'Ecosystem Packages', link: '/en/guide/ecosystem' },
        { text: 'Modular Assembly', link: '/en/guide/on-demand-renderers' },
        { text: 'Vanilla JS / Script Tag', link: '/en/guide/quickstart-web' },
        { text: 'Vue 3', link: '/en/guide/quickstart-vue3' },
        { text: 'Vue 2.7 / 2.6', link: '/en/guide/quickstart-vue2' },
        { text: 'React', link: '/en/guide/quickstart-react' },
        { text: 'React Legacy', link: '/en/guide/ecosystem#react-legacy' },
        { text: 'jQuery', link: '/en/guide/ecosystem#jquery' },
        { text: 'Svelte', link: '/en/guide/ecosystem#svelte' },
        { text: 'Core API', link: '/en/guide/ecosystem#core-api' },
        { text: 'PPTX Engine', link: '/en/guide/ecosystem#pptx-engine' },
        { text: 'Component Options', link: '/en/guide/usage' }
      ]
    },
    {
      text: 'Capability',
      items: [
        { text: 'Supported Formats', link: '/en/guide/formats' },
        { text: 'Format Fidelity', link: '/en/guide/format-fidelity' },
        { text: 'Comparison', link: '/en/guide/compare' },
        { text: 'FAQ', link: '/en/guide/faq' }
      ]
    },
    {
      text: 'Development And Release',
      items: [
        { text: 'Local Development', link: '/en/guide/development' },
        { text: 'Docker Deployment', link: '/en/guide/docker' },
        { text: 'Distribution', link: '/en/guide/distribution' }
      ]
    },
    {
      text: 'More',
      items: [
        { text: 'Changelog', link: '/changelog' },
        { text: 'Sponsor', link: '/donate' }
      ]
    }
  ]
}

const enSearch = {
  provider: 'local' as const,
  options: {
    locales: {
      root: {
        translations: {
          button: {
            buttonText: 'Search docs',
            buttonAriaLabel: 'Search docs'
          },
          modal: {
            displayDetails: 'Display details',
            resetButtonTitle: 'Reset search',
            backButtonTitle: 'Back',
            noResultsText: 'No results found',
            footer: {
              selectText: 'select',
              navigateText: 'navigate',
              closeText: 'close'
            }
          }
        }
      }
    }
  }
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Flyfish Viewer',
  description: '面向企业后台、内网和私有化系统的纯前端文件预览组件，无需服务端转码，覆盖 206+ 扩展名和 24 条预览链路。',
  cleanUrls: true,
  lastUpdated: true,
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'Flyfish Viewer',
      description: 'Browser-native file preview for internal web apps, covering 206+ extensions across 24 preview pipelines without server-side conversion.',
      themeConfig: {
        logo: '/_media/logo.svg',
        nav: enNav,
        sidebar: enSidebar,
        outline: { level: [2, 3], label: 'On This Page' },
        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        },
        lastUpdatedText: 'Last updated',
        search: enSearch,
        socialLinks: [githubSocialLink],
        footer: {
          message: 'Released under the Apache-2.0 License.',
          copyright: 'Copyright © 2026 Flyfish Viewer'
        }
      }
    }
  },
  head: [
    ['meta', { name: 'theme-color', content: '#1d6fd6' }],
    ['meta', { property: 'og:title', content: 'Flyfish Viewer' }],
    ['meta', { property: 'og:description', content: '面向企业后台、内网和私有化系统的纯前端文件预览组件，覆盖 206+ 扩展名和 24 条预览链路。' }]
  ],
  themeConfig: {
    logo: '/_media/logo.svg',
    nav: [
      { text: '文档', link: '/guide/' },
      { text: '快速开始', link: '/guide/quickstart' },
      { text: '生态接入', link: '/guide/ecosystem' },
      { text: '支持格式', link: '/guide/formats' },
      {
        text: '资源',
        items: [
          { text: '官方文档', link: 'https://doc.file-viewer.app' },
          { text: '官网门户', link: 'https://file-viewer.app' },
          { text: '在线 Demo', link: 'https://demo.file-viewer.app' },
          { text: 'npm Core', link: 'https://www.npmjs.com/package/@file-viewer/core' },
          { text: 'npm Vanilla JS / Pure Web', link: 'https://www.npmjs.com/package/@file-viewer/web' },
          { text: 'npm Vue3', link: 'https://www.npmjs.com/package/@file-viewer/vue3' },
          { text: 'npm React', link: 'https://www.npmjs.com/package/@file-viewer/react' },
          { text: 'npm Svelte', link: 'https://www.npmjs.com/package/@file-viewer/svelte' },
          { text: 'GitHub 开源总仓库', link: 'https://github.com/flyfish-dev/file-viewer' },
          { text: 'GitHub Wiki', link: 'https://github.com/flyfish-dev/file-viewer/wiki' },
          { text: 'Gitee 开源总仓库', link: 'https://gitee.com/flyfish-dev/file-viewer' },
          { text: '打赏与优先支持', link: 'https://dev.flyfish.group/shop' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始阅读',
          items: [
            { text: '文档导览', link: '/guide/' },
            { text: '概述', link: '/guide/overview' },
            { text: 'Demo 说明', link: '/guide/demo' },
            { text: '快速开始', link: '/guide/quickstart' }
          ]
        },
        {
          text: '集成方式',
          items: [
            { text: '生态组件总览', link: '/guide/ecosystem' },
            { text: '模块化与按需装配', link: '/guide/on-demand-renderers#_2-1-0-推荐接入步骤' },
            { text: '纯 JS / Script 标签集成', link: '/guide/quickstart-web' },
            { text: 'Vue3 集成', link: '/guide/quickstart-vue3' },
            { text: 'Vue2.7 / 2.6 集成', link: '/guide/quickstart-vue2' },
            { text: 'React 集成', link: '/guide/quickstart-react' },
            { text: 'React Legacy 集成', link: '/guide/ecosystem#react-legacy' },
            { text: 'jQuery 集成', link: '/guide/ecosystem#jquery' },
            { text: 'Svelte 集成', link: '/guide/ecosystem#svelte' },
            { text: 'Core 自定义接入', link: '/guide/ecosystem#core' },
            { text: 'PPTX 引擎接入', link: '/guide/ecosystem#pptx' },
            { text: '组件用法', link: '/guide/usage' }
          ]
        },
        {
          text: '能力与边界',
          items: [
            { text: '支持格式', link: '/guide/formats' },
            { text: '格式完整度', link: '/guide/format-fidelity' },
            { text: '方案对比', link: '/guide/compare' },
            { text: '按需渲染架构', link: '/guide/on-demand-renderers' },
            { text: '常见问题', link: '/guide/faq' }
          ]
        },
        {
          text: '开发与发布',
          items: [
            { text: '本地开发与打包', link: '/guide/development' },
            { text: 'Docker 部署', link: '/guide/docker' },
            { text: '发布与开源分发', link: '/guide/distribution' }
          ]
        },
        {
          text: '更多信息',
          items: [
            { text: '更新日志', link: '/changelog' },
            { text: '捐赠支持', link: '/donate' }
          ]
        }
      ]
    },
    outline: { level: [2, 3], label: '本页导航' },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdatedText: '最近更新',
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                displayDetails: '显示详情',
                resetButtonTitle: '清空搜索',
                backButtonTitle: '返回',
                noResultsText: '没有找到相关内容',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    socialLinks: [
      githubSocialLink
    ],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 Flyfish Viewer'
    }
  }
})

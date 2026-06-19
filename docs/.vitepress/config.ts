import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Flyfish Viewer',
  description: '纯前端多格式文件预览组件，覆盖 194 个扩展名和 Vue3、Vue2、React、纯 JS、jQuery、Svelte 原生接入方式',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#1d6fd6' }],
    ['meta', { property: 'og:title', content: 'Flyfish Viewer' }],
    ['meta', { property: 'og:description', content: '纯前端多格式文件预览组件，覆盖 Office、PDF、OFD、CAD、3D、电子书、绘图、代码、媒体等业务附件。' }]
  ],
  themeConfig: {
    logo: '/_media/logo.svg',
    nav: [
      { text: '文档', link: '/guide/' },
      { text: '快速开始', link: '/guide/quickstart' },
      { text: '支持格式', link: '/guide/formats' },
      {
        text: '资源',
        items: [
          { text: '官方文档', link: 'https://doc.flyfish.dev' },
          { text: '在线 Demo', link: 'https://viewer.flyfish.dev' },
          { text: 'npm(Vue3)', link: 'https://www.npmjs.com/package/@flyfish-group/file-viewer3' },
          { text: 'npm(Vue2)', link: 'https://www.npmjs.com/package/@flyfish-group/file-viewer' },
          { text: 'npm(React)', link: 'https://www.npmjs.com/package/@flyfish-group/file-viewer-react' },
          { text: 'npm(纯 JS)', link: 'https://www.npmjs.com/package/@flyfish-group/file-viewer-web' },
          { text: 'GitHub 成品仓库', link: 'https://github.com/flyfish-dev/file-viewer' },
          { text: 'Gitee 成品仓库', link: 'https://gitee.com/flyfish-dev/file-viewer' },
          { text: '源码开通', link: 'https://dev.flyfish.group/shop' }
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
            { text: 'Vue3 集成', link: '/guide/quickstart-vue3' },
            { text: 'Vue2 集成', link: '/guide/quickstart-vue2' },
            { text: 'React 集成', link: '/guide/quickstart-react' },
            { text: '纯 JS 集成', link: '/guide/quickstart-web' },
            { text: '组件用法', link: '/guide/usage' }
          ]
        },
        {
          text: '能力与边界',
          items: [
            { text: '支持格式', link: '/guide/formats' },
            { text: '常见问题', link: '/guide/faq' }
          ]
        },
        {
          text: '开发与发布',
          items: [
            { text: '本地开发与打包', link: '/guide/development' },
            { text: 'Docker 部署', link: '/guide/docker' },
            { text: '发布与成品分发', link: '/guide/distribution' }
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
      {
        icon: {
          svg: '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path></svg>'
        },
        link: 'https://github.com/flyfish-dev/file-viewer'
      }
    ],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2026 Flyfish Viewer'
    }
  }
})

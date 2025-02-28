import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = ''
export const META_TITLE = 'Vue Test Utils'
export const META_DESCRIPTION = 'Vue.js 3 官方测试工具集'

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: META_DESCRIPTION,
  head: [
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:title', content: META_TITLE }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }]
  ],

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/test-utils/edit/main/docs/:path',
      text: '改进此页面的内容'
    },

    nav: [
      { text: '指南', link: '/zh/guide/' },
      { text: 'API 参考', link: '/zh/api/' },
      { text: '从 Vue 2 迁移', link: '/zh/migration/' },
      {
        text: '更新日志',
        link: 'https://github.com/vuejs/test-utils/releases'
      }
    ],

    sidebar: {
      '/zh': [
        {
          text: '安装',
          link: '/zh/installation/'
        },
        {
          text: '基础知识',
          items: [
            {
              text: '开始',
              link: '/zh/guide/'
            },
            {
              text: '快速上手',
              link: '/zh/guide/essentials/a-crash-course'
            },
            {
              text: '条件渲染',
              link: '/zh/guide/essentials/conditional-rendering'
            },
            {
              text: '测试事件触发',
              link: '/zh/guide/essentials/event-handling'
            },
            {
              text: '测试表单',
              link: '/zh/guide/essentials/forms'
            },
            {
              text: '传递数据到组件',
              link: '/zh/guide/essentials/passing-data'
            },
            {
              text: '编写易于测试的组件',
              link: '/zh/guide/essentials/easy-to-test'
            }
          ]
        },
        {
          text: '深入学习 Vue Test Utils',
          items: [
            {
              text: '插槽',
              link: '/zh/guide/advanced/slots'
            },
            {
              text: '异步行为',
              link: '/zh/guide/advanced/async-suspense'
            },
            {
              text: '发起 HTTP 请求',
              link: '/zh/guide/advanced/http-requests'
            },
            {
              text: '过渡效果',
              link: '/zh/guide/advanced/transitions'
            },
            {
              text: '组件实例',
              link: '/zh/guide/advanced/component-instance'
            },
            {
              text: '复用与组合',
              link: '/zh/guide/advanced/reusability-composition'
            },
            {
              text: '测试 v-model',
              link: '/zh/guide/advanced/v-model'
            },
            {
              text: '测试 Vuex',
              link: '/zh/guide/advanced/vuex'
            },
            {
              text: '测试 Vue Router',
              link: '/zh/guide/advanced/vue-router'
            },
            {
              text: '测试 Teleport',
              link: '/zh/guide/advanced/teleport'
            },
            {
              text: '测试替身 (stub) 和浅挂载',
              link: '/zh/guide/advanced/stubs-shallow-mount'
            },
            {
              text: '测试服务端渲染',
              link: '/zh/guide/advanced/ssr'
            }
          ]
        },
        {
          text: '扩展 Vue Test Utils',
          items: [
            {
              text: '插件',
              link: '/zh/guide/extending-vtu/plugins'
            },
            {
              text: '社区与学习资源',
              link: '/zh/guide/extending-vtu/community-learning'
            }
          ]
        },
        {
          text: '常见问题',
          link: '/zh/guide/faq/'
        },
        {
          text: '从 Vue 2 迁移',
          link: '/zh/migration/'
        },
        {
          text: 'API 参考',
          link: '/zh/api/'
        }
      ]
    }
  }
}

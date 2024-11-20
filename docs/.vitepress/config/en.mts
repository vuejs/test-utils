import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = ''
export const META_TITLE = 'Vue Test Utils'
export const META_DESCRIPTION = 'The official testing suite utils for Vue.js 3'

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: META_DESCRIPTION,
  head: [
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:title', content: META_TITLE }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
  ],

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/vuejs/test-utils/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Migrating from Vue 2', link: '/migration/' },
      {
        text: 'Changelog',
        link: 'https://github.com/vuejs/test-utils/releases'
      }
    ],

    sidebar: {
      '/': [
        {
          text: 'Installation',
          link: '/installation/'
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'A Crash Course', link: '/guide/essentials/a-crash-course' },
            {
              text: 'Conditional Rendering',
              link: '/guide/essentials/conditional-rendering'
            },
            {
              text: 'Testing Emitted Events',
              link: '/guide/essentials/event-handling'
            },
            { text: 'Testing Forms', link: '/guide/essentials/forms' },
            {
              text: 'Passing Data to Components',
              link: '/guide/essentials/passing-data'
            },
            {
              text: 'Write components that are easy to test',
              link: '/guide/essentials/easy-to-test'
            }
          ]
        },
        {
          text: 'Vue Test Utils in depth',
          items: [
            { text: 'Slots', link: '/guide/advanced/slots' },
            {
              text: 'Asynchronous Behavior',
              link: '/guide/advanced/async-suspense'
            },
            {
              text: 'Making HTTP Requests',
              link: '/guide/advanced/http-requests'
            },
            { text: 'Transitions', link: '/guide/advanced/transitions' },
            {
              text: 'Component Instance',
              link: '/guide/advanced/component-instance'
            },
            {
              text: 'Reusability and Composition',
              link: '/guide/advanced/reusability-composition'
            },
            { text: 'Testing v-model', link: '/guide/advanced/v-model' },
            { text: 'Testing Vuex', link: '/guide/advanced/vuex' },
            { text: 'Testing Vue Router', link: '/guide/advanced/vue-router' },
            { text: 'Testing Teleport', link: '/guide/advanced/teleport' },
            {
              text: 'Stubs and Shallow Mount',
              link: '/guide/advanced/stubs-shallow-mount'
            },
            { text: 'Testing Server-side Rendering', link: '/guide/advanced/ssr' }
          ]
        },
        {
          text: 'Extending Vue Test Utils',
          items: [
            { text: 'Plugins', link: '/guide/extending-vtu/plugins' },
            {
              text: 'Community and Learning',
              link: '/guide/extending-vtu/community-learning'
            }
          ]
        },
        {
          text: 'FAQ',
          link: '/guide/faq/'
        },
        {
          text: 'Migrating from Vue 2',
          link: '/migration/'
        },
        {
          text: 'API Reference',
          link: '/api/'
        }
      ]
    }
  }
}

const package = require('../../package.json')
/** @typedef {import('vitepress').UserConfig} UserConfig */

/** @type {UserConfig} */
const config = {
  title: `Vue Test Utils for Vue 3 (${package.version})`,
  description: 'The documentation for the official Vue Test Utils for Vue 3',
  locales: {
    '/': {
      lang: 'en-US',
      title: `Vue Test Utils for Vue 3 (${package.version})`
    }
  },
  head: [['link', { rel: 'icon', href: `/logo.png` }]],
  themeConfig: {
    repo: 'vuejs/vue-test-utils-next',
    docsRepo: 'vuejs/vue-test-utils-next',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    algolia: {
      apiKey: 'ee1b8516c9e5a5be9b6c25684eafc42f',
      indexName: 'vue_test_utils',
      algoliaOptions: {
        facetFilters: ['tags:next']
      }
    },
    nav: [
      { text: 'Guide', link: '/introduction/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Migrating from Vue 2', link: '/migration/' },
      {
        text: 'Changelog',
        link: 'https://github.com/vuejs/vue-test-utils-next/releases'
      }
    ],
    sidebar: [
      {
        text: 'Introduction',
        link: '/introduction/'
      },
      {
        text: 'Installation',
        link: '/installation/'
      },
      {
        text: 'Essentials',
        collapsable: false,
        children: [
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
        collapsable: false,
        children: [
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
          { text: 'Testing Vuex', link: '/guide/advanced/vuex' },
          { text: 'Testing Vue Router', link: '/guide/advanced/vue-router' },
          {
            text: 'Third-party integration',
            link: '/guide/advanced/third-party'
          },
          {
            text: 'Stubs and Shallow Mount',
            link: '/guide/advanced/stubs-shallow-mount'
          }
        ]
      },
      {
        text: 'Extending Vue Test Utils',
        collapsable: false,
        children: [
          { text: 'Plugins', link: '/guide/extending-vtu/plugins' },
          {
            text: 'Community and Learning',
            link: '/guide/extending-vtu/community-learning'
          }
        ]
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

module.exports = config

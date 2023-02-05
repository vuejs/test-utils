import { defineConfig } from 'vitepress';
import { frLocaleConfig } from "../fr/.vitepress/locale-config";
import packageJSON from '../../package.json';

export default defineConfig({
  title: `Vue Test Utils`,
  description: 'The documentation for the official Vue Test Utils',
  locales: {
    "/": {
      label: "English",
      lang: 'en-US',
      title: `Vue Test Utils`
    },
    "/fr/": {
      label: "Français",
      title: "Vue Test Utils",
      lang: "fr-FR",
      description: "La librairie officielle de Vue Test Utils",
    },
  },
  head: [['link', { rel: 'icon', href: `/logo.png` }]],
  themeConfig: {
    locales: {
      "/": {
        label: 'English',
        selectText: 'Languages',
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'API Reference', link: '/api/' },
          { text: 'Migrating from Vue 2', link: '/migration/' },
          {
            text: 'Changelog',
            link: 'https://github.com/vuejs/test-utils/releases'
          }
        ],
        sidebar: [
          {
            text: 'Installation',
            link: '/installation/'
          },
          {
            text: 'Essentials',
            collapsable: false,
            children: [
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
              { text: 'Testing v-model', link: '/guide/advanced/v-model' },
              { text: 'Testing Vuex', link: '/guide/advanced/vuex' },
              { text: 'Testing Vue Router', link: '/guide/advanced/vue-router' },
              { text: 'Testing Teleport', link: '/guide/advanced/teleport' },
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
      },
      "/fr/": frLocaleConfig,
    },
    repo: 'vuejs/test-utils',
    docsRepo: 'vuejs/test-utils',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    algolia: {
      appId: 'BH4D9OD16A',
      apiKey: 'ee1b8516c9e5a5be9b6c25684eafc42f',
      indexName: 'vue_test_utils',
      searchParameters: {
        facetFilters: ['tags:next']
      }
    },
  }
})

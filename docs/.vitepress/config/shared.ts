import { defineConfig } from 'vitepress'

// TODO:
// export const META_IMAGE = 'https://test-utils.vuejs.org/social.png'
export const META_IMAGE = null
export const isProduction =
  process.env.NETLIFY && process.env.CONTEXT === 'production'

if (process.env.NETLIFY) {
  console.log('Netlify build', process.env.CONTEXT)
}

const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g
const rCombining = /[\u0300-\u036F]/g

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .normalize('NFKD')
    // Remove accents
    .replace(rCombining, '')
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, '-')
    // ensure it doesn't start with a number
    .replace(/^(\d)/, '_$1')

export const sharedConfig = defineConfig({
  title: 'Vue Test Utils',
  appearance: true,

  markdown: {
    theme: {
      dark: 'one-dark-pro',
      light: 'github-light',
    },

    anchor: {
      slugify,
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],

    [
      'meta',
      { name: 'wwads-cn-verify', content: '7e7757b1e12abcb736ab9a754ffb617a' },
    ],

    [
      'meta',
      {
        property: 'og:type',
        content: 'website',
      },
    ],

    [
      'meta',
      {
        property: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    // [
    //   'meta',
    //   {
    //     property: 'twitter:image',
    //     content: META_IMAGE,
    //   },
    // ],
  ],

  themeConfig: {
    logo: '/logo.svg',
    outline: [2, 3],

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/vuejs/test-utils/',
      },
      {
        icon: 'discord',
        link: 'https://chat.vuejs.org',
      },
    ],

    footer: {
      copyright: 'Copyright © 2014-present Evan You',
      message: 'Released under the MIT License.',
    },

    editLink: {
      pattern: 'https://github.com/vuejs/test-utils/edit/main/docs/:path',
      text: 'Suggest changes',
    },

    algolia: {
      appId: 'BH4D9OD16A',
      apiKey: 'ee1b8516c9e5a5be9b6c25684eafc42f',
      indexName: 'vue_test_utils',
      searchParameters: {
        facetFilters: ['tags:next']
      }
    },
  },
})

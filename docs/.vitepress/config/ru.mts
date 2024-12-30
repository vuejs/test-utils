import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'
export const META_URL = ''
export const META_TITLE = 'Vue Test Utils'
export const META_DESCRIPTION = 'Официальный набор инструментов тестирования для Vue.js 3'

export const ruConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
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
    docFooter: {
      prev: 'Предыдущая',
      next: 'Следующая',
    },
    outlineTitle: "Содержание",
    editLink: {
      pattern: 'https://github.com/vuejs/test-utils/edit/main/docs/:path',
      text: 'Предложить перевод страницы на GitHub'
    },
    nav: [
      { text: 'Руководство', link: '/ru/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Миграция с Vue 2', link: '/migration/' },
      {
        text: 'Changelog',
        link: 'https://github.com/vuejs/test-utils/releases'
      }
    ],
    sidebar: {
      '/': [
        {
          text: 'Установка',
          link: '/ru/installation/'
        },
        {
          text: 'Основы',
          items: [
            { text: 'Приступая к изучению', link: '/ru/guide/' },
            {
              text: 'Ускоренный курс',
              link: '/ru/guide/essentials/a-crash-course'
            },
            {
              text: 'Условная отрисовка',
              link: '/ru/guide/essentials/conditional-rendering'
            },
            {
              text: 'Тестирование генерации событий',
              link: '/ru/guide/essentials/event-handling'
            },
            { text: 'Тестирование форм', link: '/ru/guide/essentials/forms' },
            {
              text: 'Передача данных в компоненты',
              link: '/ru/guide/essentials/passing-data'
            },
            {
              text: 'Пишем компоненты для легкого тестирования',
              link: '/ru/guide/essentials/easy-to-test'
            }
          ]
        },
        {
          text: 'Углубленно',
          items: [
            { text: 'Слоты', link: '/ru/guide/advanced/slots' },
            {
              text: 'Асинхронное поведение',
              link: '/ru/guide/advanced/async-suspense'
            },
            {
              text: 'Выполнение HTTP запросов',
              link: '/ru/guide/advanced/http-requests'
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
            {
              text: 'Testing Server-side Rendering',
              link: '/guide/advanced/ssr'
            }
          ]
        },
        {
          text: 'Дополнительные темы',
          items: [
            { text: 'Плагины', link: '/guide/extending-vtu/plugins' },
            {
              text: 'Сообщество и обучение',
              link: '/guide/extending-vtu/community-learning'
            }
          ]
        },
        {
          text: 'Ответы на вопросы',
          link: '/guide/faq/'
        },
        {
          text: 'Миграция с Vue 2',
          link: '/migration/'
        },
        {
          text: 'API руководство',
          link: '/api/'
        }
      ]
    }
  }
}

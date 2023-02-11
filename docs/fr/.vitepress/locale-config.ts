import { DefaultTheme } from "vitepress";

const frLocaleConfig: DefaultTheme.LocaleConfig & Omit<DefaultTheme.Config, "locales"> = {
  label: 'Français',
  selectText: 'Langues',
  nav: [
    { text: 'Guide', link: '/fr/guide/' },
    { text: 'API', link: '/fr/api/' },
    { text: 'Migrer depuis Vue 2', link: '/fr/migration/' },
    {
      text: 'Journal de modifications',
      link: 'https://github.com/vuejs/test-utils/releases'
    }
  ],
  sidebar: [
    {
      text: 'Installation',
      link: '/fr/installation/'
    },
    {
      text: 'Les Bases',
      collapsable: false,
      children: [
        { text: 'Pour commencer', link: '/fr/guide/' },
        { text: 'Cours rapide', link: '/fr/guide/essentials/a-crash-course' },
        {
          text: 'Rendu conditionnel',
          link: '/fr/guide/essentials/conditional-rendering'
        },
        {
          text: 'Tester les évènements émis',
          link: '/fr/guide/essentials/event-handling'
        },
        { text: 'Tester les formulaires', link: '/fr/guide/essentials/forms' },
        {
          text: 'Passer des données aux Composants',
          link: '/fr/guide/essentials/passing-data'
        },
        {
          text: 'Écrire des composants facile à tester',
          link: '/fr/guide/essentials/easy-to-test'
        }
      ]
    },
    {
      text: 'Vue Test Utils en détail',
      collapsable: false,
      children: [
        { text: 'Slots', link: '/fr/guide/advanced/slots' },
        {
          text: 'Comportement asynchrone',
          link: '/fr/guide/advanced/async-suspense'
        },
        {
          text: 'Faire des requêtes HTTP',
          link: '/fr/guide/advanced/http-requests'
        },
        { text: 'Transitions', link: '/fr/guide/advanced/transitions' },
        {
          text: 'Instance de Composant',
          link: '/fr/guide/advanced/component-instance'
        },
        {
          text: 'Réutilisabilité et Composition',
          link: '/fr/guide/advanced/reusability-composition'
        },
        { text: 'Tester v-model', link: '/fr/guide/advanced/v-model' },
        { text: 'Tester Vuex', link: '/fr/guide/advanced/vuex' },
        { text: 'Tester Vue Router', link: '/fr/guide/advanced/vue-router' },
        { text: 'Tester Teleport', link: '/fr/guide/advanced/teleport' },
        {
          text: 'Composants de Substitution (Stubs) et Montage Partiel',
          link: '/fr/guide/advanced/stubs-shallow-mount'
        }
      ]
    },
    {
      text: 'Extensions de Vue Test Utils',
      collapsable: false,
      children: [
        { text: 'Plugins', link: '/fr/guide/extending-vtu/plugins' },
        {
          text: 'Communauté et Apprentissage',
          link: '/fr/guide/extending-vtu/community-learning'
        }
      ]
    },
    {
      text: 'Migrer depuis Vue 2',
      link: '/fr/migration/'
    },
    {
      text: 'API',
      link: '/fr/api/'
    }
  ]
};

export { frLocaleConfig };

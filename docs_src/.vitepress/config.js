const base = process.env.NODE_ENV === 'development' ? '' : '/vue-test-utils-next/'

const sidebar = {
  guide: [
    {
      text: 'Essentials',
      collapsable: false,
      children: [
        { text: 'Installation', link: '/guide/installation' },
        { text: 'Introduction', link: '/guide/introduction' },
        { text: 'A Crash Course', link: '/guide/a-crash-course' },
        { text: 'Conditional Rendering', link: '/guide/conditional-rendering' },
        { text: 'Event Handling', link: '/guide/event-handling' },
        { text: 'Passing Data', link: '/guide/passing-data' },
        { text: 'Forms', link: '/guide/forms' }
      ]
    },
    {
      text: 'Vue Test Utils in depth',
      collapsable: false,
      children: [
        { text: 'Slots', link: '/guide/slots' },
        { text: 'Async Suspense', link: '/guide/async-suspense' },
        { text: 'HTTP Requests', link: '/guide/http-requests' },
        { text: 'Transitions', link: '/guide/transitions' },
        { text: 'Component Instance', link: '/guide/component-instance' },
        { text: 'Reusability and Composition', link: '/guide/reusability-composition' },
        { text: 'Vuex', link: '/guide/vuex' },
        { text: 'Vue Router', link: '/guide/vue-router' },
        { text: 'Testing Third Party Libraries', link: '/guide/third-party' },
        { text: 'Stubs and Shallow Mount', link: '/guide/stubs-shallow-mount' }
      ]
    },
    {
      text: 'Extending Vue Test Utils',
      collapsable: false,
      children: [
        { link: '/guide/plugins', text: 'Plugins' }, 
        { link: '/guide/community-learning', text: 'Community' }
      ]
    },
    {
      text: 'Migration to Vue Test Utils 2',
      collapsable: false,
      children: [{ link: '/guide/migration', text: 'Migration to Vue Test Utils 2' }]
    },
    {
      text: 'API Reference',
      collapsable: false,
      children: [{ link: '/guide/api', text: 'API Reference' }]
    }
  ]
}

module.exports = {
  base,
  title: 'Vue Test Utils',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue Test Utils (2.0.0-beta.2)'
    }
  },
  themeConfig: {
    editLinks: true,
    sidebarDepth: 2,
    sidebar: {
      [`${base}/guide/`]: sidebar.guide
    },
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API Reference', link: '/guide/api' },
      { text: 'Migration from VTU 1', link: '/guide/migration' },
      { text: 'GitHub', link: 'https://github.com/vuejs/vue-test-utils-next' }
    ]
  }
}

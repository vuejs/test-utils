const sidebar = {
  guide: [
    {
      title: 'Essentials',
      collapsable: false,
      children: [
        '/guide/installation',
        '/guide/introduction',
        '/guide/a-crash-course',
        '/guide/conditional-rendering',
        '/guide/event-handling',
        '/guide/passing-data',
        '/guide/forms'
      ]
    },
    {
      title: 'Vue Test Utils in depth',
      collapsable: false,
      children: [
        '/guide/slots',
        '/guide/async-suspense',
        '/guide/http-requests',
        '/guide/transitions',
        '/guide/component-instance',
        '/guide/reusability-composition',
        '/guide/vuex',
        '/guide/vue-router',
        '/guide/third-party',
        '/guide/stubs-shallow-mount'
      ]
    },
    {
      title: 'Extending Vue Test Utils',
      collapsable: false,
      children: ['/guide/plugins', '/guide/community-learning']
    },
    {
      title: 'Migration to Vue Test Utils 2',
      collapsable: false,
      children: ['/guide/migration']
    },
    {
      title: 'API Reference',
      collapsable: false,
      children: ['/api/']
    }
  ],
  api: [
    {
      title: 'API Reference',
      collapsable: false,
      children: ['/api/']
    }
  ]
}

module.exports = {
  base: '/vue-test-utils-next-docs/',
  title: 'Vue Test Utils',
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue Test Utils (2.0.0-beta.0)'
    }
  },
  themeConfig: {
    editLinks: true,
    sidebarDepth: 2,
    sidebar: {
      '/guide/': sidebar.guide,
      '/api/': sidebar.api
    },
    nav: [
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Migration from VTU 1', link: '/guide/migration' },
      { text: 'GitHub', link: 'https://github.com/vuejs/vue-test-utils-next' }
    ]
  }
}

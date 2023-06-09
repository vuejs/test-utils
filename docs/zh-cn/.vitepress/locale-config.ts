import { DefaultTheme } from "vitepress";

const zhLocaleConfig: DefaultTheme.LocaleConfig & Omit<DefaultTheme.Config, "locales"> = {
  label: '简体中文',
  selectText: 'Languages',
  nav: [
    { text: '指南', link: '/zh-cn/guide/' },
    { text: 'API 参考', link: '/zh-cn/api/' },
    { text: '迁移自 Vue 2', link: '/zh-cn/migration/' },
    {
      text: '更新日志',
      link: 'https://github.com/vuejs/test-utils/releases'
    }
  ],
  sidebar: [
    {
      text: '安装',
      link: '/zh-cn/installation/'
    },
    {
      text: '概要',
      collapsable: false,
      children: [
        { text: '入门指引', link: '/zh-cn/guide/' },
        { text: '快速课程', link: '/zh-cn/guide/essentials/a-crash-course' },
        {
          text: '条件渲染',
          link: '/zh-cn/guide/essentials/conditional-rendering'
        },
        {
          text: '测试事件发送',
          link: '/zh-cn/guide/essentials/event-handling'
        },
        { text: '测试表单', link: '/zh-cn/guide/essentials/forms' },
        {
          text: '组件传递数据',
          link: '/zh-cn/guide/essentials/passing-data'
        },
        {
          text: '编写易于测试的组件',
          link: '/zh-cn/guide/essentials/easy-to-test'
        }
      ]
    },
    {
      text: '深入了解 Vue Test Utils',
      collapsable: false,
      children: [
        { text: '插槽', link: '/zh-cn/guide/advanced/slots' },
        {
          text: '异步行为',
          link: '/zh-cn/guide/advanced/async-suspense'
        },
        {
          text: '处理 HTTP 请求',
          link: '/zh-cn/guide/advanced/http-requests'
        },
        { text: '过渡动画', link: '/zh-cn/guide/advanced/transitions' },
        {
          text: '组件实例',
          link: '/zh-cn/guide/advanced/component-instance'
        },
        {
          text: '复用与组合',
          link: '/zh-cn/guide/advanced/reusability-composition'
        },
        { text: '测试 v-model', link: '/zh-cn/guide/advanced/v-model' },
        { text: '测试 Vuex', link: '/zh-cn/guide/advanced/vuex' },
        { text: '测试 Vue Router', link: '/zh-cn/guide/advanced/vue-router' },
        { text: '测试 Teleport', link: '/zh-cn/guide/advanced/teleport' },
        {
          text: '模拟对象与浅挂载',
          link: '/zh-cn/guide/advanced/stubs-shallow-mount'
        },
        { text: '测试服务端渲染', link: '/zh-cn/guide/advanced/ssr' }
      ]
    },
    {
      text: '扩展 Vue Test Utils',
      collapsable: false,
      children: [
        { text: '插件', link: '/zh-cn/guide/extending-vtu/plugins' },
        {
          text: '社区和学习',
          link: '/zh-cn/guide/extending-vtu/community-learning'
        }
      ]
    },
    {
      text: 'FAQ',
      link: '/guide/faq/'
    },
    {
      text: '迁移自 Vue 2',
      link: '/migration/'
    },
    {
      text: 'API 参考',
      link: '/api/'
    }
  ]
};

export { zhLocaleConfig };

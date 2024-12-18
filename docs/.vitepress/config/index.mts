import { enConfig } from './en.mts'
import { frConfig } from './fr.mts'
import { zhConfig } from './zh.mts'
import { sharedConfig } from './shared.mts'
import { defineConfig } from 'vitepress'
import { ruConfig } from './ru.mts'

export default defineConfig({
  ...sharedConfig,

  locales: {
    root: { label: 'English', lang: 'en-US', link: '/', ...enConfig },
    fr: { label: 'Français', lang: 'fr-FR', link: '/fr/', ...frConfig },
    zh: {
      label: '简体中文 (校对中)',
      lang: 'zh-CN',
      link: '/zh/',
      ...zhConfig
    },
    ru: { label: 'Русский', lang: 'ru-RU', link: '/ru/', ...ruConfig }
  },

})

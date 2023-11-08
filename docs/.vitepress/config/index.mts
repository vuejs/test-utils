import { enConfig } from './en.mts'
import { frConfig } from './fr.mts'
import { sharedConfig } from './shared.mts'
import { defineConfig } from 'vitepress'

export default defineConfig({
  ...sharedConfig,

  locales: {
    root: { label: 'English', lang: 'en-US', link: '/', ...enConfig },
    fr: { label: 'Français',  lang: 'fr-FR', link: '/fr/', ...frConfig },
  }
})

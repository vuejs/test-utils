import { enConfig } from './en'
import { frConfig } from './fr'
import { sharedConfig } from './shared'
import { defineConfig } from 'vitepress'

export default defineConfig({
  ...sharedConfig,

  locales: {
    root: { label: 'English', lang: 'en-US', link: '/', ...enConfig },
    fr: { label: 'Français',  lang: 'fr-FR', link: '/fr/', ...frConfig },
  }
})

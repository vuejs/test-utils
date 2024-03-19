import { h } from 'vue'
import Theme from 'vitepress/theme'
import TranslationStatus from 'vitepress-translation-helper/ui/TranslationStatus.vue'
import status from '../translation-status.json'

const i18nLabels = {
  // TODO: to be translated
  fr: 'The translation is synced to the docs on ${date} of which the commit hash is <code>${hash}</code>.',
}


export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'doc-before': () => h(TranslationStatus, { status, i18nLabels }),
    })
  },
}

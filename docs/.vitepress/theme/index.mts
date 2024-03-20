import { h } from 'vue'
import Theme from 'vitepress/theme'
import TranslationStatus from 'vitepress-translation-helper/ui/TranslationStatus.vue'
import status from '../translation-status.json'

const i18nLabels = {
  fr: 'La traduction est synchronisée avec les docs du ${date} dont le hash du commit est <code>${hash}</code>.',
}


export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'doc-before': () => h(TranslationStatus, { status, i18nLabels }),
    })
  },
}

import { h } from 'vue'
import Theme from 'vitepress/theme'
import TranslationStatus from 'vitepress-translation-helper/ui/TranslationStatus.vue'
import status from '../translation-status.json'
import './custom.css'
const i18nLabels = {
  fr: 'La traduction est synchronisée avec les docs du ${date} dont le hash du commit est <code>${hash}</code>.',
  zh: '该翻译已同步到了 ${date} 的版本，其对应的 commit hash 是 <code>${hash}</code>。'
}

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'doc-before': () => h(TranslationStatus, { status, i18nLabels })
    })
  }
}

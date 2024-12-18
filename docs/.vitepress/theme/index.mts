import { h } from 'vue'
import Theme from 'vitepress/theme'
import TranslationStatus from 'vitepress-translation-helper/ui/TranslationStatus.vue'
import status from '../translation-status.json'
import './custom.css'
const i18nLabels = {
  fr: 'La traduction est synchronisée avec les docs du ${date} dont le hash du commit est <code>${hash}</code>.',
  zh: '该翻译已同步到了 ${date} 的版本，其对应的 commit hash 是 <code>${hash}</code>。<br /><mark>同时该文档仍处于校对中，如有任何疑问或想参与校对工作，请<a href="https://github.com/vuejs/test-utils/issues/2561" target="_blank" style="font-weight: bold; text-decoration: underline;">移步这里</a>了解更多。</mark>',
  ru: "Последняя дата обновления документации: ${date}"
}


export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      'doc-before': () => h(TranslationStatus, { status, i18nLabels }),
    })
  },
}

<!--
  Adapted from vitepress-translation-helper
  https://github.com/vuejs-translations/vitepress-translation-helper
  Copyright (c) 2024-present Jinjiang. Licensed under the MIT License.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

type Status = Record<string, { hash: string; date: string }>

const props = defineProps<{
  i18nLabels: Record<string, string>
  status: Status
}>()

const { site } = useData()

const label = computed(() => {
  const locale = site.value.localeIndex
  if (!locale || locale === 'root' || !props.status[locale]) {
    return ''
  }
  const { date, hash } = props.status[locale]
  const template =
    props.i18nLabels[locale] ??
    'The translation is synced to the docs on ${date} of which the commit hash is <code>${hash}</code>.'
  return template
    .replace('${date}', `<time>${date}</time>`)
    .replace('${hash}', `<code>${hash.substring(0, 7)}</code>`)
})
</script>

<template>
  <div v-if="label" class="text-status" v-html="label"></div>
</template>

<style scoped>
.text-status {
  padding: 1em 1.25em;
  font-size: small;
  text-align: right;
  color: var(--vp-c-text-2);
}
</style>

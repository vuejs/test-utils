<script setup lang="ts">
import { defineComponent, h } from 'vue'
import TemplateOnly from './TemplateOnly.vue'

const Card = defineComponent({
  render() {
    return h('div', this.$slots.icon?.())
  }
})
</script>

<template>
  <Card>
    <template #icon>
      <TemplateOnly />
    </template>
  </Card>
</template>

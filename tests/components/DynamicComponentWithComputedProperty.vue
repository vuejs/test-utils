<template>
  <component :is="Hello" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Hello from './Hello.vue'
import ComponentWithChildren from './ComponentWithChildren.vue'

interface Props {
  isHello?: boolean
}

const props = defineProps<Props>()

const computedProperty = computed(() => {
  return props.isHello ? Hello : ComponentWithChildren
})
</script>

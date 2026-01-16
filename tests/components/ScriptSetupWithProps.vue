<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ count: number }>()
const internalCount = ref(props.count)
const inc = () => {
  internalCount.value++
}
</script>

<template>
  <button @click="inc">{{ internalCount }}</button>
</template>

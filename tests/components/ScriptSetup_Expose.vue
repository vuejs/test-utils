<script setup lang="ts">
// imported components are also directly usable in template
import { ref } from 'vue'
import Hello from './Hello.vue'

const count = ref(0)
const inc = () => {
  count.value++
}
const resetCount = () => {
  count.value = 0
}

defineExpose({
  count,
  resetCount
})
</script>

<template>
  <button @click="inc">{{ count }}</button>
  <Hello />
</template>

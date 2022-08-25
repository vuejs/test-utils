<script setup lang="ts">
// imported components are also directly usable in template
import { ref } from 'vue'
import Hello from './Hello.vue'

// write Composition API code just like in a normal setup()
// but no need to manually return everything
const count = ref(0)
const inc = () => {
  count.value++
}
const resetCount = () => {
  count.value = 0
}
</script>

<template>
  <button @click="inc">{{ count }}</button>
  <Hello />
</template>

<template>
  <button @click="clickHandler()"/>
</template>

<script lang="ts" setup>
import { simulateDelay } from '../utils'
import { ref } from 'vue'

const clicked = ref(false)

const clickHandler = async() => {
  await simulateDelay({ delayInMs: 100 })
  clicked.value = true
}

defineExpose({ clicked, clickHandler })
</script>

<script setup vapor lang="ts">
import { ref } from 'vue'

const count = ref(0)
const label = ref('Increment')
defineExpose({ count })
</script>

<template><button @click="count++">{{ label }}</button></template>

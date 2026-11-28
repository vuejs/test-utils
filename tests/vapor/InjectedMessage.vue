<script setup vapor lang="ts">
import { inject } from 'vue'

const message = inject<string>('message')
</script>

<template><p>{{ message }}</p></template>

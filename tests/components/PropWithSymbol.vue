<template>
  <div>Symbol: {{ sym }}</div>
</template>

<script lang="ts" setup>
interface Props {
  sym?: Symbol
}

const { sym = Symbol() } = defineProps<Props>()
</script>

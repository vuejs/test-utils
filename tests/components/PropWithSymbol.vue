<template>
  <div>Symbol: {{ sym }}</div>
</template>

<script lang="ts" setup>
interface Props {
  sym?: symbol
}

const { sym = Symbol() } = defineProps<Props>()
</script>

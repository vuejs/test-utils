<template>
  <div>Symbol: {{ $props.sym }}</div>
</template>

<script lang="ts" setup>
interface Props {
  sym?: Symbol
}

withDefaults(defineProps<Props>(), {
  sym: () => Symbol()
})
</script>

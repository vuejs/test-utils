<script setup vapor lang="ts">
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <Teleport to="body" :disabled="disabled">
    <p class="teleported">teleported</p>
  </Teleport>
</template>

<template>
  <div>
    <h2>{{ name }}</h2>
    <Hello />
    <template
      v-for="item in items"
      :key="item"
    >
      <RecursiveComponent
        :name="item"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Hello from './Hello.vue'

defineProps<{
  name: string
  items?: string[]
}>()
</script>

<template>
  <render></render>
</template>

<script setup lang="ts">
import { h } from 'vue'

const render = () => [
  h('a', {}, 'first'),
  h('a', {}, 'second'),
  h('a', {}, 'third'),
  h('span', {}, 'other span')
]
</script>

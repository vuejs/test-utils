<template>
  <div>
    {{ title }}
  </div>
  <p>{{ type }}</p>
  <div v-if="data.length" id="data">Has Data</div>
</template>

<script setup lang="ts">
import { inject, ref, toRefs } from 'vue'

const props = defineProps<{
  title: string
}>()

const { title } = toRefs(props)

const type = inject('parentType')

const data = ref<string[]>([])

function getData() {
  data.value = ['some data']
}

getData()
</script>

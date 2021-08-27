<template>
  <div>
    {{ title }}
  </div>
  <p>{{ type }}</p>
  <div v-if="data.length" id="data">Has Data</div>
</template>

<script setup>
import { toRefs, ref, inject } from 'vue'

const props = defineProps({
  title: { required: true, type: String }
})

const { title } = toRefs(props)

const type = inject('parentType')

const data = ref([])

function getData() {
  data.value = ['some data']
}

getData()
</script>

<template>
  <div id="countValue">{{ countValue }}</div>
  <div id="oneLayerCountObjectValue">{{ oneLayerCountObjectValue }}</div>
  <div id="twoLayersCountObjectValue">{{ twoLayersCountObjectValue }}</div>
  <div id="countArrayValue">{{ countArrayValue }}</div>
  <div id="countMatrixValue">{{ countMatrixValue }}</div>
  <div id="oneLayerCountObjectArrayValue">
    {{ oneLayerCountObjectArrayValue }}
  </div>
  <div id="oneLayerCountArrayObjectValue">
    {{ oneLayerCountArrayObjectValue }}
  </div>
  <div id="oneLayerCountObjectMatrixValue">
    {{ oneLayerCountObjectMatrixValue }}
  </div>
</template>

<script setup lang="ts">
import { computed, Ref } from 'vue'

type Props = {
  count: Ref<number>
  oneLayerCountObject: { count: Ref<number> }
  twoLayersCountObject: { oneLayerCountObject: { count: Ref<number> } }

  countArray: Ref<number>[]
  countMatrix: Ref<number>[][]

  oneLayerCountObjectArray: { count: Ref<number> }[]
  oneLayerCountArrayObject: { count: Ref<number>[] }
  oneLayerCountObjectMatrix: { count: Ref<number> }[][]
}

const props = defineProps<Props>()
const countValue = computed(() => props.count.value)
const oneLayerCountObjectValue = computed(
  () => props.oneLayerCountObject.count.value
)
const twoLayersCountObjectValue = computed(
  () => props.twoLayersCountObject.oneLayerCountObject.count.value
)

const countArrayValue = computed(() => props.countArray[0].value)
const countMatrixValue = computed(() => props.countMatrix[0][0].value)

const oneLayerCountObjectArrayValue = computed(
  () => props.oneLayerCountObjectArray[0].count.value
)
const oneLayerCountArrayObjectValue = computed(
  () => props.oneLayerCountArrayObject.count[0].value
)
const oneLayerCountObjectMatrixValue = computed(
  () => props.oneLayerCountObjectMatrix[0][0].count.value
)
</script>

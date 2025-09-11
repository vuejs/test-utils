<script setup lang="ts">
import { ref } from 'vue'
import Child from './TeleportRemountChild.vue'

const parentValue = ref<Array<'mount' | 'unmount'>>([])

const handleEmit = (e: 'mount' | 'unmount') => {
  parentValue.value.push(e)
}
</script>
<template>
  <div>
    <p id="parent-value">{{ JSON.stringify(parentValue) }}</p>
    <Teleport to="#teleport-target">
      <Child @my-event="handleEmit" />
    </Teleport>
  </div>
</template>

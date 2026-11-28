<script setup vapor lang="ts">
import { type Ref, onUnmounted, ref, watchEffect } from 'vue'

const props = defineProps<{
  label: string
  signal?: Ref<number>
  observe?: (value: number) => void
  cleanup?: () => void
}>()
const emit = defineEmits<{ change: [number] }>()
const count = ref(0)
watchEffect(() => props.observe?.(props.signal?.value ?? 0))
onUnmounted(() => props.cleanup?.())
defineExpose({ count })
</script>

<template>
  <section class="counter" :aria-label="label">
    <button ref="button" @click="emit('change', ++count)">
      {{ label }}:{{ count }}
    </button>
  </section>
</template>

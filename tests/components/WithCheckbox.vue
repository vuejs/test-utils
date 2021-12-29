<template>
  <input
    class="or-checkbox-input"
    type="checkbox"
    id="or-checkbox-rand"
    ref="checkboxElement"
    v-bind="$attrs"
    @change="onCheckboxValueChange"
  />
  <label class="or-checkbox-label center" for="or-checkbox-rand">
    <span class="or-checkbox center jc-center"></span>
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'update:modelValue', value?: unknown): void
}>()

const checkboxElement = ref<HTMLInputElement>()

const onCheckboxValueChange = (event: Event) => {
  emit('update:modelValue')
}
</script>

<style scoped>
.or-checkbox-input {
  display: none;
}
</style>

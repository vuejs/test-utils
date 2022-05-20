<template>
  <div>
    <template v-for="field of availableFields" :key="field.name">
      <button class="field" @click="selectedField = field">
        {{ field.name }}
      </button>
      <div
        v-if="selectedField === field"
        class="selectedField"
      >
        {{ field.name }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    availableFields: { type: Array, required: true }
  },
  data: () => ({
    selectedField: ''
  })
}
</script>

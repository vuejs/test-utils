<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  emits: ['signup'],
  setup(props, { emit }) {
    const username = ref('')
    const error = computed(() => username.value.length < 8)
    function submit() {
      if (!error.value) {
        emit('signup', username.value)
      }
    }
    return { username, submit }
  }
})
</script>

<template>
  <div>
    <form @submit.prevent="submit">
      <input v-model="username" />
    </form>
  </div>
</template>

<script>
export default {
  emits: ['signup'],
  data() {
    return {
      username: ''
    }
  },
  computed: {
    error() {
      return this.username.length < 8
    }
  },
  methods: {
    submit() {
      if (!this.error) {
        this.$emit('signup', this.username)
      }
    }
  }
}
</script>
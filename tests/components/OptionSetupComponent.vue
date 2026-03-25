<script>
export default {
  setup() {
    const description = 'Options API with setup() function'
    return { description }
  },
  data() {
    return {
      message: 'Hello world!'
    }
  }
}
</script>

<template>
  <div>{{ message }} ({{ description }})</div>
  <div>{{ foo }}</div>
</template>

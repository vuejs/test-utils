<template>
  <div>
    <RouterLink class="link" :to="{ name: name }">
      <slot> A test link </slot>
    </RouterLink>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MyLink',
  props: {
    name: {
      type: String,
      required: true
    }
  }
}
</script>

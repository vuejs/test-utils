<template>
  <div class="last-updated" v-if="when">
    Last update: <span>{{ when }}</span>
  </div>
</template>

<script>
export default {
  name: 'last-updated',
  props: ['when']
}
</script>

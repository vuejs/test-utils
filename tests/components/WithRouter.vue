<template>
  <div>
    Home
    <router-link to="/posts" data-testid="to-posts">To Posts</router-link>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'WithRouter' ,
  setup() {
    const route = useRoute()
    console.log(route.path)
  }
})
</script>
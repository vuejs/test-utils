<script setup lang="ts">
import { ref } from 'vue'
const hello = ref('hello')

function clicked() {
  //@ts-ignore For example Nuxt will inject these kinds of global functions
  $fetch('http://www.example.com').then((response : any) => {
    hello.value = response.data
  })
}

</script>

<template>
  <button @click="clicked">{{ hello }}</button>
</template>

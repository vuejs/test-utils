<template>
  <div>sArray:{{dataStringArray}}|s:{{dataString}}</div>
</template>


<script setup lang="ts">

import {ref} from "vue";

const dataStringArray = ref<string[]>(['initialA','initialB'])
const dataString = ref<string>('initialC')

</script>

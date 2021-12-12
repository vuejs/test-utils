<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import Hello from './Hello.vue'
import ComponentWithInput from './ComponentWithInput.vue'
import ComponentWithoutName from './ComponentWithoutName.vue'
const ComponentAsync = defineAsyncComponent(
  () => import('./ComponentWithoutName.vue')
)
import ScriptSetup from './ScriptSetup.vue'
import WithProps from './WithProps.vue'
</script>

<template>
  <hello />
  <component-with-input />
  <component-without-name />
  <component-async />
  <script-setup />
  <with-props />
</template>

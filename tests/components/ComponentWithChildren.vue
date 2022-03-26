<template>
  <div class="ComponentWithChildren">
    <hello />
    <component-with-input />
    <component-without-name />
    <script-setup />
    <with-props />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Hello from './Hello.vue'
import ComponentWithInput from './ComponentWithInput.vue'
import ComponentWithoutName from './ComponentWithoutName.vue'
import ScriptSetup from './ScriptSetup.vue'
import WithProps from './WithProps.vue'

export default defineComponent({
  name: 'ComponentWithChildren',
  components: {
    Hello,
    ComponentWithInput,
    ComponentWithoutName,
    ScriptSetup,
    WithProps
  },
  data() {
    return {}
  }
})
</script>

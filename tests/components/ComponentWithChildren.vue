<template>
  <div class="ComponentWithChildren">
    <hello />
    <component-with-input />
    <component-without-name />
    <script-setup />
    <with-props />
  </div>
</template>

<script>
import Hello from './Hello'
import ComponentWithInput from './ComponentWithInput'
import ComponentWithoutName from './ComponentWithoutName'
import ScriptSetup from './ScriptSetup'
import WithProps from './WithProps'

export default {
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
}
</script>

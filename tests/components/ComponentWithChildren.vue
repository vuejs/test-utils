<template>
  <div class="ComponentWithChildren">
    <hello />
    <component-with-input />
    <component-without-name />
    <with-props />
  </div>
</template>

<script>
import Hello from './Hello'
import ComponentWithInput from './ComponentWithInput'
import ComponentWithoutName from './ComponentWithoutName'
import WithProps from './WithProps'

export default {
  name: 'ComponentWithChildren',
  components: {
    Hello,
    ComponentWithInput,
    ComponentWithoutName,
    WithProps
  },
  data () {
    return {}
  }
}
</script>

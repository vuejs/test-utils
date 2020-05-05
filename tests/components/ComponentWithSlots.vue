<template>
  <div class="ComponentWithSlots">
    <slot />
    <slot name="named" />
    <slot name="withDefault">With Default Content</slot>
    <slot name="scoped" v-bind="{ boolean, string, object }" />
  </div>
</template>

<script>
export default {
  name: 'ComponentWithSlots',
  data () {
    return {
      boolean: true,
      string: 'string',
      object: { foo: 'foo' }
    }
  }
}
</script>

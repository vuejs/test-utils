<template>
  <div class="ComponentWithSlots">
    <div class="default">
      <slot />
    </div>
    <div class="named">
      <slot name="named" />
    </div>
    <div class="withDefault">
      <slot name="withDefault">With Default Content</slot>
    </div>
    <div class="scoped">
      <slot name="scoped" v-bind="{ boolean, string, object }" />
    </div>
    <div class="scopedWithDefault">
      <slot name="scopedWithDefault" v-bind="{ boolean, string, object }">
        boolean: {{ boolean }} string: {{ string }} object: {{ object }}
      </slot>
    </div>
    <slot />
    <slot name="named" />
    <slot name="withDefault">With Default Content</slot>
    <slot name="scoped" v-bind="{ boolean, string, object }" />
  </div>
</template>

<script>
export default {
  name: 'ComponentWithSlots',
  data() {
    return {
      boolean: true,
      string: 'string',
      object: { foo: 'foo' }
    }
  }
}
</script>

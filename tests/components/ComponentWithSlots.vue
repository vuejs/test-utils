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
      <slot name="scoped" v-bind="{ aBoolean, aString, anObject }" />
    </div>
    <table class="insideTable">
      <colgroup>
        <slot name="insideTable" />
      </colgroup>
    </table>
    <div class="scopedWithDefault">
      <slot name="scopedWithDefault" v-bind="{ aBoolean, aString, anObject }">
        boolean: {{ aBoolean }} string: {{ aString }} object: {{ anObject }}
      </slot>
    </div>
    <slot />
    <slot name="named" />
    <slot name="withDefault">With Default Content</slot>
    <slot name="scoped" v-bind="{ aBoolean, aString, anObject }" />
  </div>
</template>

<script lang="ts" setup>
const aBoolean = true
const aString = 'string'
const anObject = { foo: 'foo' }
</script>

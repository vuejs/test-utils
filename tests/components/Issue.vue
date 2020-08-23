<template>
  <ComponentA>
    <ComponentB>
      <div class="content" id="1">1</div>
    </ComponentB>
    <ComponentB>
      <div class="content" id="2">2</div>
    </ComponentB>
    <ComponentB>
      <div class="content" id="3">3</div>
    </ComponentB>
  </ComponentA>
</template>

<script lang="ts">
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

export default {
  components: {
    ComponentA,
    ComponentB
  }
}
</script>
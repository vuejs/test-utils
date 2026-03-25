<script setup lang="ts">
// imported components are also directly usable in template
import { ref } from 'vue'
import Hello from './Hello.vue'

/* ------ Common Test Case ------ */
const exposedState1 = 'exposedState1'
const exposedState2 = 'exposedState2'

const exposedState2Getter = () => {
  return exposedState2
}

const exposedRef = ref('exposedRef')
const exposedRefGetter = () => {
  return exposedRef.value
}

const exposedMethod1 = () => {
  return 'result of exposedMethod1'
}

const exposedMethod2 = () => {
  return 'result of exposedMethod2'
}
/* ------ Common Test Case End ------ */

const refNonExposed = ref('refNonExposed')
const refNonExposedGetter = () => {
  return refNonExposed.value
}

const count = ref(0)
const inc = () => {
  count.value++
}

const resetCount = () => {
  count.value = 0
}

defineExpose({
  /* ------ Common Test Case ------ */
  exposeObjectLiteral: 'exposeObjectLiteral',

  exposedState1,
  exposedState2Alias: exposedState2,
  exposedState2Getter,

  exposedRef,
  exposedRefGetter,

  exposedMethod1,
  exposedMethod2Alias: exposedMethod2,
  /* ------ Common Test Case End ------ */

  count,
  resetCount,
  refNonExposedGetter
})
</script>

<template>
  <button @click="inc">{{ count }}</button>
  <div>{{ refNonExposed }}</div>
  <Hello />
</template>

<template>
  <div id="root">
    <div id="msg">{{ returnedState }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Hello',

  setup(props, { expose }) {
    /* ------ Common Test Case ------ */
    const exposedState1 = 'exposedState1'
    const exposedState2 = 'exposedState2'

    const exposedState2Getter = () => {
      return exposedState2;
    }

    const exposedRef = ref('exposedRef')
    const exposedRefGetter = () => {
      return exposedRef.value;
    }

    const exposedMethod1 = () => {

      return 'result of exposedMethod1';
    }

    const exposedMethod2 = () => {
      return 'result of exposedMethod2';
    }
    /* ------ Common Test Case End ------ */

    const stateNonExposedAndNonReturned = 'stateNonExposedAndNonReturned'
    const stateNonExposedAndNonReturnedGetter = () => {
      return stateNonExposedAndNonReturned;
    }

    const returnedState = ref('returnedState')

    expose({
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

      stateNonExposedAndNonReturnedGetter,
    })

    return {
      exposedMethod1,
      returnedState,
    }
  }
})
</script>

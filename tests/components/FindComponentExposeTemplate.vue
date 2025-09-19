<template>
  <div>Example</div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FindComponentExposeTemplate',
  props: {
    someProp: String,
  },
  setup(_, { expose }) {
    const exposedFn = () => {
      return 'exposedFnReturn';
    };

    expose({
      exposedFn,
    });

    return {
      oopsy: 1
    };
  }
})
</script>


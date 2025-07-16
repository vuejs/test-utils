<template>
  <div>Example</div>
</template>

<script setup>
const props = defineProps({
  someProp: String,
});

const exposedFn = () => {
  return 'exposedFnReturn';
};

defineExpose({
  exposedFn,
});
</script>

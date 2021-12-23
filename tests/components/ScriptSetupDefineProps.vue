<script setup lang="ts">
withDefaults(
  defineProps<{
    withDefaultString?: string
    withDefaultBool?: boolean
    withDefaultArray?: string[]
    withDefaultObject?: Record<string, string>
  }>(),
  {
    withDefaultString: 'default-value',
    withDefaultBool: false,
    withDefaultArray: () => ['one', 'two'],
    withDefaultObject: () => ({ obj: 'default' })
  }
)
</script>

<template>
  <div />
</template>

<template>
  <div>sArray:{{dataStringArray}}|s:{{dataString}}</div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({})
export default class SimpleDataClassComponent extends Vue {
  dataText: string = ''
  msg!: string // declared for type-checking

  dataStringArray : string[]= ['initialA','initialB']
  dataString: string  = 'initialC'
}
</script>

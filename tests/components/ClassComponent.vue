<template>
  <div class="hello">
    <h1>{{ computedMsg }}</h1>
    <button @click="changeMessage('Hello')" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
@Options({
  props: {
    msg: String
  }
})
export default class ClassComponent extends Vue {
  dataText: string
  get computedMsg(): string {
    return `Message: ${(this.$props as any).msg}`
  }

  changeMessage(text: string): void {
    this.dataText = text
  }
}
</script>
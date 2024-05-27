import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'HelloJsx',
  setup() {
    const msg = ref('Hello World')

    return () => (
      <div id="root">
        <div id="msg">{msg}</div>
      </div>
    )
  }
})

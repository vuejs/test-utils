<script lang="ts">
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  name: 'Hello',

  setup(props, { expose }) {
    const other = ref('other')
    const msg = ref('Hello world')
    expose({ other })
    return () => [h('div', msg.value), h('div', other.value)]
  }
})
</script>

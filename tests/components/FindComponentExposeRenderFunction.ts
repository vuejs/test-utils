import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'FindComponentExposeRenderFunction',
  props: {
    someProp: String
  },
  setup(_, { expose }) {
    const exposedFn = () => {
      return 'exposedFnReturn'
    }

    expose({
      exposedFn
    })

    return () => {
      return h('div', 'Example')
    }
  }
})

import { defineComponent, h } from 'vue'

// TODO: Borrow typings from vue-router-next
export const RouterLinkStub = defineComponent({
  name: 'RouterLinkStub',

  props: {
    to: {
      type: [String, Object],
      required: true
    }
  },

  render() {
    return h('a', undefined, this.$slots?.default?.())
  }
})

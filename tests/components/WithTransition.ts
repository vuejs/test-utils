import { Transition, defineComponent, h, ref } from 'vue'

export const WithTransition = defineComponent({
  name: 'WithTransition',

  setup() {
    const show = ref(false)
    const onClick = () => (show.value = !show.value)

    return () => {
      const btn = h(
        'button',
        {
          onClick: onClick
        },
        'Toggle Visible'
      )

      const message = h(
        'div',
        {
          id: 'message',
          key: 'k1'
        },
        'This has a fade transition'
      )

      return h('div', [
        btn,
        h(Transition, { name: 'fade' }, () => (show.value ? message : null))
      ])
    }
  }
})

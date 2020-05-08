import { compile } from '@vue/compiler-dom'

export function processSlot(template) {
  const Vue = require('vue')

  const { code } = compile(
    `<SlotWrapper v-bind="$attrs">${template}</SlotWrapper>`,
    {
      mode: 'function',
      prefixIdentifiers: true
    }
  )
  return {
    render: eval(`(() => {${code}})()`),
    components: {
      SlotWrapper: {
        setup(props, { slots }) {
          return () => slots.default(props)
        }
      }
    }
  }
}

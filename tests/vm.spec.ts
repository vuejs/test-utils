import { defineComponent, ref } from 'vue'

import { mount } from '../src'

describe('vm', () => {
  it('returns the component vm', () => {
    const Component = defineComponent({
      template: '<div>{{ msg }}</div>',
      setup() {
        const msg = 'hello'
        const isEnabled = ref(true)
        return { msg, isEnabled }
      }
    })

    const wrapper = mount(Component)

    expect((wrapper.vm as any).msg).toBe('hello')
    expect((wrapper.vm as any).isEnabled).toBe(true)
  })
})

import { defineComponent, h } from 'vue'

import { mount } from '../../src'

test('mounting options - passes props', () => {
  const Component = defineComponent({
    props: {
      message: {
        type: String,
        required: true
      }
    },

    render() {
      return h('div', {}, `Message is ${this.message}`)
    }
  })

  const wrapper = mount(Component, {
    props: {
      message: 'Hello'
    }
  })
  expect(wrapper.text()).toBe('Message is Hello')
})
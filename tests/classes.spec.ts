import { defineComponent, h } from 'vue'

import { mount } from '../src'

test('classes', () => {
  const Component = defineComponent({
    render() {
      return h('div', {}, [h('span', { class: 'my-class-name' })])
    }
  })

  const wrapper = mount(Component)

  expect(wrapper.find('.my-class-name').classes()).toContain('my-class-name')
})
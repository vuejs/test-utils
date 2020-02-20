import { defineComponent, h } from 'vue'

import { mount } from '../src'

test('html, text', () => {
  const Component = defineComponent({
    render() {
      return h('div', {}, 'Text content')
    }
  })

  const wrapper = mount(Component)

  expect(wrapper.html()).toBe('<div>Text content</div>')
  expect(wrapper.text()).toBe('Text content')
})
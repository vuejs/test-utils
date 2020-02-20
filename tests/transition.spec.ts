import { defineComponent, Transition, h } from 'vue'

import { mount } from '../src'

test('transition', async () => {
  const WithTransition = defineComponent({
    render() {
      return h(Transition, () => h('div', 'Content'))
    }
  })
  const wrapper = mount(WithTransition)
  expect(wrapper.find('#message').exists()).toBe(false)

  await wrapper.find('button').trigger('click')
  expect(wrapper.find('#message')).toBeTruthy()
})
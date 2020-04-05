import { defineComponent, Transition, h } from 'vue'

import { WithTransition } from '../components/WithTransition'
import { mount } from '../../src'

test('works with transitions', async () => {
  const wrapper = mount(WithTransition)
  expect(wrapper.find('#message').exists()).toBe(false)

  await wrapper.find('button').trigger('click')
  expect(wrapper.find('#message')).toBeTruthy()
})

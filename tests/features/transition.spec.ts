import { describe, expect, test } from 'vitest'
import { WithTransition } from '../components/WithTransition'
import { mount } from '../../src'

describe('transitions', () => {
  test('work', async () => {
    const wrapper = mount(WithTransition)
    expect(wrapper.find('#message').exists()).toBe(false)

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('#message').exists()).toBe(true)
  })

  test('have props', () => {
    const wrapper = mount(WithTransition)
    expect(wrapper.getComponent({ name: 'transition' }).props('name')).toBe(
      'fade'
    )
  })
})

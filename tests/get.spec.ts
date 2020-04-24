import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('get', () => {
  test('returns the element if it exists', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [h('span', { id: 'my-span' })])
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.get('#my-span')).not.toBeNull()
  })

  test('throws if it does not exist', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [h('span', { id: 'my-span' })])
      }
    })

    const wrapper = mount(Component)
    expect(() => wrapper.get('#other-span')).toThrowError(
      'Unable to get #other-span within: <div><span id="my-span"></span></div>'
    )
  })
})

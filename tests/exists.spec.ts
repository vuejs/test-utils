import { h, defineComponent } from 'vue'

import { mount } from '../src'

describe('exists', () => {
  it('returns false when element does not exist', () => {
    const Component = defineComponent({
      render() {
        return h('div', [h('div', { id: 'msg' })])
      }
    })
    const wrapper = mount(Component)
    expect(wrapper.find('#not-msg').exists()).toBe(false)
  })

  it('returns true when element does exist', () => {
    const Component = defineComponent({
      render() {
        return h('div', [h('div', { id: 'msg' })])
      }
    })
    const wrapper = mount(Component)
    expect(wrapper.find('#msg').exists()).toBe(true)
  })
})

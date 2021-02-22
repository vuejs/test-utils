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

  it('returns false when wrapper is destroyed', () => {
    const compiled = defineComponent({ template: '<div />' })
    const wrapper = mount(compiled)

    expect(wrapper.exists()).toEqual(true)

    wrapper.unmount()

    expect(wrapper.exists()).toEqual(false)
  })

  it('returns false when node is destroyed', () => {
    const compiled = defineComponent({ template: '<div />' })
    const wrapper = mount(compiled)

    wrapper.unmount()

    expect(wrapper.find('div').exists()).toEqual(false)
  })
})

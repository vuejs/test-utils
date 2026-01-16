import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { DOMWrapper, mount } from '../src'

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

  it('returns false when component destroyed', async () => {
    const ChildComponent = defineComponent({
      render() {
        return h('div')
      }
    })
    const Component = defineComponent({
      props: {
        hide: {
          type: Boolean,
          default: false
        }
      },
      render() {
        if (this.hide) {
          return h('div')
        } else {
          return h(ChildComponent)
        }
      }
    })
    const wrapper = mount(Component)
    const child = wrapper.findComponent(ChildComponent)
    await wrapper.setProps({ hide: true })
    expect(child.exists()).toBe(false)
  })

  it('returns false when wrapper is manually constructed against nullish element', () => {
    const wrapper = new DOMWrapper(null)
    expect(wrapper.exists()).toBe(false)
  })
})

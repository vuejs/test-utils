import { defineComponent, h } from 'vue'

import { mount } from '../../src'
import WithProps from '../components/WithProps.vue'

describe('slots', () => {
  it('supports default slot', () => {
    const ItemWithSlots = defineComponent({
      name: 'ItemWithSlots',
      render() {
        return h('div', {}, this.$slots.default())
      }
    })

    const wrapper = mount(ItemWithSlots, {
      slots: {
        default: h('span', {}, 'Default Slot')
      }
    })

    expect(wrapper.html()).toBe('<div><span>Default Slot</span></div>')
  })

  it('supports named slots', () => {
    const ItemWithNamedSlot = defineComponent({
      render() {
        return h('div', {}, this.$slots.foo())
      }
    })

    const wrapper = mount(ItemWithNamedSlot, {
      slots: {
        foo: h('span', {}, 'Foo')
      }
    })

    expect(wrapper.html()).toBe('<div><span>Foo</span></div>')
  })

  it('supports default and named slots together', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [
          h('div', {}, this.$slots.foo()),
          h('div', {}, this.$slots.default())
        ])
      }
    })

    const wrapper = mount(Component, {
      slots: {
        default: 'Default',
        foo: h('h1', {}, 'Named Slot')
      }
    })

    expect(wrapper.html()).toBe(
      '<div><div><h1>Named Slot</h1></div><div>Default</div></div>'
    )
  })

  it('supports passing a SFC', () => {
    const wrapper = mount(
      {
        template: `<div><slot name="foo" msg="Hello" /></div>`
      },
      {
        slots: {
          foo: WithProps
        }
      }
    )

    expect(wrapper.html()).toBe('<div><p>Hello</p></div>')
  })
})

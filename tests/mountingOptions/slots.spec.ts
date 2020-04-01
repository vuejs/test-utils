import { defineComponent, h } from 'vue'

import { mount } from '../../src'

test('slots - default', () => {
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

test('slots - named', () => {
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

test('slots - default and named', () => {
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

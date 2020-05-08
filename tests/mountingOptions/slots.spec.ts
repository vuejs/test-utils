import { defineComponent, h } from 'vue'

import { mount } from '../../src'
import WithProps from '../components/WithProps.vue'
import ComponentWithSlots from '../components/ComponentWithSlots.vue'

describe('slots', () => {
  describe('normal slots', () => {
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
            // h('div', {}, this.$slots.foo()),
            h('div', {}, this.$slots.default())
          ])
        }
      })

      const wrapper = mount(Component, {
        slots: {
          default: 'Default'
          // foo: h('h1', {}, 'Named Slot')
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
  describe('scoped slots', () => {
    it('allows providing a plain text string', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: 'Just a plain string'
        }
      })
      expect(wrapper.find('.scoped').text()).toEqual('Just a plain string')
    })

    it('allows passing a function that returns a render function', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: (params) => h('div', {}, 'foo')
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain string')
    })

    it('allows passing a scoped slot with params', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<template #scoped="params"><div>Just a plain {{ params.string }}</div></template>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain string')
    })
  })
})

import { h } from 'vue'

import { mount } from '../../src'
import Hello from '../components/Hello.vue'
import ComponentWithSlots from '../components/ComponentWithSlots.vue'

describe('slots', () => {
  describe('normal slots', () => {
    it('supports providing a plain string text in slot', () => {
      const defaultString = 'Rendered in Default'
      let namedString = 'Rendered in Named'
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          default: defaultString,
          named: namedString
        }
      })
      expect(wrapper.vm.$slots.default()[0].children).toBe(defaultString)
      expect(wrapper.find('.default').text()).toBe(defaultString)
      expect(wrapper.find('.named').text()).toBe(namedString)
    })

    it('supports providing an html string into a slot', () => {
      const defaultSlot = '<div><p class="defaultNested">Content</p></div>'
      const namedSlot = '<div><p class="namedNested">Content</p></div>'

      const wrapper = mount(ComponentWithSlots, {
        slots: {
          default: defaultSlot,
          named: namedSlot
        }
      })

      expect(wrapper.find('.defaultNested').exists()).toBe(true)
      expect(wrapper.find('.namedNested').exists()).toBe(true)
    })

    it('supports providing a render function to slot', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          default: h('span', {}, 'Default'),
          named: h('span', {}, 'Named')
        }
      })

      expect(wrapper.find('.default').html()).toEqual(
        '<div class="default"><span>Default</span></div>'
      )
      expect(wrapper.find('.named').html()).toEqual(
        '<div class="named"><span>Named</span></div>'
      )
    })

    it('does not render slots that do not exist', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          notExisting: () => h('span', {}, 'NotExistingText')
        }
      })

      expect(wrapper.text()).not.toContain('NotExistingText')
    })

    it('supports passing a SFC', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          named: Hello
        }
      })

      expect(wrapper.find('.named').html()).toBe(
        '' +
          '<div class="named">' +
          '<div id="root">' +
          '<div id="msg"></div>' +
          '</div>' +
          '</div>'
      )
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
          scoped: (params) => h('div', {}, JSON.stringify(params))
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual(
        '{"boolean":true,"string":"string","object":{"foo":"foo"}}'
      )
    })

    it('allows passing a function to store variables for assertion', () => {
      let assertParams

      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: (params) => {
            assertParams = params
            // always return something
            return 'foo'
          }
        }
      })

      expect(assertParams).toEqual({
        boolean: true,
        string: 'string',
        object: { foo: 'foo' }
      })
    })

    it('allows passing a scoped slot via string with no destructuring using the # syntax', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<template #scoped="params"><div>Just a plain {{ params.boolean }} {{ params.string }}</div></template>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via a string with destructuring using the # syntax', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<template #scoped="{string, boolean}"><div>Just a plain {{ boolean }} {{ string }}</div></template>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via string with no destructuring using the v-slot syntax ', () => {
      // Note: there is intentionally a carriage return after the first ` in the scoped key.
      // https://github.com/vuejs/vue-test-utils-next/issues/202
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `
            <template v-slot:scoped="params"><div>Just a plain {{ params.boolean }} {{ params.string }}</div></template>
          `
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via string with no destructuring without template tag', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<div>Just a plain {{ params.boolean }} {{ params.string }}</div>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })
  })
})

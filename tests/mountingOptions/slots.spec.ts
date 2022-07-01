import { defineComponent, h } from 'vue'

import { flushPromises, mount } from '../../src'
import Hello from '../components/Hello.vue'
import WithProps from '../components/WithProps.vue'
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

    it('supports providing html string with tags valid only nested in some other tag', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          insideTable: '<col><col><col>'
        }
      })

      expect(wrapper.findAll('.insideTable col')).toHaveLength(3)
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

    it('supports providing an object with template to slot', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          default: { template: '<span>Default</span>' },
          named: { template: '<span>Named</span>' }
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
        [
          '<div class="named">',
          '  <div id="root">',
          '    <div id="msg">Hello world</div>',
          '  </div>',
          '</div>'
        ].join('\n')
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
        '{"aBoolean":true,"aString":"string","anObject":{"foo":"foo"}}'
      )
    })

    it('allows passing a function to store variables for assertion', () => {
      let assertParams

      mount(ComponentWithSlots, {
        slots: {
          scoped: (params) => {
            assertParams = params
            // always return something
            return 'foo'
          }
        }
      })

      expect(assertParams).toEqual({
        aBoolean: true,
        aString: 'string',
        anObject: { foo: 'foo' }
      })
    })

    it('allows passing a scoped slot via string with no destructuring using the # syntax', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<template #scoped="params"><div>Just a plain {{ params.aBoolean }} {{ params.aString }}</div></template>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via a string with destructuring using the # syntax', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<template #scoped="{aString, aBoolean}"><div>Just a plain {{ aBoolean }} {{ aString }}</div></template>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via string with no destructuring using the v-slot syntax ', () => {
      // Note: there is intentionally a carriage return after the first ` in the scoped key.
      // https://github.com/vuejs/test-utils/issues/202
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `
            <template v-slot:scoped="params"><div>Just a plain {{ params.aBoolean }} {{ params.aString }}</div></template>
          `
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via string with no destructuring without template tag', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: `<div>Just a plain {{ params.aBoolean }} {{ params.aString }}</div>`
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })

    it('allows passing a scoped slot via string with no HTML inside without template tag', () => {
      const wrapper = mount(ComponentWithSlots, {
        slots: {
          scoped: 'Just a plain {{ params.aBoolean }} {{ params.aString }}'
        }
      })

      expect(wrapper.find('.scoped').text()).toEqual('Just a plain true string')
    })
  })

  it('supports an array of components', () => {
    const DivWithDefaultSlot = {
      template: `<div><slot /></div>`
    }

    const wrapper = mount(DivWithDefaultSlot, {
      slots: {
        default: [
          'plain string slot',
          '<p class="foo">foo</p>',
          Hello,
          h('span', {}, 'Default'),
          h(WithProps, { msg: 'props-msg' })
        ]
      }
    })

    expect(wrapper.find('#msg').exists()).toBe(true)
    expect(wrapper.text().includes('plain string slot')).toBe(true)
    expect(wrapper.find('.foo').exists()).toBe(true)
    expect(wrapper.find('span').text()).toBe('Default')
    expect(wrapper.find('#with-props').text()).toBe('props-msg')
  })

  it('triggers child component lifecycles', async () => {
    const parentMounted = vi.fn()
    const childMounted = vi.fn()

    const Parent = defineComponent({
      mounted() {
        parentMounted()
      },
      render() {
        return h(this.$slots.default!)
      }
    })

    const Child = defineComponent({
      render() {
        return h('span')
      },
      mounted() {
        childMounted()
      }
    })

    mount(Parent, {
      global: {
        components: { Child }
      },
      slots: {
        default: Child
      }
    })

    await flushPromises()

    expect(parentMounted).toHaveBeenCalled()
    expect(childMounted).toHaveBeenCalled()
  })

  it('should return the correct number of vnodes in the slots', () => {
    const wrapper = mount(ComponentWithSlots, {
      slots: {
        default: '<div/><div/>'
      }
    })

    // @ts-expect-error
    expect(wrapper.vm.$slots.default()).toHaveLength(2)
  })
})

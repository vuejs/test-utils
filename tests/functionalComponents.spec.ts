import { beforeEach, describe, expect, it } from 'vitest'
import { DOMWrapper, mount, VueWrapper } from '../src'
import { h, Slots } from 'vue'
import Hello from './components/Hello.vue'

describe('functionalComponents', () => {
  describe('when mounting functional component', () => {
    it('mounts without an error', () => {
      const Foo = (props: { msg: string }) =>
        h('div', { class: 'foo' }, props.msg)

      const wrapper = mount(Foo, {
        props: {
          msg: 'foo'
        }
      })

      expect(wrapper.html()).toEqual('<div class="foo">foo</div>')
    })

    it('renders the slots of a functional component', () => {
      const Foo = (props: Record<string, any>, { slots }: { slots: Slots }) =>
        h('div', { class: 'foo' }, slots)

      const wrapper = mount(Foo, {
        slots: {
          default: 'just text'
        }
      })

      expect(wrapper.html()).toEqual('<div class="foo">just text</div>')
    })

    it('asserts classes', () => {
      const Foo = () => h('div', { class: 'foo' })

      const wrapper = mount(Foo, {
        attrs: {
          class: 'extra_classes'
        }
      })

      expect(wrapper.classes()).toContain('extra_classes')
      expect(wrapper.classes()).toContain('foo')
    })

    it('uses `find`', () => {
      const Foo = () => h('div', { class: 'foo' }, h(Hello))
      const wrapper = mount(Foo)

      expect(wrapper.find('#root').exists()).toBe(true)
    })

    it('uses `findComponent`', () => {
      const Foo = () => h('div', { class: 'foo' }, h(Hello))
      const wrapper = mount(Foo)

      expect(wrapper.findComponent(Hello).exists()).toBe(true)
    })
  })

  describe('when retrieving functional component via findComponent', () => {
    const FunctionalChild = () => h('div', { class: 'foo' }, 'hello')
    const RootComponent = {
      render() {
        return h(FunctionalChild)
      }
    }

    let wrapper: VueWrapper<any>
    beforeEach(() => {
      wrapper = mount(RootComponent)
    })

    it('returns DOMWrapper', () => {
      expect(wrapper.findComponent(FunctionalChild)).toBeInstanceOf(DOMWrapper)
    })
  })
})

import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('classes', () => {
  describe('DOMWrapper', () => {
    it('returns array of class names if wrapper has class names', () => {
      const Component = defineComponent({
        render() {
          return h('div', {}, [h('span', { class: 'class-a' })])
        }
      })

      const wrapper = mount(Component)

      expect(wrapper.find('.class-a').classes()).toContain('class-a')
    })

    it('returns true if the component has the class', () => {
      const Component = defineComponent({
        render() {
          return h('div', {}, [h('span', { class: 'class-a' })])
        }
      })

      const wrapper = mount(Component).find('span')

      expect(wrapper.classes('class-a')).toBe(true)
      expect(wrapper.classes('class-b')).toBe(false)
    })
  })

  describe('VueWrapper', () => {
    it('returns array of class names if wrapper has class names', () => {
      const Component = defineComponent({
        render() {
          return h('div', { class: 'class-a' }, 'some text')
        }
      })

      const wrapper = mount(Component)

      expect(wrapper.classes()).toContain('class-a')
    })

    it('returns true if the component has the class', () => {
      const Component = defineComponent({
        render() {
          return h('div', { class: 'class-a' }, 'some text')
        }
      })

      const wrapper = mount(Component)

      expect(wrapper.classes('class-a')).toBe(true)
      expect(wrapper.classes('class-b')).toBe(false)
    })

    it('throws an error if called on an empty wrapper', () => {
      const Component = defineComponent({
        render() {
          return h('div', { class: 'class-a' }, 'some text')
        }
      })

      const wrapper = mount(Component)
      try {
        wrapper.find('.class-c').classes()
      } catch (error) {
        expect(error).toThrow(
          'Cannot call classes on an empty DOMWrapper.'
        )
      }
    })
  })
})

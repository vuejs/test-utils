import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('classes', () => {
  describe('DOMWrapper', () => {
    let wrapper
    beforeEach(() => {
      const Component = defineComponent({
        render() {
          return h('div', {}, [h('span', { class: 'class-a' })])
        }
      })

      wrapper = mount(Component)
    })
    it('returns array of class names if wrapper has class names', () => {
      expect(wrapper.find('.class-a').classes()).toContain('class-a')
    })

    it('returns true if the component has the class', () => {
      expect(wrapper.find('span').classes('class-a')).toBe(true)
      expect(wrapper.find('span').classes('class-b')).toBe(false)
    })
  })

  describe('VueWrapper', () => {
    let wrapper
    beforeEach(() => {
      const Component = defineComponent({
        render() {
          return h('div', { class: 'class-a' }, 'some text')
        }
      })

      wrapper = mount(Component)
    })

    it('returns array of class names if wrapper has class names', () => {
      expect(wrapper.classes()).toContain('class-a')
    })

    it('returns true if the component has the class', () => {
      expect(wrapper.classes('class-a')).toBe(true)
      expect(wrapper.classes('class-b')).toBe(false)
    })
  })
})

import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('styles', () => {
  describe('DOMWrapper', () => {
    it('returns style objects', () => {
      const Component = defineComponent({
        render() {
          return h('div', {}, [h('span', { style: { color: 'red' } })])
        }
      })

      const wrapper = mount(Component)
      expect(wrapper.find('span').styles()).toHaveProperty('backgroundColor')
      expect(wrapper.find('span').styles()).toHaveProperty('color')
      expect(wrapper.find('span').styles()).not.toHaveProperty('colour')
    })

    it('returns specific style when key is present', () => {
      const Component = defineComponent({
        render() {
          return h('div', {}, [h('span', { style: { color: 'red' } })])
        }
      })

      const wrapper = mount(Component)

      expect(wrapper.find('span').styles('color')).toBe('red')
    })
  })

  describe('VueWrapper', () => {
    it('returns style objects', () => {
      const Component = defineComponent({
        render() {
          return h('div', { style: { color: 'red' } })
        }
      })

      const wrapper = mount(Component)

      expect(wrapper.styles()).toHaveProperty('backgroundColor')
      expect(wrapper.styles()).toHaveProperty('color')
      expect(wrapper.styles()).not.toHaveProperty('colour')
    })

    it('returns specific style when key is present', () => {
      const Component = defineComponent({
        render() {
          return h('div', { style: { color: 'red' } })
        }
      })

      const wrapper = mount(Component)

      expect(wrapper.styles('color')).toBe('red')
    })
  })
})

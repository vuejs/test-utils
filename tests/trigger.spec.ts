import { defineComponent, h, ref } from 'vue'

import { mount } from '../src'

describe('trigger', () => {

  describe('on click', () => {
    it('works on the root element', async () => {
      const Component = defineComponent({
        setup() {
          return {
            count: ref(0)
          }
        },
  
        render() {
          return h('div', { onClick: () => this.count++ }, `Count: ${this.count}`)
        }
      })
  
      const wrapper = mount(Component)
      await wrapper.trigger('click')
  
      expect(wrapper.text()).toBe('Count: 1')
    })
  
    it('works on a nested element', async () => {
      const Component = defineComponent({
        setup() {
          return {
            count: ref(0)
          }
        },
  
        render() {
          return h('div', {}, [
            h('p', {}, `Count: ${this.count}`),
            h('button', { onClick: () => this.count++ })
          ])
        }
      })
  
      const wrapper = mount(Component)
      await wrapper.find('button').trigger('click')
  
      expect(wrapper.find('p').text()).toBe('Count: 1')
    })

    it('causes DOM to update after a click handler method that changes components data is called', async () => {
      const Component = defineComponent({
        setup() {
          return {
            isActive: ref(false)
          }
        },

        render() {
          return h('div', { 
            onClick: () => this.isActive = !this.isActive,
            class: { active: this.isActive } 
          })
        }
      })
      const wrapper = mount(Component, {})
      
      expect(wrapper.classes()).not.toContain('active')
      await wrapper.trigger('click')
      expect(wrapper.classes()).toContain('active')
    })
  })

  describe('on keydown', () => {
    it('causes keydown handler to fire when "keydown" is triggered', async () => {
      const keydownHandler = jest.fn()
      const Component = {
        template: '<input @keydown="keydownHandler" />',
        methods: {
          keydownHandler
        },
      }
      const wrapper = mount(Component, {})
      await wrapper.trigger('keydown')

      expect(keydownHandler).toHaveBeenCalledTimes(1)
    })
    
    it('causes keydown handler to fire when "keydown.enter" is triggered', async () => {
      const keydownHandler = jest.fn()
      const Component = {
        template: '<input @keydown.enter="keydownHandler" />',
        methods: {
          keydownHandler
        },
      }
      const wrapper = mount(Component, {})
      await wrapper.trigger('keydown', { key: 'Enter' })

      expect(keydownHandler).toHaveBeenCalledTimes(1)
    })

    it('causes keydown handler to fire with the appropiate keyCode when wrapper.trigger("keydown", { keyCode: 65 }) is fired', async () => {
      const keydownHandler = jest.fn()
      const Component = {
        template: '<input @keydown="keydownHandler" />',
        methods: {
          keydownHandler
        },
      }
      const wrapper = mount(Component, {})
      await wrapper.trigger('keydown', { keyCode: 65 })

      expect(keydownHandler).toHaveBeenCalledTimes(1)
      expect(keydownHandler.mock.calls[0][0]['keyCode']).toBe(65)
    })

    it('causes keydown handler to fire converting keyName in an apropiate keyCode when wrapper.trigger("keydown.${keyName}") is fired', async () => {
      let keydownHandler = jest.fn()

      const keyCodesByKeyName = {
        backspace: 8,
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        insert: 45,
        delete: 46
      }

      const Component = {
        template: '<input @keydown="keydownHandler" />',
        methods: {
          keydownHandler
        },
      }
      const wrapper = mount(Component, {})

      for (const keyName in keyCodesByKeyName) {
        const keyCode = keyCodesByKeyName[keyName]
        wrapper.trigger(`keydown.${keyName}`)

        const calls = keydownHandler.mock.calls
        expect(calls[calls.length-1][0].keyCode).toEqual(keyCode)
      }
    })
  })
})
 
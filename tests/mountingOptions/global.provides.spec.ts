import { h, inject } from 'vue'

import { mount } from '../../src'

describe('mounting options: provides', () => {
  it('provides a value via `provide`', () => {
    const GreetingSymbol = Symbol()
    const Component = {
      setup() {
        const greeting = inject<string>(GreetingSymbol)
        return () => h('div', greeting)
      }
    }

    const wrapper = mount(Component, {
      global: {
        provide: {
          [GreetingSymbol]: 'Provided value'
        }
      }
    })

    expect(wrapper.text()).toBe('Provided value')
  })
})

import { h } from 'vue'

import { mount } from '../../src'

describe('mounting options: mixins', () => {
  it('installs a mixin via `mixins`', () => {
    const createdHook = jest.fn()
    const mixin = {
      created() {
        createdHook()
      }
    }
    const Component = {
      render() { return h('div') }
    }

    mount(Component, {
      mixins: [mixin]
    })

    expect(createdHook).toHaveBeenCalled()
  })
})
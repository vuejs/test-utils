import { h } from 'vue'

import { mount } from '../../src'

describe('mounting options: plugins', () => {
  it('installs a plugin via `plugins`', () => {
    const installed = jest.fn()

    class Plugin {
      static install() {
        installed()
      }
    }

    const Component = {
      render() {
        return h('div')
      }
    }
    mount(Component, {
      global: {
        plugins: [Plugin]
      }
    })

    expect(installed).toHaveBeenCalled()
  })
})

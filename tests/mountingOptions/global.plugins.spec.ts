import { h, App } from 'vue'

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
        plugins: [{ plugin: Plugin }]
      }
    })

    expect(installed).toHaveBeenCalled()
  })

  it('installs a plugin with options `plugins`', () => {
    const installed = jest.fn()

    class Plugin {
      static install(_app: App, options: { option1: boolean }) {
        installed(options)
      }
    }

    const Component = {
      render() {
        return h('div')
      }
    }
    const options = { option1: true }
    mount(Component, {
      global: {
        plugins: [{ plugin: Plugin, options }]
      }
    })

    expect(installed).toHaveBeenCalledWith(options)
  })
})

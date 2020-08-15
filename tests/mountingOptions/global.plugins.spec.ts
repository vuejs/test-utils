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
        plugins: [Plugin]
      }
    })

    expect(installed).toHaveBeenCalled()
  })

  it('installs a plugin with options `plugins`', () => {
    const installed = jest.fn()

    class Plugin {
      static install(_app: App, ...options) {
        installed(...options)
      }
    }

    const Component = {
      render() {
        return h('div')
      }
    }
    const options = { option1: true }
    const testString = 'hello'
    mount(Component, {
      global: {
        plugins: [[Plugin, options, testString]]
      }
    })

    expect(installed).toHaveBeenCalledWith(options, testString)
  })
})

test('installs plugins with and without options', () => {
  const installed = jest.fn()
  class Plugin {
    static install() {
      installed()
    }
  }

  const installedWithOptions = jest.fn()
  class PluginWithOptions {
    static install(_app: App, ...args) {
      installedWithOptions(...args)
    }
  }

  const Component = {
    render() {
      return h('div')
    }
  }
  mount(Component, {
    global: {
      plugins: [Plugin, [PluginWithOptions, 'argument 1', 'another argument']]
    }
  })

  expect(installed).toHaveBeenCalled()
  expect(installedWithOptions).toHaveBeenCalledWith(
    'argument 1',
    'another argument'
  )
})

import { describe, expect, test, it, vi } from 'vitest'
import { h, App } from 'vue'

import { mount } from '../../src'
import ScriptSetup from '../components/ScriptSetup.vue'
import Option from '../components/OptionComponent.vue'
import OptionsSetup from '../components/OptionSetupComponent.vue'
import OptionsSetupWithoutReturn from '../components/OptionSetupWithoutReturnComponent.vue'

describe('mounting options: plugins', () => {
  it('installs a plugin via `plugins`', () => {
    const installed = vi.fn()

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
    const installed = vi.fn()

    class Plugin {
      static install(_app: App, ...options: any[]) {
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

  describe('provides access to a global property', () => {
    class Plugin {
      static install(app: App) {
        app.config.globalProperties.foo = 'bar'
      }
    }
    it('provides access to a global property from a Composition API component', () => {
      const wrapper = mount(ScriptSetup, {
        global: { plugins: [Plugin] }
      })
      expect((wrapper.vm as any).foo).toBeDefined()
    })

    it('provides access to a global property from an Options API component', () => {
      const wrapper = mount(Option, {
        global: { plugins: [Plugin] }
      })
      expect((wrapper.vm as any).foo).toBeDefined()
    })

    it('provides access to a global property from an Options API component with a setup() function', () => {
      const wrapper = mount(OptionsSetup, {
        global: { plugins: [Plugin] }
      })
      expect((wrapper.vm as any).foo).toBeDefined()
    })

    it('provides access to a global property from an Options API component with a setup() function that does not return', () => {
      const wrapper = mount(OptionsSetupWithoutReturn, {
        global: { plugins: [Plugin] }
      })
      expect((wrapper.vm as any).foo).toBeDefined()
    })
  })
})

test('installs plugins with and without options', () => {
  const installed = vi.fn()
  class Plugin {
    static install() {
      installed()
    }
  }

  const installedWithOptions = vi.fn()
  class PluginWithOptions {
    static install(_app: App, ...args: any[]) {
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

import { GlobalMountOptions } from './types'
import { VueWrapper } from './vueWrapper'
import { ComponentPublicInstance } from 'vue'

interface GlobalConfigOptions {
  global: GlobalMountOptions
  plugins: {
    VueWrapper: Pluggable
    DOMWrapper: Pluggable
  }
  renderStubDefaultSlot: boolean
}

interface Plugin {
  handler: (
    instance: VueWrapper<ComponentPublicInstance>
  ) => Record<string, any>
  options: Record<string, any>
}

class Pluggable {
  installedPlugins = [] as Array<Plugin>

  install(
    handler: (
      instance: VueWrapper<ComponentPublicInstance>
    ) => Record<string, any>,
    options: Record<string, any> = {}
  ) {
    if (typeof handler !== 'function') {
      console.error('plugin.install must receive a function')
      handler = () => ({})
    }
    this.installedPlugins.push({ handler, options })
  }

  extend(instance: VueWrapper<ComponentPublicInstance>) {
    const invokeSetup = (plugin: Plugin) => plugin.handler(instance) // invoke the setup method passed to install
    const bindProperty = ([property, value]: [string, any]) => {
      ;(instance as any)[property] =
        typeof value === 'function' ? value.bind(instance) : value
    }
    const addAllPropertiesFromSetup = (setupResult: Record<string, any>) => {
      setupResult = typeof setupResult === 'object' ? setupResult : {}
      Object.entries(setupResult).forEach(bindProperty)
    }

    this.installedPlugins.map(invokeSetup).forEach(addAllPropertiesFromSetup)
  }

  /** For testing */
  reset() {
    this.installedPlugins = []
  }
}

export const config: GlobalConfigOptions = {
  global: {},
  plugins: {
    VueWrapper: new Pluggable(),
    DOMWrapper: new Pluggable()
  },
  renderStubDefaultSlot: false
}

import { ComponentPublicInstance } from 'vue'
import { GlobalMountOptions } from './types'
import { VueWrapper } from './vueWrapper'
import { DOMWrapper } from './domWrapper'

interface GlobalConfigOptions {
  global: GlobalMountOptions
  plugins: {
    VueWrapper: Pluggable<VueWrapper<ComponentPublicInstance>>
    DOMWrapper: Pluggable<DOMWrapper<Element>>
  }
  renderStubDefaultSlot: boolean
}

interface Plugin<Instance> {
  handler: (instance: Instance) => Record<string, any>
  options: Record<string, any>
}

class Pluggable<Instance = DOMWrapper<Element>> {
  installedPlugins: Plugin<Instance>[] = []

  install(
    handler: (instance: Instance) => Record<string, any>,
    options: Record<string, any> = {}
  ) {
    if (typeof handler !== 'function') {
      console.error('plugin.install must receive a function')
      handler = () => ({})
    }
    this.installedPlugins.push({ handler, options })
  }

  extend(instance: Instance) {
    const invokeSetup = (plugin: Plugin<Instance>) => plugin.handler(instance) // invoke the setup method passed to install
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
  global: {
    stubs: {
      transition: true,
      'transition-group': true
    }
  },
  plugins: {
    VueWrapper: new Pluggable(),
    DOMWrapper: new Pluggable()
  },
  renderStubDefaultSlot: false
}

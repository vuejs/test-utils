import { ComponentPublicInstance } from 'vue'
import { GlobalMountOptions } from './types'
import { VueWrapper } from './vueWrapper'
import { DOMWrapper } from './domWrapper'
import { allowedNodeEnvironmentFlags } from 'process'

interface GlobalConfigOptions {
  global: Required<GlobalMountOptions>
  plugins: {
    VueWrapper: Pluggable<VueWrapper<ComponentPublicInstance>>
    DOMWrapper: Pluggable<DOMWrapper<Element>>
  }
  renderStubDefaultSlot: boolean
}

interface Plugin<Instance> {
  handler: (
    instance: Instance,
    options: Record<string, any>
  ) => Record<string, any>
  options: Record<string, any>
}

class Pluggable<Instance = DOMWrapper<Element>> {
  installedPlugins: Plugin<Instance>[] = []

  install(
    handler: (
      instance: Instance,
      options?: Record<string, any>
    ) => Record<string, any>,
    options: Record<string, any> = {}
  ) {
    if (typeof handler !== 'function') {
      console.error('plugin.install must receive a function')
      handler = () => ({})
    }
    this.installedPlugins.push({ handler, options })
  }

  extend(instance: Instance) {
    const invokeSetup = ({ handler, options }: Plugin<Instance>) => {
      return handler(instance, options) // invoke the setup method passed to install
    }
    const bindProperty = ([property, value]: [string, any]) => {
      ;(instance as any)[property] =
        typeof value === 'function' ? value.bind(instance) : value
    }
    const addAllPropertiesFromSetup = (setupResult: Record<string, any>) => {
      setupResult = typeof setupResult === 'object' ? setupResult : {}
      Object.entries(setupResult).forEach(bindProperty)
    }

    // this.installedPlugins.map(invokeSetup).forEach(addAllPropertiesFromSetup)
    this.installedPlugins
      .map((plugin) => {
        return invokeSetup({ handler: plugin.handler, options: plugin.options })
      })
      .forEach(addAllPropertiesFromSetup)
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
    },
    provide: {},
    components: {},
    config: {},
    directives: {},
    mixins: [],
    mocks: {},
    plugins: [],
    renderStubDefaultSlot: false
  },
  plugins: {
    VueWrapper: new Pluggable(),
    DOMWrapper: new Pluggable()
  },
  renderStubDefaultSlot: false
}

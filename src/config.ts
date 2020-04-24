import { GlobalMountOptions } from './types'

interface GlobalConfigOptions {
  global: GlobalMountOptions
  plugins: {
    VueWrapper: Pluggable
    DOMWrapper: Pluggable
  }
}

class Pluggable {
  installedPlugins: any
  constructor() {
    this.installedPlugins = []
  }

  install(handler, options = {}) {
    if (typeof handler !== 'function') {
      console.error('plugin.install must receive a function')
      handler = () => ({})
    }
    this.installedPlugins.push({ handler, options })
  }

  extend(instance) {
    const invokeSetup = (plugin) => plugin.handler(instance) // invoke the setup method passed to install
    const bindProperty = ([property, value]: [string, any]) => {
      instance[property] =
        typeof value === 'function' ? value.bind(instance) : value
    }
    const addAllPropertiesFromSetup = (setupResult) => {
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
  }
}

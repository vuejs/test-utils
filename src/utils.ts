import { GlobalMountOptions } from './types'

const isString = (val: unknown): val is string => typeof val === 'string'

function mergeGlobalProperties(
  configGlobal: GlobalMountOptions = {},
  mountGlobal: GlobalMountOptions = {}
): GlobalMountOptions {
  const {
    mixins: configMixins = [],
    plugins: configPlugins = [],
    ...configRest
  } = configGlobal
  const {
    mixins: mountMixins = [],
    plugins: mountPlugins = [],
    ...mountRest
  } = mountGlobal
  const mixins = [...configMixins, ...mountMixins]
  const plugins = [...configPlugins, ...mountPlugins]

  const stubs: Record<string, any> = {}

  if (configRest.stubs) {
    if (Array.isArray(configRest.stubs)) {
      configRest.stubs.forEach((x) => (stubs[x] = true))
    } else {
      for (const [k, v] of Object.entries(configRest.stubs)) {
        stubs[k] = v
      }
    }
  }

  if (mountRest.stubs) {
    if (mountRest.stubs && Array.isArray(mountRest.stubs)) {
      mountRest.stubs.forEach((x) => (stubs[x] = true))
    } else {
      for (const [k, v] of Object.entries(mountRest.stubs)) {
        stubs[k] = v
      }
    }
  }

  return {
    mixins,
    plugins,
    stubs,
    components: { ...configRest.components, ...mountRest.components },
    provide: { ...configRest.provide, ...mountRest.provide },
    mocks: { ...configRest.mocks, ...mountRest.mocks },
    config: { ...configRest.config, ...mountRest.config },
    directives: { ...configRest.directives, ...mountRest.directives }
    // stubs: { configRest.stubs, ...mountRest.stubs }
  }
}

export { isString, mergeGlobalProperties }

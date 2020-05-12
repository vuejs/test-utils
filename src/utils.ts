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

  return {
    mixins,
    plugins,
    components: { ...configRest.components, ...mountRest.components },
    provide: { ...configRest.provide, ...mountRest.provide },
    mocks: { ...configRest.mocks, ...mountRest.mocks },
    config: { ...configRest.config, ...mountRest.config },
    directives: { ...configRest.directives, ...mountRest.directives },
    stubs: { ...configRest.stubs, ...mountRest.stubs }
  }
}

export { isString, mergeGlobalProperties }

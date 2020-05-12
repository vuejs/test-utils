import { GlobalMountOptions } from './types'

const isString = (val: unknown): val is string => typeof val === 'string'

function mergeGlobalProperties(
  configGlobal: GlobalMountOptions = {},
  mountGlobal: GlobalMountOptions = {}
): GlobalMountOptions {
  const stubs: Record<string, any> = {}
  if (configGlobal.stubs) {
    if (Array.isArray(configGlobal.stubs)) {
      configGlobal.stubs.forEach((x) => (stubs[x] = true))
    } else {
      for (const [k, v] of Object.entries(configGlobal.stubs)) {
        stubs[k] = v
      }
    }
  }

  if (mountGlobal.stubs) {
    if (mountGlobal.stubs && Array.isArray(mountGlobal.stubs)) {
      mountGlobal.stubs.forEach((x) => (stubs[x] = true))
    } else {
      for (const [k, v] of Object.entries(mountGlobal.stubs)) {
        stubs[k] = v
      }
    }
  }

  return {
    mixins: [...(configGlobal.mixins || []), ...(mountGlobal.mixins || [])],
    plugins: [...(configGlobal.plugins || []), ...(mountGlobal.plugins || [])],
    stubs,
    components: { ...configGlobal.components, ...mountGlobal.components },
    provide: { ...configGlobal.provide, ...mountGlobal.provide },
    mocks: { ...configGlobal.mocks, ...mountGlobal.mocks },
    config: { ...configGlobal.config, ...mountGlobal.config },
    directives: { ...configGlobal.directives, ...mountGlobal.directives }
  }
}

export { isString, mergeGlobalProperties }

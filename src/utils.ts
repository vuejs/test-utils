import { GlobalMountOptions } from './types'

const isString = (val: unknown): val is string => typeof val === 'string'

function mergeStubs(target, source) {
  if (source.stubs) {
    if (Array.isArray(source.stubs)) {
      source.stubs.forEach((x) => (target[x] = true))
    } else {
      for (const [k, v] of Object.entries(source.stubs)) {
        target[k] = v
      }
    }
  }
}

function mergeGlobalProperties(
  configGlobal: GlobalMountOptions = {},
  mountGlobal: GlobalMountOptions = {}
): GlobalMountOptions {
  const stubs: Record<string, any> = {}

  mergeStubs(stubs, configGlobal)
  mergeStubs(stubs, mountGlobal)

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

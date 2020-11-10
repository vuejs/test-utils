import { GlobalMountOptions } from './types'
import { AppConfig } from 'vue'

function mergeStubs(target: Record<string, any>, source: GlobalMountOptions) {
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

export function mergeGlobalProperties(
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
    config: { ...configGlobal.config, ...mountGlobal.config } as Omit<
      AppConfig,
      'isNativeTag'
    >,
    directives: { ...configGlobal.directives, ...mountGlobal.directives }
  }
}

// https://stackoverflow.com/a/48218209
export const mergeDeep = (
  target: Record<string, any>,
  source: Record<string, any>
) => {
  const isObject = (obj: unknown): obj is Object =>
    obj && typeof obj === 'object'

  if (!isObject(target) || !isObject(source)) {
    return source
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
}

export function isClassComponent(component: any) {
  return '__vccBase' in component
}

import { GlobalMountOptions } from './types'

const isString = (val: unknown): val is string => typeof val === 'string'

// Deep merge function, adapted from from https://gist.github.com/ahtcx/0cd94e62691f539160b32ecda18af3d6
// Merge a `source` object to a `target` recursively
const merge = (target: object, source: object) => {
  // Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
  for (const key of Object.keys(source)) {
    if (!target[key]) {
      target[key] = source[key]
    } else {
      if (source[key] instanceof Object) {
        Object.assign(source[key], merge(target[key], source[key]))
      }
    }
  }

  Object.assign(target || {}, source)
}

function mergeGlobalProperties(
  configGlobal: GlobalMountOptions = {},
  mountGlobal: GlobalMountOptions = {}
): GlobalMountOptions {
  merge(configGlobal, mountGlobal)
  return configGlobal
}

export { isString, mergeGlobalProperties }

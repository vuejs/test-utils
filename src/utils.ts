import { GlobalMountOptions } from './types'

const isString = (val: unknown): val is string => typeof val === 'string'

function deepMerge(...objects: object[]) {
  const isObject = (obj: any) => obj && typeof obj === 'object'

  function deepMergeInner(target: object, source: object) {
    Object.keys(source).forEach((key: string) => {
      const targetValue = target[key]
      const sourceValue = source[key]

      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue)
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = deepMergeInner(
          Object.assign({}, targetValue),
          sourceValue
        )
      } else {
        target[key] = sourceValue
      }
    })

    return target
  }

  if (objects.length < 2) {
    throw new Error(
      'deepMerge: this function expects at least 2 objects to be provided'
    )
  }

  if (objects.some((object) => !isObject(object))) {
    throw new Error('deepMerge: all values should be of type "object"')
  }

  const target = objects.shift()
  let source: object

  while ((source = objects.shift())) {
    deepMergeInner(target, source)
  }

  return target
}

function mergeGlobalProperties(
  configGlobal: GlobalMountOptions = {},
  mountGlobal: GlobalMountOptions = {}
): GlobalMountOptions {
  return deepMerge(configGlobal, mountGlobal)
}

export { isString, mergeGlobalProperties }

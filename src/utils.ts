import { GlobalMountOptions } from './types'
import mergeWith from 'lodash/mergeWith'
import isString from 'lodash/isString'

export { isString }

export function mergeGlobalProperties(
  configGlobal: GlobalMountOptions = {},
  mountGlobal: GlobalMountOptions = {}
): GlobalMountOptions {
  return mergeWith(
    {},
    configGlobal,
    mountGlobal,
    (objValue, srcValue, key: keyof GlobalMountOptions) => {
      switch (key) {
        case 'mocks':
        case 'provide':
        case 'components':
        case 'directives':
          return { ...objValue, ...srcValue }
        case 'plugins':
        case 'mixins':
          return [...(objValue || []), ...(srcValue || [])].filter(Boolean)
      }
    }
  )
}

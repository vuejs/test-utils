import mergeWith from 'lodash/mergeWith'
import { GlobalMountOptions } from './types'

export function mergeGlobalProperties(
  configGlobal = {},
  mountGlobal = {}
): GlobalMountOptions {
  return mergeWith({}, configGlobal, mountGlobal, (objValue, srcValue, key) => {
    switch (key) {
      case 'mocks':
      case 'provide':
      case 'components':
      case 'directives':
      case 'globalProperties':
        return { ...objValue, ...srcValue }
      case 'plugins':
      case 'mixins':
        return [...(objValue || []), ...(srcValue || [])].filter(Boolean)
    }
  })
}

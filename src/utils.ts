import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'
import kebabCase from 'lodash/kebabCase'
import flow from 'lodash/flow'
import isString from 'lodash/isString'
import mergeWith from 'lodash/mergeWith'
import { GlobalMountOptions } from './types'

const pascalCase = flow(camelCase, upperFirst)

export { kebabCase, pascalCase, isString }

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

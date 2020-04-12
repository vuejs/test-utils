import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'
import kebabCase from 'lodash/kebabCase'
import flow from 'lodash/flow'
import mergeWith from 'lodash/mergeWith'

const pascalCase = flow(camelCase, upperFirst)

export { kebabCase, pascalCase }

export function mergeGlobalProperties(configGlobal = {}, mountGlobal = {}) {
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

import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'
import kebabCase from 'lodash/kebabCase'
import flow from 'lodash/flow'

const pascalCase = flow(camelCase, upperFirst)

function isString(val: unknown): val is String {
  return typeof val === 'string'
}

export { kebabCase, pascalCase, isString }

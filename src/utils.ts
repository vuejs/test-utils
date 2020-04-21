import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'
import kebabCase from 'lodash/kebabCase'
import isString from 'lodash/isString'
import flow from 'lodash/flow'

const pascalCase = flow(camelCase, upperFirst)

export { kebabCase, pascalCase, isString }

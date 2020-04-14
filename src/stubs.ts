import { transformVNodeArgs, h } from 'vue'
import kebabCase from 'lodash/kebabCase'

import { pascalCase } from './utils'

interface IStubOptions {
  name?: string
}

// TODO: figure out how to type this
type VNodeArgs = any[]

export const createStub = (options: IStubOptions) => {
  const tag = options.name ? `${options.name}-stub` : 'anonymous-stub'
  const render = () => h(tag)

  return { name: tag, render }
}

const resolveComponentStubByName = (name: string, stubs: Record<any, any>) => {
  const pascal = pascalCase(name)
  const kebab = kebabCase(name)

  for (const [key, value] of Object.entries(stubs)) {
    if (name === pascal || name === kebab) {
      return value
    }
  }
}

const isHTMLElement = (args: VNodeArgs) =>
  Array.isArray(args) && typeof args[0] === 'string'
const isCommentOrFragment = (args: VNodeArgs) => typeof args[0] === 'symbol'
const isParent = (args: VNodeArgs) =>
  typeof args[0] === 'object' && args[0]['name'] === 'VTU_COMPONENT'
const isComponent = (args: VNodeArgs) => typeof args[0] === 'object'

export function stubComponents(stubs: Record<any, any>) {
  transformVNodeArgs((args) => {
    if (isHTMLElement(args) || isCommentOrFragment(args) || isParent(args)) {
      return args
    }

    if (isComponent(args)) {
      const name = args[0]['name']
      if (!name) {
        return args
      }

      const stub = resolveComponentStubByName(name, stubs)
      // we return a stub by matching Vue's `h` function
      // where the signature is h(Component, props)

      // default stub
      if (stub === true) {
        return [createStub({ name }), {}]
      }

      // custom implementation
      if (typeof stub === 'object') {
        return [stubs[name], {}]
      }
    }

    return args
  })
}

import { transformVNodeArgs, h } from 'vue'

import { pascalCase, kebabCase } from './utils'

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

const resolveComponentStubByName = (
  componentName: string,
  stubs: Record<any, any>
) => {
  const componentPascalName = pascalCase(componentName)
  const componentKebabName = kebabCase(componentName)

  if (Array.isArray(stubs) && stubs.length) {
    // ['Foo', 'Bar'] => { Foo: true, Bar: true }
    stubs = stubs.reduce((acc, current) => {
      acc[current] = true
      return acc
    }, {})
  }

  for (const [stubKey, value] of Object.entries(stubs)) {
    if (
      stubKey === componentPascalName ||
      stubKey === componentKebabName ||
      stubKey === componentName
    ) {
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
    // args[0] can either be:
    // 1. a HTML tag (div, span...)
    // 2. An object of component options, such as { name: 'foo', render: [Function], props: {...} }
    // Depending what it is, we do different things.
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
      // case 1: default stub
      if (stub === true) {
        return [createStub({ name }), {}]
      }

      // case 2: custom implementation
      if (typeof stub === 'object') {
        return [stubs[name], {}]
      }
    }

    return args
  })
}

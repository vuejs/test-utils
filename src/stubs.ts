import { transformVNodeArgs, h } from 'vue'
import { hyphenate } from '@vue/shared'
import { config } from './index'
import { matchName } from './utils/matchName'

interface IStubOptions {
  name?: string
  props: any
}

// TODO: figure out how to type this
type VNodeArgs = any[]

function getSlots(ctx) {
  return config.renderAllStubSlots
    ? Object.entries(ctx.$slots)
        .filter(([name]) => name !== '_')
        // @ts-ignore
        .map(([name, slot]) => slot.call(ctx, {}))
    : ctx.$slots
}

export const createStub = ({ name, props }: IStubOptions) => {
  const anonName = 'anonymous-stub'
  const tag = name ? `${hyphenate(name)}-stub` : anonName

  const render = (ctx) => {
    const slots = getSlots(ctx)
    return h(tag, {}, slots)
  }

  return { name: name || anonName, render, props }
}

const resolveComponentStubByName = (
  componentName: string,
  stubs: Record<any, any>
) => {
  if (Array.isArray(stubs) && stubs.length) {
    // ['Foo', 'Bar'] => { Foo: true, Bar: true }
    stubs = stubs.reduce((acc, current) => {
      acc[current] = true
      return acc
    }, {})
  }

  for (const [stubKey, value] of Object.entries(stubs)) {
    if (matchName(componentName, stubKey)) {
      return value
    }
  }
}

const isHTMLElement = (args: VNodeArgs) => typeof args[0] === 'string'

const isCommentOrFragment = (args: VNodeArgs) => typeof args[0] === 'symbol'

const isParent = (args: VNodeArgs) =>
  isComponent(args) && args[0]['name'] === 'VTU_COMPONENT'

const isComponent = (args: VNodeArgs) => typeof args[0] === 'object'

const isFunctionalComponent = ([type]: VNodeArgs) =>
  typeof type === 'function' && ('name' in type || 'displayName' in type)

export function stubComponents(stubs: Record<any, any>) {
  transformVNodeArgs((args) => {
    // args[0] can either be:
    // 1. a HTML tag (div, span...)
    // 2. An object of component options, such as { name: 'foo', render: [Function], props: {...} }
    // Depending what it is, we do different things.
    if (isHTMLElement(args) || isCommentOrFragment(args) || isParent(args)) {
      return args
    }

    if (isComponent(args) || isFunctionalComponent(args)) {
      const [type, props, children, patchFlag, dynamicProps] = args
      const name = type['name'] || type['displayName']
      if (!name) {
        return args
      }

      const stub = resolveComponentStubByName(name, stubs)

      // we return a stub by matching Vue's `h` function
      // where the signature is h(Component, props, slots)
      // case 1: default stub
      if (stub === true) {
        // @ts-ignore
        const propsDeclaration = type?.props || {}
        return [
          createStub({ name, props: propsDeclaration }),
          props,
          children,
          patchFlag,
          dynamicProps
        ]
      }

      // case 2: custom implementation
      if (typeof stub === 'object') {
        // pass the props and children, for advanced stubbing
        return [stubs[name], props, children, patchFlag, dynamicProps]
      }
    }

    return args
  })
}

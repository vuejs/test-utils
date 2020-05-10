import { transformVNodeArgs, h, createVNode } from 'vue'
import { hyphenate } from '@vue/shared'
import { MOUNT_COMPONENT_REF, MOUNT_PARENT_NAME } from './constants'
import { config } from './config'
import { matchName } from './utils/matchName'

interface IStubOptions {
  name?: string
  props: any
}

type VNodeArgs = Parameters<typeof createVNode>

function getSlots(ctx) {
  return !config.renderStubDefaultSlot ? undefined : ctx.$slots
}

const createStub = ({ name, props }: IStubOptions) => {
  const anonName = 'anonymous-stub'
  const tag = name ? `${hyphenate(name)}-stub` : anonName

  const render = (ctx) => {
    return h(tag, {}, getSlots(ctx))
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
  isComponent(args) && args[0]['name'] === MOUNT_PARENT_NAME

const isMountedComponent = (args: VNodeArgs) =>
  isComponent(args) && args[1] && args[1]['ref'] === MOUNT_COMPONENT_REF

const isComponent = (args: VNodeArgs) => typeof args[0] === 'object'

const isFunctionalComponent = ([type]: VNodeArgs) =>
  typeof type === 'function' && ('name' in type || 'displayName' in type)

export function stubComponents(
  stubs: Record<any, any> = {},
  shallow: boolean = false
) {
  transformVNodeArgs((args) => {
    // args[0] can either be:
    // 1. a HTML tag (div, span...)
    // 2. An object of component options, such as { name: 'foo', render: [Function], props: {...} }
    // Depending what it is, we do different things.
    if (
      isHTMLElement(args) ||
      isCommentOrFragment(args) ||
      isParent(args) ||
      isMountedComponent(args)
    ) {
      return args
    }

    if (isComponent(args) || isFunctionalComponent(args)) {
      const [type, props, children, patchFlag, dynamicProps] = args
      const name = type['name'] || type['displayName']
      if (!name && !shallow) {
        return args
      }

      const stub = resolveComponentStubByName(name, stubs)

      // case 2: custom implementation
      if (typeof stub === 'object') {
        // pass the props and children, for advanced stubbing
        return [stubs[name], props, children, patchFlag, dynamicProps]
      }

      // we return a stub by matching Vue's `h` function
      // where the signature is h(Component, props, slots)
      // case 1: default stub
      if (stub === true || shallow) {
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
    }

    return args
  })
}

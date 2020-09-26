import {
  transformVNodeArgs,
  Transition,
  TransitionGroup,
  h,
  ComponentPublicInstance,
  Slots,
  ComponentOptions,
  defineComponent,
  VNodeProps,
  VNodeTypes
} from 'vue'
import { hyphenate } from './utils/vueShared'
import { MOUNT_COMPONENT_REF, MOUNT_PARENT_NAME } from './constants'
import { config } from './config'
import { matchName } from './utils/matchName'
import { ComponentInternalInstance } from '@vue/runtime-core'

interface StubOptions {
  name?: string
  props: any
}

function getSlots(ctx: ComponentPublicInstance): Slots | undefined {
  return !config.renderStubDefaultSlot ? undefined : ctx.$slots
}

const createStub = ({ name, props }: StubOptions): ComponentOptions => {
  const anonName = 'anonymous-stub'
  const tag = name ? `${hyphenate(name)}-stub` : anonName

  const render = (ctx: ComponentPublicInstance) => {
    return h(tag, {}, getSlots(ctx))
  }

  return defineComponent({ name: name || anonName, render, props })
}

const createTransitionStub = ({
  name,
  props
}: StubOptions): ComponentOptions => {
  const render = (ctx: ComponentPublicInstance) => {
    return h(name, {}, ctx.$slots)
  }

  return defineComponent({ name, render, props })
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

const isHTMLElement = (type: VNodeTypes) => typeof type === 'string'

const isCommentOrFragment = (type: VNodeTypes) => typeof type === 'symbol'

const isParent = (type: VNodeTypes) =>
  isComponent(type) && type['name'] === MOUNT_PARENT_NAME

const isMountedComponent = (
  type: VNodeTypes,
  props: ({ [key: string]: unknown } & VNodeProps) | null | undefined
) => isComponent(type) && props && props['ref'] === MOUNT_COMPONENT_REF

const isComponent = (type: VNodeTypes): type is ComponentOptions =>
  typeof type === 'object'

const isFunctionalComponent = (type: VNodeTypes): type is ComponentOptions =>
  typeof type === 'function' && ('name' in type || 'displayName' in type)

export function stubComponents(
  stubs: Record<any, any> = {},
  shallow: boolean = false
) {
  transformVNodeArgs((args, instance: ComponentInternalInstance | null) => {
    const [nodeType, props, children, patchFlag, dynamicProps] = args
    const type = nodeType as VNodeTypes

    // stub transition by default via config.global.stubs
    if (type === Transition && stubs['transition']) {
      return [
        createTransitionStub({ name: 'transition-stub', props: undefined }),
        undefined,
        children
      ]
    }

    // stub transition-group by default via config.global.stubs
    if (type === TransitionGroup && stubs['transition-group']) {
      return [
        createTransitionStub({
          name: 'transition-group-stub',
          props: undefined
        }),
        undefined,
        children
      ]
    }

    // args[0] can either be:
    // 1. a HTML tag (div, span...)
    // 2. An object of component options, such as { name: 'foo', render: [Function], props: {...} }
    // Depending what it is, we do different things.
    if (
      isHTMLElement(type) ||
      isCommentOrFragment(type) ||
      isParent(type) ||
      isMountedComponent(type, props)
    ) {
      return args
    }

    if (isComponent(type) || isFunctionalComponent(type)) {
      let name = type['name'] || type['displayName']

      // if no name, then check the locally registered components in the parent
      if (!name && instance && instance.parent) {
        // try to infer the name based on local resolution
        const registry = (instance.type as any).components
        for (const key in registry) {
          if (registry[key] === type) {
            name = key
            break
          }
        }
      }
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

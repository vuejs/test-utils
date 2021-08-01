import {
  transformVNodeArgs,
  Transition,
  TransitionGroup,
  h,
  ComponentPublicInstance,
  ComponentOptions,
  defineComponent,
  VNodeTypes,
  ConcreteComponent,
  ComponentPropsOptions
} from 'vue'
import { hyphenate } from './utils/vueShared'
import { matchName } from './utils/matchName'
import { isComponent, isFunctionalComponent, isObjectComponent } from './utils'
import { ComponentInternalInstance } from '@vue/runtime-core'
import {
  isLegacyExtendedComponent,
  unwrapLegacyVueExtendComponent
} from './utils/vueCompatSupport'

interface StubOptions {
  name: string
  propsDeclaration?: ComponentPropsOptions
  renderStubDefaultSlot?: boolean
}

const stubsMap: WeakMap<ConcreteComponent, VNodeTypes> = new WeakMap()

export const getOriginalVNodeTypeFromStub = (
  type: ConcreteComponent
): VNodeTypes | undefined => stubsMap.get(type)

const doNotStubComponents: WeakSet<ConcreteComponent> = new WeakSet()
const shouldNotStub = (type: ConcreteComponent) => doNotStubComponents.has(type)
export const addToDoNotStubComponents = (type: ConcreteComponent) =>
  doNotStubComponents.add(type)

export const createStub = ({
  name,
  propsDeclaration,
  renderStubDefaultSlot
}: StubOptions): ComponentOptions => {
  const anonName = 'anonymous-stub'
  const tag = name ? `${hyphenate(name)}-stub` : anonName

  const render = (ctx: ComponentPublicInstance) => {
    return h(tag, ctx.$props, renderStubDefaultSlot ? ctx.$slots : undefined)
  }

  return defineComponent({
    name: name || anonName,
    compatConfig: { MODE: 3, RENDER_FUNCTION: false },
    render,
    props: propsDeclaration || {}
  })
}

const createTransitionStub = ({ name }: StubOptions): ComponentOptions => {
  const render = (ctx: ComponentPublicInstance) => {
    return h(name, {}, ctx.$slots)
  }

  return defineComponent({
    name,
    compatConfig: { MODE: 3, RENDER_FUNCTION: false },
    render
  })
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

const getComponentRegisteredName = (
  instance: ComponentInternalInstance | null,
  type: VNodeTypes
): string | null => {
  if (!instance || !instance.parent) return null

  // try to infer the name based on local resolution
  const registry = (instance.type as any).components
  for (const key in registry) {
    if (registry[key] === type) {
      return key
    }
  }

  return null
}

const getComponentName = (type: VNodeTypes): string => {
  if (isObjectComponent(type)) {
    return type.name || ''
  }

  if (isLegacyExtendedComponent(type)) {
    return unwrapLegacyVueExtendComponent(type).name || ''
  }

  if (isFunctionalComponent(type)) {
    return type.displayName || type.name
  }

  return ''
}

export function stubComponents(
  stubs: Record<any, any> = {},
  shallow: boolean = false,
  renderStubDefaultSlot: boolean = false
) {
  const components: Record<string, ComponentOptions> = {}
  transformVNodeArgs((args, instance: ComponentInternalInstance | null) => {
    const [nodeType, props, children, patchFlag, dynamicProps] = args
    const type = nodeType as VNodeTypes

    // stub transition by default via config.global.stubs
    if (type === Transition && stubs['transition']) {
      return [
        createTransitionStub({
          name: 'transition-stub'
        }),
        undefined,
        children
      ]
    }

    // stub transition-group by default via config.global.stubs
    if (type === TransitionGroup && stubs['transition-group']) {
      return [
        createTransitionStub({
          name: 'transition-group-stub'
        }),
        undefined,
        children
      ]
    }

    if (isComponent(type) || isFunctionalComponent(type)) {
      if (shouldNotStub(type)) {
        return args
      }

      const registeredName = getComponentRegisteredName(instance, type)
      const componentName = getComponentName(type)

      let stub = null
      let name = null

      // Prio 1 using the key in locally registered components in the parent
      if (registeredName) {
        stub = resolveComponentStubByName(registeredName, stubs)
        if (stub) {
          name = registeredName
        }
      }

      // Prio 2 using the name attribute in the component
      if (!stub && componentName) {
        stub = resolveComponentStubByName(componentName, stubs)
        if (stub) {
          name = componentName
        }
      }

      // case 2: custom implementation
      if (isComponent(stub)) {
        const stubFn = isFunctionalComponent(stub) ? stub : null

        const specializedStub: ConcreteComponent = stubFn
          ? (...args) => stubFn(...args)
          : { ...stub }

        specializedStub.props = stub.props
        stubsMap.set(specializedStub, type)
        // pass the props and children, for advanced stubbing
        return [specializedStub, props, children, patchFlag, dynamicProps]
      }

      if (stub === false) {
        // we explicitly opt out of stubbing this component
        return args
      }

      // we return a stub by matching Vue's `h` function
      // where the signature is h(Component, props, slots)
      // case 1: default stub
      if (stub === true || shallow) {
        // Set name when using shallow without stub
        if (!name) {
          name = registeredName || componentName
        }

        if (!isComponent(type)) {
          throw new Error('Attempted to stub a non-component')
        }

        const propsDeclaration = type.props || {}
        let newStub = components[name]
        if (!newStub) {
          newStub = createStub({
            name,
            propsDeclaration,
            renderStubDefaultSlot
          })
          components[name] = newStub
          stubsMap.set(newStub, type)
        }
        return [newStub, props, children, patchFlag, dynamicProps]
      }
    }

    // do not stub anything what is not a component
    return args
  })
}

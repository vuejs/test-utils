import {
  transformVNodeArgs,
  Transition,
  TransitionGroup,
  Teleport,
  h,
  ComponentPublicInstance,
  defineComponent,
  VNodeTypes,
  ConcreteComponent,
  ComponentPropsOptions,
  ComponentObjectPropsOptions
} from 'vue'
import { hyphenate } from './utils/vueShared'
import { matchName } from './utils/matchName'
import {
  deepCompare,
  hasOwnProperty,
  isComponent,
  isFunctionalComponent
} from './utils'
import { ComponentInternalInstance } from '@vue/runtime-core'
import { unwrapLegacyVueExtendComponent } from './utils/vueCompatSupport'
import { Stub, Stubs } from './types'
import {
  getComponentName,
  getComponentRegisteredName
} from './utils/componentName'

interface StubOptions {
  name: string
  propsDeclaration?: ComponentPropsOptions
  renderStubDefaultSlot?: boolean
}

const stubsMap: WeakMap<
  ConcreteComponent,
  { source: ConcreteComponent; originalStub?: ConcreteComponent }
> = new WeakMap()
export const registerStub = ({
  source,
  stub,
  originalStub
}: {
  source: ConcreteComponent
  stub: ConcreteComponent
  originalStub?: ConcreteComponent
}) => {
  stubsMap.set(stub, { source, originalStub })
}

export const getOriginalVNodeTypeFromStub = (
  type: ConcreteComponent
): VNodeTypes | undefined => stubsMap.get(type)?.source

export const getOriginalStubFromSpecializedStub = (
  type: ConcreteComponent
): VNodeTypes | undefined => stubsMap.get(type)?.originalStub

const doNotStubComponents: WeakSet<ConcreteComponent> = new WeakSet()
const shouldNotStub = (type: ConcreteComponent) => doNotStubComponents.has(type)
export const addToDoNotStubComponents = (type: ConcreteComponent) =>
  doNotStubComponents.add(type)

const stringifySymbols = (props: ComponentPropsOptions) => {
  // props are always normalized to object syntax
  const $props = props as unknown as ComponentObjectPropsOptions
  return Object.keys($props).reduce((acc, key) => {
    if (typeof $props[key] === 'symbol') {
      return { ...acc, [key]: $props[key]?.toString() }
    }
    return { ...acc, [key]: $props[key] }
  }, {})
}

export const createStub = ({
  name,
  propsDeclaration,
  renderStubDefaultSlot
}: StubOptions) => {
  const anonName = 'anonymous-stub'
  const tag = name ? `${hyphenate(name)}-stub` : anonName

  // Object with default values for component props
  const defaultProps = (() => {
    // Array-style prop declaration
    if (!propsDeclaration || Array.isArray(propsDeclaration)) return {}

    return Object.entries(propsDeclaration).reduce(
      (defaultProps, [propName, propDeclaration]) => {
        let defaultValue = undefined

        if (propDeclaration) {
          // Specific default value set
          // myProp: { type: String, default: 'default-value' }
          if (
            typeof propDeclaration === 'object' &&
            hasOwnProperty(propDeclaration, 'default')
          ) {
            defaultValue = propDeclaration.default

            // Default value factory?
            // myProp: { type: Array, default: () => ['one'] }
            if (typeof defaultValue === 'function') {
              defaultValue = defaultValue()
            }
          } else {
            const propType = (() => {
              if (
                typeof propDeclaration === 'function' ||
                Array.isArray(propDeclaration)
              )
                return propDeclaration
              return typeof propDeclaration === 'object' &&
                hasOwnProperty(propDeclaration, 'type')
                ? propDeclaration.type
                : null
            })()

            // Boolean prop declaration
            // myProp: Boolean
            // or
            // myProp: [Boolean, String]
            if (
              propType === Boolean ||
              (Array.isArray(propType) && propType.includes(Boolean))
            ) {
              defaultValue = false
            }
          }
        }

        if (defaultValue !== undefined) {
          defaultProps[propName] = defaultValue
        }
        return defaultProps
      },
      {} as Record<string, any>
    )
  })()

  const render = (ctx: ComponentPublicInstance) => {
    // https://github.com/vuejs/vue-test-utils-next/issues/1076
    // Passing a symbol as a static prop is not legal, since Vue will try to do
    // something like `el.setAttribute('val', Symbol())` which is not valid and
    // causes an error.
    // Only a problem when shallow mounting. For this reason we iterate of the
    // props that will be passed and stringify any that are symbols.
    const propsWithoutSymbols: Record<string, unknown> = stringifySymbols(
      ctx.$props
    )

    // Filter default value of props
    const props = Object.keys(propsWithoutSymbols)
      .sort()
      .reduce((props, propName) => {
        const propValue = propsWithoutSymbols[propName]

        if (
          propValue !== undefined &&
          !deepCompare(propValue, defaultProps[propName])
        ) {
          props[propName] = propValue
        }
        return props
      }, {} as Record<string, unknown>)

    return h(tag, props, renderStubDefaultSlot ? ctx.$slots : undefined)
  }

  return defineComponent({
    name: name || anonName,
    compatConfig: { MODE: 3, RENDER_FUNCTION: false },
    render,
    props: propsDeclaration || {}
  })
}

const createTransitionStub = ({ name }: StubOptions) => {
  const render = (ctx: ComponentPublicInstance) => {
    return h(name, {}, ctx.$slots)
  }

  return defineComponent({
    name,
    compatConfig: { MODE: 3, RENDER_FUNCTION: false },
    render
  })
}

const createTeleportStub = ({ name }: StubOptions) => {
  const render = (ctx: ComponentPublicInstance) => {
    return h(name, {}, ctx.$slots)
  }

  return defineComponent({
    name,
    compatConfig: { MODE: 3, RENDER_FUNCTION: false },
    render
  })
}

const resolveComponentStubByName = (componentName: string, stubs: Stubs) => {
  if (Array.isArray(stubs) && stubs.length) {
    // ['Foo', 'Bar'] => { Foo: true, Bar: true }
    stubs = stubs.reduce((acc, current) => {
      acc[current] = true
      return acc
    }, {} as Record<string, Stub>)
  }

  for (const [stubKey, value] of Object.entries(stubs)) {
    if (matchName(componentName, stubKey)) {
      return value
    }
  }
}

function createStubOnceForType(
  type: ConcreteComponent,
  factoryFn: () => ConcreteComponent,
  cache: WeakMap<{} & VNodeTypes, ConcreteComponent>
): ConcreteComponent {
  const cachedStub = cache.get(type)
  if (cachedStub) {
    return cachedStub
  }

  const stub = factoryFn()
  cache.set(type, stub)
  return stub
}

export function stubComponents(
  stubs: Stubs = {},
  shallow: boolean = false,
  renderStubDefaultSlot: boolean = false
) {
  const createdStubsMap: WeakMap<{} & VNodeTypes, ConcreteComponent> =
    new WeakMap()

  const createStubOnce = (
    type: ConcreteComponent,
    factoryFn: () => ConcreteComponent
  ) => createStubOnceForType(type, factoryFn, createdStubsMap)

  transformVNodeArgs((args, instance: ComponentInternalInstance | null) => {
    const [nodeType, props, children, patchFlag, dynamicProps] = args
    const type = nodeType as VNodeTypes | typeof Teleport

    // stub transition by default via config.global.stubs
    if (type === Transition && 'transition' in stubs && stubs['transition']) {
      return [
        createTransitionStub({
          name: 'transition-stub'
        }),
        undefined,
        children
      ]
    }

    // stub transition-group by default via config.global.stubs
    if (
      type === TransitionGroup &&
      'transition-group' in stubs &&
      stubs['transition-group']
    ) {
      return [
        createTransitionStub({
          name: 'transition-group-stub'
        }),
        undefined,
        children
      ]
    }

    // stub teleport by default via config.global.stubs
    if (type === Teleport && 'teleport' in stubs && stubs['teleport']) {
      return [
        createTeleportStub({
          name: 'teleport-stub'
        }),
        undefined,
        () => children
      ]
    }

    if (isComponent(type) || isFunctionalComponent(type)) {
      if (shouldNotStub(type)) {
        return args
      }

      const registeredName = getComponentRegisteredName(instance, type)
      const componentName = getComponentName(instance, type)

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
        const unwrappedStub = unwrapLegacyVueExtendComponent(stub)
        const stubFn = isFunctionalComponent(unwrappedStub)
          ? unwrappedStub
          : null
        const specializedStubComponent: ConcreteComponent = stubFn
          ? (...args) => stubFn(...args)
          : { ...unwrappedStub }
        specializedStubComponent.props = unwrappedStub.props

        const specializedStub = createStubOnce(
          type,
          () => specializedStubComponent
        )
        specializedStub.props = unwrappedStub.props
        registerStub({
          source: type,
          stub: specializedStub,
          originalStub: stub
        })
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
        const stubName = name || registeredName || componentName

        if (!isComponent(type)) {
          throw new Error('Attempted to stub a non-component')
        }

        const propsDeclaration =
          unwrapLegacyVueExtendComponent(type).props || {}
        const newStub = createStubOnce(type, () =>
          createStub({
            name: stubName,
            propsDeclaration,
            renderStubDefaultSlot
          })
        )
        registerStub({ source: type, stub: newStub })
        return [newStub, props, children, patchFlag, dynamicProps]
      }
    }

    // do not stub anything what is not a component
    return args
  })
}

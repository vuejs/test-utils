import type { VTUVNodeTypeTransformer } from './util'
import {
  Transition,
  TransitionGroup,
  BaseTransition,
  Teleport,
  h,
  defineComponent,
  VNodeTypes,
  ConcreteComponent,
  ComponentPropsOptions,
  ComponentObjectPropsOptions,
  DefineComponent
} from 'vue'
import { hyphenate } from '../utils/vueShared'
import { matchName } from '../utils/matchName'
import { isComponent, isFunctionalComponent } from '../utils'
import { unwrapLegacyVueExtendComponent } from '../utils/vueCompatSupport'
import { Stub, Stubs } from '../types'
import {
  getComponentName,
  getComponentRegisteredName
} from '../utils/componentName'
import { config } from '../config'

export type CustomCreateStub = (params: {
  name: string
  component: ConcreteComponent
}) => ConcreteComponent

interface StubOptions {
  name: string
  type?: VNodeTypes | typeof Teleport
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
  type,
  renderStubDefaultSlot
}: StubOptions): DefineComponent => {
  const anonName = 'anonymous-stub'
  const tag = name ? `${hyphenate(name)}-stub` : anonName

  const componentOptions = type
    ? unwrapLegacyVueExtendComponent(type) || {}
    : {}

  return defineComponent({
    name: name || anonName,
    props: (componentOptions as ConcreteComponent).props || {},
    // fix #1550 - respect old-style v-model for shallow mounted components with @vue/compat
    // @ts-expect-error
    model: componentOptions.model,
    setup(props, { slots }) {
      return () => {
        // https://github.com/vuejs/test-utils/issues/1076
        // Passing a symbol as a static prop is not legal, since Vue will try to do
        // something like `el.setAttribute('val', Symbol())` which is not valid and
        // causes an error.
        // Only a problem when shallow mounting. For this reason we iterate of the
        // props that will be passed and stringify any that are symbols.
        const propsWithoutSymbols = stringifySymbols(props)

        return h(
          tag,
          propsWithoutSymbols,
          renderStubDefaultSlot ? slots : undefined
        )
      }
    }
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
  cache: WeakMap<ConcreteComponent, ConcreteComponent>
): ConcreteComponent {
  const cachedStub = cache.get(type)
  if (cachedStub) {
    return cachedStub
  }

  const stub = factoryFn()
  cache.set(type, stub)
  return stub
}

interface CreateStubComponentsTransformerConfig {
  stubs?: Stubs
  shallow?: boolean
  renderStubDefaultSlot: boolean
}

export function createStubComponentsTransformer({
  stubs = {},
  shallow = false,
  renderStubDefaultSlot = false
}: CreateStubComponentsTransformerConfig): VTUVNodeTypeTransformer {
  const createdStubsMap: WeakMap<ConcreteComponent, ConcreteComponent> =
    new WeakMap()

  const createStubOnce = (
    type: ConcreteComponent,
    factoryFn: () => ConcreteComponent
  ) => createStubOnceForType(type, factoryFn, createdStubsMap)

  return function componentsTransformer(type, instance) {
    // stub teleport by default via config.global.stubs
    if ((type as any) === Teleport && 'teleport' in stubs) {
      if (stubs.teleport === false) return type

      return createStub({
        name: 'teleport',
        type,
        renderStubDefaultSlot: true
      })
    }

    // stub transition by default via config.global.stubs
    if (
      (type === Transition || type === BaseTransition) &&
      'transition' in stubs
    ) {
      if (stubs.transition === false) return type

      return createStub({
        name: 'transition',
        type,
        renderStubDefaultSlot: true
      })
    }

    // stub transition-group by default via config.global.stubs
    if (type === TransitionGroup && 'transition-group' in stubs) {
      if (stubs['transition-group'] === false) return type

      return createStub({
        name: 'transition-group',
        type,
        renderStubDefaultSlot: true
      })
    }

    if (shouldNotStub(type)) {
      return type
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
      const stubFn = isFunctionalComponent(unwrappedStub) ? unwrappedStub : null
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
      return specializedStub
    }

    if (stub === false) {
      // we explicitly opt out of stubbing this component
      return type
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

      const newStub = createStubOnce(
        type,
        () =>
          config.plugins.createStubs?.({
            name: stubName,
            component: type
          }) ??
          createStub({
            name: stubName,
            type,
            renderStubDefaultSlot
          })
      )
      registerStub({ source: type, stub: newStub })
      return newStub
    }

    return type
  }
}

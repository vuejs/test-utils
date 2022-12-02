import type { VTUVNodeTypeTransformer } from './util'
import {
  Transition,
  TransitionGroup,
  BaseTransition,
  Teleport,
  KeepAlive,
  h,
  defineComponent,
  VNodeTypes,
  ConcreteComponent,
  ComponentPropsOptions,
  ComponentObjectPropsOptions,
  DefineComponent,
  Component
} from 'vue'
import { hyphenate } from '../utils/vueShared'
import { matchName } from '../utils/matchName'
import { isComponent, isFunctionalComponent } from '../utils'
import { unwrapLegacyVueExtendComponent } from '../utils/vueCompatSupport'
import {
  getComponentName,
  getComponentRegisteredName
} from '../utils/componentName'
import { config } from '../config'
import { registerStub } from '../stubs'

export type CustomCreateStub = (params: {
  name: string
  component: ConcreteComponent
}) => ConcreteComponent

interface StubOptions {
  name: string
  type?: VNodeTypes | typeof Teleport | typeof KeepAlive
  renderStubDefaultSlot?: boolean
}

const doNotStubComponents: WeakSet<ConcreteComponent> = new WeakSet()
const shouldNotStub = (type: ConcreteComponent) => doNotStubComponents.has(type)
export const addToDoNotStubComponents = (type: ConcreteComponent) =>
  doNotStubComponents.add(type)

const normalizeStubProps = (props: ComponentPropsOptions) => {
  // props are always normalized to object syntax
  const $props = props as unknown as ComponentObjectPropsOptions
  return Object.keys($props).reduce((acc, key) => {
    if (typeof $props[key] === 'symbol') {
      return { ...acc, [key]: $props[key]?.toString() }
    }
    if (typeof $props[key] === 'function') {
      return { ...acc, [key]: '[Function]' }
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
        // Also having function text as attribute is useless and annoying so
        // we replace it with "[Function]""
        const stubProps = normalizeStubProps(props)

        return h(tag, stubProps, renderStubDefaultSlot ? slots : undefined)
      }
    }
  })
}

const resolveComponentStubByName = (
  componentName: string,
  stubs: Record<string, Component | boolean>
) => {
  for (const [stubKey, value] of Object.entries(stubs)) {
    if (matchName(componentName, stubKey)) {
      return value
    }
  }
}

interface CreateStubComponentsTransformerConfig {
  stubs?: Record<string, Component | boolean>
  shallow?: boolean
  renderStubDefaultSlot: boolean
}

export function createStubComponentsTransformer({
  stubs = {},
  shallow = false,
  renderStubDefaultSlot = false
}: CreateStubComponentsTransformerConfig): VTUVNodeTypeTransformer {
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

    // stub keep-alive/KeepAlive by default via config.global.stubs
    if ((type as any) === KeepAlive && ('keep-alive' in stubs || 'KeepAlive' in stubs)) {
      if ('keep-alive' in stubs && stubs['keep-alive'] === false) return type
      if ('KeepAlive' in stubs && stubs['KeepAlive'] === false) return type

      return createStub({
        name: 'keep-alive',
        type,
        renderStubDefaultSlot: true
      })
    }

    // stub transition by default via config.global.stubs
    if (
      (type === Transition || (type as any) === BaseTransition) &&
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
    if ((type as any) === TransitionGroup && 'transition-group' in stubs) {
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

      // Edge case: stub is component, we will not render stub but instead will create
      // a new "copy" of stub component definition, but we want user still to be able
      // to find our component by stub definition, so we register it manually
      registerStub({ source: type, stub })

      const specializedStubComponent: ConcreteComponent = stubFn
        ? (...args) => stubFn(...args)
        : { ...unwrappedStub }
      specializedStubComponent.props = unwrappedStub.props

      return specializedStubComponent
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

      const newStub =
        config.plugins.createStubs?.({
          name: stubName,
          component: type
        }) ??
        createStub({
          name: stubName,
          type,
          renderStubDefaultSlot
        })
      return newStub
    }

    return type
  }
}

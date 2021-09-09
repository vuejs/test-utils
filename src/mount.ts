import {
  h,
  createApp,
  defineComponent,
  reactive,
  FunctionalComponent,
  ComponentPublicInstance,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithoutProps,
  ExtractPropTypes,
  AppConfig,
  VNodeProps,
  ComponentOptionsMixin,
  DefineComponent,
  MethodOptions,
  AllowedComponentProps,
  ComponentCustomProps,
  ExtractDefaultPropTypes,
  VNode,
  EmitsOptions,
  ComputedOptions,
  ComponentPropsOptions,
  ComponentOptions,
  ConcreteComponent
} from 'vue'

import { MountingOptions, Slot } from './types'
import {
  isFunctionalComponent,
  isObjectComponent,
  mergeGlobalProperties,
  isObject
} from './utils'
import { processSlot } from './utils/compileSlots'
import { createWrapper, VueWrapper } from './vueWrapper'
import { attachEmitListener } from './emit'
import {
  createStub,
  stubComponents,
  addToDoNotStubComponents,
  registerStub
} from './stubs'
import {
  isLegacyFunctionalComponent,
  unwrapLegacyVueExtendComponent
} from './utils/vueCompatSupport'

// NOTE this should come from `vue`
type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps

// Class component - no props
export function mount<V>(
  originalComponent: {
    new (...args: any[]): V
    registerHooks(keys: string[]): void
  },
  options?: MountingOptions<any>
): VueWrapper<ComponentPublicInstance<V>>

// Class component - props
export function mount<V, P>(
  originalComponent: {
    new (...args: any[]): V
    props(Props: P): any
    registerHooks(keys: string[]): void
  },
  options?: MountingOptions<P & PublicProps>
): VueWrapper<ComponentPublicInstance<V>>

// Functional component with emits
export function mount<Props, E extends EmitsOptions = {}>(
  originalComponent: FunctionalComponent<Props, E>,
  options?: MountingOptions<Props & PublicProps>
): VueWrapper<ComponentPublicInstance<Props>>

// Component declared with defineComponent
export function mount<
  PropsOrPropOptions = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
  PP = PublicProps,
  Props = Readonly<ExtractPropTypes<PropsOrPropOptions>>,
  Defaults = ExtractDefaultPropTypes<PropsOrPropOptions>
>(
  component: DefineComponent<
    PropsOrPropOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE,
    PP,
    Props,
    Defaults
  >,
  options?: MountingOptions<
    Partial<Defaults> & Omit<Props & PublicProps, keyof Defaults>,
    D
  >
): VueWrapper<
  InstanceType<
    DefineComponent<
      PropsOrPropOptions,
      RawBindings,
      D,
      C,
      M,
      Mixin,
      Extends,
      E,
      EE,
      PP,
      Props,
      Defaults
    >
  >
>

// Component declared with no props
export function mount<
  Props = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string
>(
  componentOptions: ComponentOptionsWithoutProps<
    Props,
    RawBindings,
    D,
    C,
    M,
    E,
    Mixin,
    Extends,
    EE
  >,
  options?: MountingOptions<Props & PublicProps, D>
): VueWrapper<
  ComponentPublicInstance<Props, RawBindings, D, C, M, E, VNodeProps & Props>
>

// Component declared with { props: [] }
export function mount<
  PropNames extends string,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string,
  Props extends Readonly<{ [key in PropNames]?: any }> = Readonly<
    { [key in PropNames]?: any }
  >
>(
  componentOptions: ComponentOptionsWithArrayProps<
    PropNames,
    RawBindings,
    D,
    C,
    M,
    E,
    Mixin,
    Extends,
    EE,
    Props
  >,
  options?: MountingOptions<Props & PublicProps, D>
): VueWrapper<ComponentPublicInstance<Props, RawBindings, D, C, M, E>>

// Component declared with { props: { ... } }
export function mount<
  // the Readonly constraint allows TS to treat the type of { required: true }
  // as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string
>(
  componentOptions: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    E,
    Mixin,
    Extends,
    EE
  >,
  options?: MountingOptions<ExtractPropTypes<PropsOptions> & PublicProps, D>
): VueWrapper<
  ComponentPublicInstance<
    ExtractPropTypes<PropsOptions>,
    RawBindings,
    D,
    C,
    M,
    E,
    VNodeProps & ExtractPropTypes<PropsOptions>
  >
>

// implementation
export function mount(
  inputComponent: any,
  options?: MountingOptions<any>
): VueWrapper<any> {
  // normalise the incoming component
  let originalComponent = unwrapLegacyVueExtendComponent(inputComponent)
  let component: ConcreteComponent

  if (
    isFunctionalComponent(originalComponent) ||
    isLegacyFunctionalComponent(originalComponent)
  ) {
    component = defineComponent({
      setup:
        (_, { attrs, slots }) =>
        () =>
          h(originalComponent, attrs, slots)
    })
    addToDoNotStubComponents(originalComponent)
  } else if (isObjectComponent(originalComponent)) {
    component = { ...originalComponent }
  } else {
    component = originalComponent
  }

  addToDoNotStubComponents(component)
  registerStub(originalComponent, component)
  const el = document.createElement('div')

  if (options?.attachTo) {
    let to: Element | null
    if (typeof options.attachTo === 'string') {
      to = document.querySelector(options.attachTo)
      if (!to) {
        throw new Error(
          `Unable to find the element matching the selector ${options.attachTo} given as the \`attachTo\` option`
        )
      }
    } else {
      to = options.attachTo
    }

    to.appendChild(el)
  }

  function slotToFunction(slot: Slot) {
    switch (typeof slot) {
      case 'function':
        return slot
      case 'object':
        return () => h(slot)
      case 'string':
        return processSlot(slot)
      default:
        throw Error(`Invalid slot received.`)
    }
  }

  // handle any slots passed via mounting options
  const slots =
    options?.slots &&
    Object.entries(options.slots).reduce(
      (
        acc: { [key: string]: Function },
        [name, slot]: [string, Slot]
      ): { [key: string]: Function } => {
        if (Array.isArray(slot)) {
          const normalized = slot.map(slotToFunction)
          acc[name] = (args: unknown) => normalized.map((f) => f(args))
          return acc
        }

        acc[name] = slotToFunction(slot)
        return acc
      },
      {}
    )

  // override component data with mounting options data
  if (options?.data) {
    const providedData = options.data()
    if (isObjectComponent(originalComponent)) {
      // component is guaranteed to be the same type as originalComponent
      const objectComponent = component as ComponentOptions
      const originalDataFn = originalComponent.data || (() => ({}))
      objectComponent.data = (vm) => ({
        ...originalDataFn.call(vm, vm),
        ...providedData
      })
    } else {
      throw new Error(
        'data() option is not supported on functional and class components'
      )
    }
  }

  const MOUNT_COMPONENT_REF = 'VTU_COMPONENT'
  // we define props as reactive so that way when we update them with `setProps`
  // Vue's reactivity system will cause a rerender.
  const props = reactive({
    ...options?.attrs,
    ...options?.propsData,
    ...options?.props,
    ref: MOUNT_COMPONENT_REF
  })
  const global = mergeGlobalProperties(options?.global)
  if (isObjectComponent(component)) {
    component.components = { ...component.components, ...global.components }
  }

  // create the wrapper component
  const Parent = defineComponent({
    name: 'VTU_ROOT',
    render() {
      return h(component, props, slots)
    }
  })
  addToDoNotStubComponents(Parent)

  const setProps = (newProps: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(newProps)) {
      props[k] = v
    }

    return vm.$nextTick()
  }

  // create the app
  const app = createApp(Parent)

  // add tracking for emitted events
  // this must be done after `createApp`: https://github.com/vuejs/vue-test-utils-next/issues/436
  attachEmitListener()

  // global mocks mixin
  if (global?.mocks) {
    const mixin = {
      beforeCreate() {
        for (const [k, v] of Object.entries(
          global.mocks as { [key: string]: any }
        )) {
          ;(this as any)[k] = v
        }
      }
    }

    app.mixin(mixin)
  }

  // AppConfig
  if (global.config) {
    for (const [k, v] of Object.entries(global.config) as [
      keyof Omit<AppConfig, 'isNativeTag'>,
      any
    ][]) {
      app.config[k] = v
    }
  }

  // use and plugins from mounting options
  if (global.plugins) {
    for (const plugin of global.plugins) {
      if (Array.isArray(plugin)) {
        app.use(plugin[0], ...plugin.slice(1))
        continue
      }
      app.use(plugin)
    }
  }

  // use any mixins from mounting options
  if (global.mixins) {
    for (const mixin of global.mixins) app.mixin(mixin)
  }

  if (global.components) {
    for (const key of Object.keys(global.components)) {
      // avoid registering components that are stubbed twice
      if (!(key in global.stubs)) {
        app.component(key, global.components[key])
      }
    }
  }

  if (global.directives) {
    for (const key of Object.keys(global.directives))
      app.directive(key, global.directives[key])
  }

  // provide any values passed via provides mounting option
  if (global.provide) {
    for (const key of Reflect.ownKeys(global.provide)) {
      // @ts-ignore: https://github.com/microsoft/TypeScript/issues/1863
      app.provide(key, global.provide[key])
    }
  }

  // stubs
  // even if we are using `mount`, we will still
  // stub out Transition and Transition Group by default.
  stubComponents(global.stubs, options?.shallow, global?.renderStubDefaultSlot)

  // users expect stubs to work with globally registered
  // components so we register stubs as global components to avoid
  // warning about not being able to resolve component
  //
  // component implementation provided here will never be called
  // but we need name to make sure that stubComponents will
  // properly stub this later by matching stub name
  //
  // ref: https://github.com/vuejs/vue-test-utils-next/issues/249
  // ref: https://github.com/vuejs/vue-test-utils-next/issues/425
  if (global?.stubs) {
    for (const name of Object.keys(global.stubs)) app.component(name, { name })
  }

  // mount the app!
  const vm = app.mount(el)

  // Ingore Avoid app logic that relies on enumerating keys on a component instance... warning
  const warnSave = console.warn
  console.warn = () => {}

  const appRef = vm.$refs[MOUNT_COMPONENT_REF] as ComponentPublicInstance
  // we add `hasOwnProperty` so jest can spy on the proxied vm without throwing
  appRef.hasOwnProperty = (property) => {
    return Reflect.has(appRef, property)
  }
  console.warn = warnSave
  return createWrapper(app, appRef, setProps)
}

export const shallowMount: typeof mount = (component: any, options?: any) => {
  return mount(component, { ...options, shallow: true })
}

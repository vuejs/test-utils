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
  WritableComputedOptions,
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
  ConcreteComponent
} from 'vue'

import { MountingOptions, Slot } from './types'
import {
  isFunctionalComponent,
  isHTML,
  isObjectComponent,
  mergeGlobalProperties,
  isObject
} from './utils'
import { processSlot } from './utils/compileSlots'
import { createWrapper, VueWrapper } from './vueWrapper'
import { attachEmitListener } from './emit'
import { createDataMixin } from './dataMixin'
import { MOUNT_COMPONENT_REF, MOUNT_PARENT_NAME } from './constants'
import { createStub, stubComponents } from './stubs'
import { isLegacyFunctionalComponent } from './utils/vueCompatSupport'

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
  originalComponent: any,
  options?: MountingOptions<any>
): VueWrapper<any> {
  // normalise the incoming component
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
  } else if (isObjectComponent(originalComponent)) {
    component = { ...originalComponent }
  } else {
    component = originalComponent
  }

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
    if (typeof slot === 'object') {
      if ('render' in slot && slot.render) {
        return slot.render
      }

      return () => slot
    }

    if (typeof slot === 'function') {
      return slot
    }

    if (typeof slot === 'string') {
      // if it is HTML we process and render it using h
      if (isHTML(slot)) {
        return (props: VNodeProps) => h(processSlot(slot), props)
      }
      // otherwise it is just a string so we just return it as-is
      else {
        return () => slot
      }
    }

    throw Error(`Invalid slot received.`)
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
          const normalized = slot.reduce<Array<Function | VNode>>(
            (acc, curr) => {
              const slotAsFn = slotToFunction(curr)
              if (isObject(curr) && 'render' in curr) {
                const rendered = h(slotAsFn as any)
                return acc.concat(rendered)
              }
              return acc.concat(slotAsFn())
            },
            []
          )
          acc[name] = () => normalized

          return acc
        }

        acc[name] = slotToFunction(slot)

        return acc
      },
      {}
    )

  // override component data with mounting options data
  if (options?.data) {
    const dataMixin = createDataMixin(options.data())
    ;(component as any).mixins = [
      ...((component as any).mixins || []),
      dataMixin
    ]
  }

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
    name: MOUNT_PARENT_NAME,
    render() {
      // https://github.com/vuejs/vue-test-utils-next/issues/651
      // script setup components include an empty `expose` array as part of the
      // code generated by the SFC compiler. Eg a component might look like
      // { expose: [], setup: [Function], render: [Function] }
      // not sure why (yet), but the empty expose array causes events to not be
      // correctly captured.
      // TODO: figure out why this is happening and understand the implications of
      // the expose rfc for Test Utils.
      if (isObjectComponent(component)) {
        delete component.expose
      }
      return h(component, props, slots)
    }
  })

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
      if (!global.stubs[key]) {
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
  // components, too, such as <router-link> and <router-view>
  // so we register those globally.
  // ref: https://github.com/vuejs/vue-test-utils-next/issues/249
  // we register the component as named in the stubs to avoid not being
  // able to resolve the component later due to casing
  // ref: https://github.com/vuejs/vue-test-utils-next/issues/425
  if (global?.stubs) {
    for (const [name, stub] of Object.entries(global.stubs)) {
      if (stub === true) {
        const stubbed = createStub({
          name,
          renderStubDefaultSlot: global?.renderStubDefaultSlot
        })
        // default stub.
        app.component(name, stubbed)
      } else {
        // user has provided a custom implementation.
        app.component(name, stub)
      }
    }
  }

  // mount the app!
  const vm = app.mount(el)

  // Ingore Avoid app logic that relies on enumerating keys on a component instance... warning
  const warnSave = console.warn
  console.warn = () => {}

  // get `vm`.
  // for some unknown reason, getting the `vm` for components using `<script setup>`
  // as of Vue 3.0.3 works differently.
  // if `appRef` has keys, use that (vm always has keys like $el, $props etc).
  // if not, use the return value from app.mount.
  const appRef = vm.$refs[MOUNT_COMPONENT_REF] as ComponentPublicInstance
  const $vm = Reflect.ownKeys(appRef).length ? appRef : vm
  // we add `hasOwnProperty` so jest can spy on the proxied vm without throwing
  $vm.hasOwnProperty = (property) => {
    return Reflect.has($vm, property)
  }
  console.warn = warnSave
  return createWrapper(app, $vm, setProps)
}

export const shallowMount: typeof mount = (component: any, options?: any) => {
  return mount(component, { ...options, shallow: true })
}

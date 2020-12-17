import {
  h,
  createApp,
  defineComponent,
  VNodeNormalizedChildren,
  reactive,
  FunctionalComponent,
  ComponentPublicInstance,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithoutProps,
  ExtractPropTypes,
  WritableComputedOptions,
  ComponentPropsOptions,
  AppConfig,
  VNodeProps,
  ComponentOptionsMixin,
  DefineComponent,
  MethodOptions,
  AllowedComponentProps,
  ComponentCustomProps,
  ExtractDefaultPropTypes
} from 'vue'

import { config } from './config'
import { MountingOptions, Slot } from './types'
import {
  isFunctionalComponent,
  isObjectComponent,
  mergeGlobalProperties
} from './utils'
import { processSlot } from './utils/compileSlots'
import { createWrapper, VueWrapper } from './vueWrapper'
import { attachEmitListener } from './emitMixin'
import { createDataMixin } from './dataMixin'
import { MOUNT_COMPONENT_REF, MOUNT_PARENT_NAME } from './constants'
import { createStub, stubComponents } from './stubs'
import { hyphenate } from './utils/vueShared'

// NOTE this should come from `vue`
type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps

export type ComputedOptions = Record<
  string,
  ((ctx?: any) => any) | WritableComputedOptions<any>
>
export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>
export type EmitsOptions = ObjectEmitsOptions | string[]

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
  options?: MountingOptions<PublicProps, D>
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
  let component

  if (isFunctionalComponent(originalComponent)) {
    // we need to wrap it like this so we can capture emitted events.
    // we capture events using a mixin that mutates `emit` in `beforeCreate`,
    // but functional components do not support mixins, so we need to wrap it
    // and make it a non-functional component for testing purposes.
    component = defineComponent({
      setup: (_, { attrs, slots, emit }) => () => {
        return h((props: any, ctx: any) =>
          originalComponent(props, { ...ctx, ...attrs, emit, slots })
        )
      }
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

  // handle any slots passed via mounting options
  const slots: VNodeNormalizedChildren =
    options?.slots &&
    Object.entries(options.slots).reduce(
      (
        acc: { [key: string]: Function },
        [name, slot]: [string, Slot]
      ): { [key: string]: Function } => {
        // case of an SFC getting passed
        if (typeof slot === 'object' && 'render' in slot) {
          acc[name] = slot.render
          return acc
        }

        if (typeof slot === 'function') {
          acc[name] = slot
          return acc
        }

        if (typeof slot === 'object') {
          acc[name] = () => slot
          return acc
        }

        if (typeof slot === 'string') {
          // slot is most probably a scoped slot string or a plain string
          acc[name] = (props: VNodeProps) => h(processSlot(slot), props)
          return acc
        }

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

  const global = mergeGlobalProperties(config.global, options?.global)
  component.components = { ...component.components, ...global.components }

  // create the wrapper component
  const Parent = defineComponent({
    name: MOUNT_PARENT_NAME,
    render() {
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
    for (const key of Object.keys(global.components))
      app.component(key, global.components[key])
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

  // add tracking for emitted events
  app.mixin(attachEmitListener())

  // stubs
  // even if we are using `mount`, we will still
  // stub out Transition and Transition Group by default.
  stubComponents(global.stubs, options?.shallow)

  // users expect stubs to work with globally registered
  // compnents, too, such as <router-link> and <router-view>
  // so we register those globally.
  // https://github.com/vuejs/vue-test-utils-next/issues/249
  if (global?.stubs) {
    for (const [name, stub] of Object.entries(global.stubs)) {
      const tag = hyphenate(name)
      if (stub === true) {
        // default stub.
        app.component(tag, createStub({ name, props: {} }))
      } else {
        // user has provided a custom implementation.
        app.component(tag, stub)
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
  console.warn = warnSave

  return createWrapper(app, $vm, setProps)
}

export const shallowMount: typeof mount = (component: any, options?: any) => {
  return mount(component, { ...options, shallow: true })
}

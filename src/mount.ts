import {
  h,
  createApp,
  VNode,
  defineComponent,
  VNodeNormalizedChildren,
  transformVNodeArgs,
  reactive,
  FunctionalComponent,
  ComponentPublicInstance,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithoutProps,
  ExtractPropTypes,
  Component,
  WritableComputedOptions,
  ComponentOptionsBase,
  ComponentPropsOptions,
  AppConfig,
  VNodeProps,
  ComponentOptionsMixin
} from 'vue'

import { config } from './config'
import { GlobalMountOptions } from './types'
import { mergeGlobalProperties } from './utils'
import { processSlot } from './utils/compileSlots'
import { createWrapper, VueWrapper } from './vueWrapper'
import { attachEmitListener } from './emitMixin'
import { createDataMixin } from './dataMixin'
import {
  MOUNT_COMPONENT_REF,
  MOUNT_ELEMENT_ID,
  MOUNT_PARENT_NAME
} from './constants'
import { stubComponents } from './stubs'

type Slot = VNode | string | { render: Function } | Function

type SlotDictionary = {
  [key: string]: Slot
}

interface MountingOptions<Props, Data = {}> {
  data?: () => {} extends Data
    ? never
    : Data extends object
    ? Partial<Data>
    : never
  props?: Props
  attrs?: Record<string, unknown>
  slots?: SlotDictionary & {
    default?: Slot
  }
  global?: GlobalMountOptions
  attachTo?: HTMLElement | string
  shallow?: boolean
}

export type ComputedOptions = Record<
  string,
  ((ctx?: any) => any) | WritableComputedOptions<any>
>
export type ObjectEmitsOptions = Record<
  string,
  ((...args: any[]) => any) | null
>
export type EmitsOptions = ObjectEmitsOptions | string[]

// Functional component
export function mount<
  TestedComponent extends FunctionalComponent<Props>,
  Props
>(
  originalComponent: TestedComponent,
  options?: MountingOptions<Props>
): VueWrapper<ComponentPublicInstance<Props>>

// Component declared with defineComponent
export function mount<TestedComponent extends ComponentPublicInstance>(
  originalComponent: { new (): TestedComponent } & Component,
  options?: MountingOptions<TestedComponent['$props'], TestedComponent['$data']>
): VueWrapper<TestedComponent>

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
  options?: MountingOptions<never, D>
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
  options?: MountingOptions<Props, D>
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
  options?: MountingOptions<ExtractPropTypes<PropsOptions>, D>
): VueWrapper<
  ComponentPublicInstance<
    ExtractPropTypes<PropsOptions>,
    RawBindings,
    D,
    C,
    M,
    E,
    VNodeProps & ExtractPropTypes<PropsOptions, false>
  >
>

// implementation
export function mount(
  originalComponent: any,
  options?: MountingOptions<any>
): VueWrapper<any> {
  // normalise the incoming component
  const component =
    typeof originalComponent === 'function'
      ? defineComponent({
          setup: (_, { attrs, slots }) => () =>
            h(originalComponent, attrs, slots)
        })
      : { ...originalComponent }

  const el = document.createElement('div')
  el.id = MOUNT_ELEMENT_ID

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
    for (const { plugin, options } of global.plugins) app.use(plugin, options)
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
  if (global.stubs || options?.shallow) {
    stubComponents(global.stubs, options?.shallow)
  } else {
    transformVNodeArgs()
  }

  // mount the app!
  const vm = app.mount(el)

  const App = vm.$refs[MOUNT_COMPONENT_REF] as ComponentPublicInstance
  return createWrapper(app, App, setProps)
}

export const shallowMount: typeof mount = (component: any, options?: any) => {
  return mount(component, { ...options, shallow: true })
}

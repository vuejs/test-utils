import {
  ComponentPublicInstance,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithoutProps,
  ExtractPropTypes,
  VNodeProps,
  ComponentOptionsMixin,
  AllowedComponentProps,
  ComponentCustomProps,
  EmitsOptions,
  ComputedOptions,
  ComponentPropsOptions,
  VNode
} from 'vue'
import { GlobalMountOptions, MountingOptions } from './types'
import { VueWrapper } from './vueWrapper'
import { trackInstance } from './utils/autoUnmount'
import { createVueWrapper } from './wrapperFactory'
import { createInstance } from './createInstance'
import type {
  ComponentProps,
  ComponentSlots,
  ComponentExposed
} from 'vue-component-type-helpers'

// NOTE this should come from `vue`
type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps

export function mount<
  T extends ((...args: any) => any) | (new (...args: any) => any)
>(
  originalComponent: T,
  options?: Record<string, unknown> & {
    props?: ComponentProps<T>
    slots?: {
      [K in keyof ComponentSlots<T>]: string | VNode[]
    }
    global?: GlobalMountOptions
  }
): VueWrapper<ComponentExposed<T>>

// Component declared with no props
export function mount<
  Props = {},
  RawBindings = {},
  D extends {} = {},
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
> &
  Record<string, any>

// Component declared with { props: [] }
export function mount<
  PropNames extends string,
  RawBindings,
  D extends {},
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string,
  Props extends Readonly<{ [key in PropNames]?: any }> = Readonly<{
    [key in PropNames]?: any
  }>
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
  D extends {},
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
  options?: MountingOptions<any> & Record<string, any>
): VueWrapper<any> {
  const { app, props, componentRef } = createInstance(inputComponent, options)

  const setProps = (newProps: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(newProps)) {
      props[k] = v
    }

    return vm.$nextTick()
  }

  // Workaround for https://github.com/vuejs/core/issues/7020
  const originalErrorHandler = app.config.errorHandler

  let errorOnMount = null
  app.config.errorHandler = (err, instance, info) => {
    errorOnMount = err

    return originalErrorHandler?.(err, instance, info)
  }

  // mount the app!
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
  const vm = app.mount(el)

  if (errorOnMount) {
    throw errorOnMount
  }
  app.config.errorHandler = originalErrorHandler

  const appRef = componentRef.value! as ComponentPublicInstance
  // we add `hasOwnProperty` so Jest can spy on the proxied vm without throwing
  // note that this is not necessary with Jest v27+ or Vitest, but is kept for compatibility with older Jest versions
  if (!app.hasOwnProperty) {
    appRef.hasOwnProperty = (property) => {
      return Reflect.has(appRef, property)
    }
  }
  const wrapper = createVueWrapper(app, appRef, setProps)
  trackInstance(wrapper)
  return wrapper
}

export const shallowMount: typeof mount = (component: any, options?: any) => {
  return mount(component, { ...options, shallow: true })
}

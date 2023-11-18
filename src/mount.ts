import {
  ComponentPublicInstance,
  DefineComponent,
  VNode,
  ComponentInstance,
  EmitsOptions,
  ComponentObjectPropsOptions,
  ExtractPropTypes
} from 'vue'
import type { ComponentSlots } from 'vue-component-type-helpers'
import { createInstance } from './createInstance'
import { MountingOptions } from './types'
import { trackInstance } from './utils/autoUnmount'
import { VueWrapper } from './vueWrapper'
import { createVueWrapper } from './wrapperFactory'
import { ComponentPropsWithDefaultOptional } from 'vue'

type ShimSlotReturnType<T> = T extends (...args: infer P) => any
  ? (...args: P) => any
  : never

type WithArray<T> = T | T[]

type ComponentData<T> = T extends { data?(...args: any): infer D } ? D : {}

export type ComponentMountingOptions<T, P> = Omit<
  MountingOptions<P, ComponentData<T>>,
  'slots'
> & {
  slots?: {
    [K in keyof ComponentSlots<T>]: WithArray<
      | ShimSlotReturnType<ComponentSlots<T>[K]>
      | string
      | VNode
      | (new () => any)
      | { template: string }
    >
  }
} & Record<string, unknown>

// export function mount<
//   Props = never,
//   RawBindings = {},
//   D = {},
//   C extends ComputedOptions = {},
//   M extends MethodOptions = {},
//   Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
//   Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
//   E extends EmitsOptions = {},
//   EE extends string = string,
//   I extends ComponentInjectOptions = {},
//   II extends string = string,
//   S extends SlotsType = {},
//   Options = {}
// >(
//   originalComponent: ComponentDefineOptions<
//     Props,
//     RawBindings,
//     D,
//     C,
//     M,
//     Mixin,
//     Extends,
//     E,
//     EE,
//     I,
//     II,
//     S,
//     Options
//   >,
//   options?: ComponentMountingOptions<
//     ComponentDefineOptions<
//       Props,
//       RawBindings,
//       D,
//       C,
//       M,
//       Mixin,
//       Extends,
//       E,
//       EE,
//       I,
//       II,
//       S,
//       Options
//     >,
//     ComponentPropsWithDefaultOptional<
//       ComponentDefineOptions<
//         Props,
//         RawBindings,
//         D,
//         C,
//         M,
//         Mixin,
//         Extends,
//         E,
//         EE,
//         I,
//         II,
//         S,
//         Options
//       >
//     >
//   >
// ): { props: Props }
// defineComponent

// TODO import from vue
export type ResolveProps<Props, E extends EmitsOptions> = Readonly<
  ([Props] extends [string]
    ? { [key in Props]?: any }
    : [Props] extends [ComponentObjectPropsOptions]
      ? ExtractPropTypes<Props>
      : Props extends never[]
        ? {}
        : Props) &
    ({} extends E ? {} : {})
>

// export function mount<Component>(
//   component: Component &
//     DefineComponent<
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any,
//       any
//     >,
//   options?: ComponentMountingOptions<
//     Component,
//     ComponentPropsWithDefaultOptional<Component>
//   >
// ): VueWrapper<ComponentInstance<Component>> & {
//   LOL: Component
//   LOOL: ComponentPropsWithDefaultOptional<Component>
// }

export function mount<
  T extends DefineComponent<any, any, any, any, any, any, any, any, any, any>
>(
  originalComponent: T,
  options?: ComponentMountingOptions<T, ComponentPropsWithDefaultOptional<T>>
): VueWrapper<ComponentInstance<T>>

// export function mount<
//   Props = {},
//   RawBindings = {},
//   D = {},
//   C extends ComputedOptions = {},
//   M extends MethodOptions = {},
//   Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
//   Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
//   E extends EmitsOptions = {},
//   EE extends string = string,
//   I extends ComponentInjectOptions = {},
//   II extends string = string,
//   S extends SlotsType = {},
//   Options = {},
//   Component extends DefineComponentOptions<
//     Props,
//     RawBindings,
//     D,
//     C,
//     M,
//     Mixin,
//     Extends,
//     E,
//     EE,
//     I,
//     II,
//     S,
//     Options
//   > = DefineComponentOptions<
//     Props,
//     RawBindings,
//     D,
//     C,
//     M,
//     Mixin,
//     Extends,
//     E,
//     EE,
//     I,
//     II,
//     S,
//     Options
//   >
// >(
//   componentOptions: DefineComponentOptions<
//     Props,
//     RawBindings,
//     D,
//     C,
//     M,
//     Mixin,
//     Extends,
//     E,
//     EE,
//     I,
//     II,
//     S,
//     Options
//   >,
//   options?: ComponentMountingOptions<
//     Component,
//     ComponentPropsWithDefaultOptional<Component>
//   >
// ): VueWrapper<ComponentInstance<Props>>

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

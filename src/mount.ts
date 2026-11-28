import type {
  ComponentPublicInstance,
  DefineComponent,
  DirectiveModifiers,
  VNode
} from 'vue'
import type {
  ComponentExposed,
  ComponentProps,
  ComponentSlots
} from 'vue-component-type-helpers'
import { createInstance } from './createInstance'
import type { GlobalMountOptions, MountingOptions } from './types'
import { trackInstance } from './utils/autoUnmount'
import type { VueWrapper } from './vueWrapper'
import { createVueWrapper } from './wrapperFactory'
import { VaporWrapper } from './vaporWrapper'

type ShimSlotReturnType<T> = T extends (...args: infer P) => any
  ? (...args: P) => any
  : never

type WithArray<T> = T | T[]

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ComponentData<T> = T extends { data?(...args: any): infer D } ? D : {}

// Keep the Vapor directive signature structural for Vue 3.5 consumers.
type VaporDirective = (
  el: any,
  getter?: () => any,
  arg?: () => any,
  modifiers?: DirectiveModifiers
) => (() => void) | void

export type ComponentMountingOptions<
  T,
  P extends ComponentProps<T> = ComponentProps<T>
> = Omit<MountingOptions<P, ComponentData<T>>, 'slots'> & {
  experimentalVapor?: false
  slots?: {
    [K in keyof ComponentSlots<T>]?: WithArray<
      | ShimSlotReturnType<ComponentSlots<T>[K]>
      | string
      | VNode
      | (new () => any)
      | { template: string }
    >
  }
} & Record<string, unknown>

type VaporMountingOptions<P> = Pick<
  MountingOptions<P>,
  'attachTo' | 'attrs' | 'props' | 'propsData'
> & {
  experimentalVapor: true
  shallow?: false
  slots?: never
  global?: Pick<
    GlobalMountOptions,
    'plugins' | 'config' | 'provide' | 'components'
  > & {
    directives?: Record<string, VaporDirective>
  }
}

// A Vapor wrapper's vm only holds defineExpose() bindings. DefineComponent and
// defineVaporComponent types resolve to instance types instead, so fall back to
// an untyped record for them (checked structurally to support Vue 3.5 types).
type VaporExposed<C> =
  ComponentExposed<C> extends { $props: any } | { vapor: true }
    ? Record<string, unknown>
    : ComponentExposed<C>

export type MountComponent<T> = T extends
  | ((...args: any) => any)
  | (new (...args: any) => any)
  ? T
  : T extends { props?: infer Props }
    ? DefineComponent<
        Props extends Readonly<(infer PropNames)[]> | (infer PropNames)[]
          ? { [key in PropNames extends string ? PropNames : string]?: any }
          : Props
      >
    : DefineComponent

export function mount<
  T,
  C = MountComponent<T>,
  P extends ComponentProps<C> = ComponentProps<C>
>(
  originalComponent: T,
  options: VaporMountingOptions<P> & { props?: P | null }
): VaporWrapper<VaporExposed<C>, ComponentProps<C>>
export function mount<
  T,
  C = MountComponent<T>,
  P extends ComponentProps<C> = ComponentProps<C>
>(
  originalComponent: T,
  // the bare `P` lets TypeScript infer a union of props objects as a whole
  options?: ComponentMountingOptions<C, P> & { props?: P | null }
): VueWrapper<
  ComponentProps<C> & ComponentData<C> & ComponentExposed<C>,
  ComponentPublicInstance<
    ComponentProps<C>,
    ComponentData<C> & ComponentExposed<C> & Omit<P, keyof ComponentProps<C>>
  >
>

// implementation
export function mount(
  inputComponent: any,
  options?: ComponentMountingOptions<any, any> | VaporMountingOptions<any>
): VueWrapper<any> | VaporWrapper<any, any> {
  // Registration treats directives opaquely; Vue invokes their renderer-specific signature.
  const { app, props, componentRef } = createInstance(
    inputComponent,
    options as MountingOptions<any> | undefined
  )

  const setProps = (newProps: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(newProps)) {
      props[k] = v
    }
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
    const removeContainer = () => {
      // The wrapper may already have been manually unmounted before auto-unmount
      // runs, so the container can already be removed from its parent.
      if (el.parentNode === to) {
        to.removeChild(el)
      }
    }
    if (app.onUnmount) {
      app.onUnmount(removeContainer)
    } else {
      // app.onUnmount is only available since Vue 3.5
      const unmount = app.unmount
      app.unmount = () => {
        try {
          unmount()
        } finally {
          removeContainer()
        }
      }
    }
  }

  // Workaround for https://github.com/vuejs/core/issues/7020
  const originalErrorHandler = app.config.errorHandler

  const errorsOnMount: unknown[] = []
  app.config.errorHandler = (err, instance, info) => {
    errorsOnMount.push(err)

    return originalErrorHandler?.(err, instance, info)
  }

  let vm: ReturnType<typeof app.mount>
  try {
    vm = app.mount(el)
  } catch (error) {
    el.remove()
    throw error
  } finally {
    app.config.errorHandler = originalErrorHandler
  }

  if (errorsOnMount.length) {
    // Vue finished mounting despite the captured error, so tear down the app.
    try {
      app.unmount()
    } catch {
      // A teardown error must not replace the original mount error.
    } finally {
      el.remove()
    }
    throw errorsOnMount[0]
  }

  if (!componentRef) {
    const wrapper = new VaporWrapper(app, vm, el, setProps)
    trackInstance(wrapper)
    return wrapper
  }

  const appRef = componentRef.value! as ComponentPublicInstance
  // we add `hasOwnProperty` so Jest can spy on the proxied vm without throwing
  // note that this is not necessary with Jest v27+ or Vitest, but is kept for compatibility with older Jest versions
  if (!app.hasOwnProperty) {
    appRef.hasOwnProperty = property => {
      return Reflect.has(appRef, property)
    }
  }
  const wrapper = createVueWrapper(app, appRef, setProps)
  trackInstance(wrapper)
  return wrapper
}

export function shallowMount<
  T,
  C = MountComponent<T>,
  P extends ComponentProps<C> = ComponentProps<C>
>(
  component: T,
  options?: ComponentMountingOptions<C, P> & { props?: P | null }
) {
  return mount<T, C, P>(component, { ...options, shallow: true })
}

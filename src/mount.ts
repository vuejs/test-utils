import {
  h,
  createApp,
  VNode,
  defineComponent,
  VNodeNormalizedChildren,
  transformVNodeArgs,
  reactive,
  ComponentPublicInstance,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithoutProps,
  ExtractPropTypes,
  Component
} from 'vue'

import { config } from './config'
import { GlobalMountOptions } from './types'
import { mergeGlobalProperties, isString } from './utils'
import { createWrapper, VueWrapper } from './vue-wrapper'
import { attachEmitListener } from './emitMixin'
import { createDataMixin } from './dataMixin'
import {
  MOUNT_COMPONENT_REF,
  MOUNT_ELEMENT_ID,
  MOUNT_PARENT_NAME
} from './constants'
import { stubComponents } from './stubs'

type Slot = VNode | string | { render: Function }

interface MountingOptions<Props> {
  data?: () => Record<string, unknown>
  props?: Props
  attrs?: Record<string, unknown>
  slots?: {
    default?: Slot
    [key: string]: Slot
  }
  global?: GlobalMountOptions
  attachTo?: HTMLElement | string
  shallow?: boolean
}

// TODO improve the typings of the overloads

type ExtractComponent<T> = T extends { new (): infer PublicInstance }
  ? PublicInstance
  : any

// Component declared with defineComponent
export function mount<TestedComponent extends ComponentPublicInstance>(
  originalComponent: { new (): TestedComponent } & Component,
  options?: MountingOptions<TestedComponent['$props']>
): VueWrapper<TestedComponent>
// Component declared with { props: { ... } }
export function mount<TestedComponent extends ComponentOptionsWithObjectProps>(
  originalComponent: TestedComponent,
  options?: MountingOptions<ExtractPropTypes<TestedComponent['props'], false>>
): VueWrapper<ExtractComponent<TestedComponent>>
// Component declared with { props: [] }
export function mount<TestedComponent extends ComponentOptionsWithArrayProps>(
  originalComponent: TestedComponent,
  options?: MountingOptions<Record<string, any>>
): VueWrapper<ExtractComponent<TestedComponent>>
// Component declared with no props
export function mount<
  TestedComponent extends ComponentOptionsWithoutProps,
  ComponentT extends ComponentOptionsWithoutProps & {}
>(
  originalComponent: ComponentT extends { new (): any } ? never : ComponentT,
  options?: MountingOptions<never>
): VueWrapper<ExtractComponent<TestedComponent>>
export function mount(
  originalComponent: any,
  options?: MountingOptions<any>
): VueWrapper<any> {
  const component = { ...originalComponent }

  const el = document.createElement('div')
  el.id = MOUNT_ELEMENT_ID

  if (options?.attachTo) {
    const to = isString(options.attachTo)
      ? document.querySelector(options.attachTo)
      : options.attachTo

    if (!to) {
      throw new Error(
        `Unable to find the element matching the selector ${options.attachTo} given as the \`attachTo\` option`
      )
    }
    to.appendChild(el)
  }

  // handle any slots passed via mounting options
  const slots: VNodeNormalizedChildren =
    options?.slots &&
    Object.entries(options.slots).reduce((acc, [name, slot]) => {
      // case of an SFC getting passed
      if (typeof slot === 'object' && 'render' in slot) {
        acc[name] = slot.render
        return acc
      }

      acc[name] = () => slot
      return acc
    }, {})

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
        for (const [k, v] of Object.entries(global.mocks)) {
          this[k] = v
        }
      }
    }

    app.mixin(mixin)
  }

  // AppConfig
  if (global?.config) {
    for (const [k, v] of Object.entries(global.config)) {
      app.config[k] = v
    }
  }

  // use and plugins from mounting options
  if (global?.plugins) {
    for (const use of global.plugins) app.use(use)
  }

  // use any mixins from mounting options
  if (global?.mixins) {
    for (const mixin of global.mixins) app.mixin(mixin)
  }

  if (global?.components) {
    for (const key of Object.keys(global.components))
      app.component(key, global.components[key])
  }

  if (global?.directives) {
    for (const key of Object.keys(global.directives))
      app.directive(key, global.directives[key])
  }

  // provide any values passed via provides mounting option
  if (global?.provide) {
    for (const key of Reflect.ownKeys(global.provide)) {
      // @ts-ignore: https://github.com/microsoft/TypeScript/issues/1863
      app.provide(key, global.provide[key])
    }
  }

  // add tracking for emitted events
  app.mixin(attachEmitListener())

  // stubs
  if (options?.global?.stubs || options?.shallow) {
    stubComponents(options?.global?.stubs, options?.shallow)
  } else {
    transformVNodeArgs()
  }

  // mount the app!
  const vm = app.mount(el)

  const App = vm.$refs[MOUNT_COMPONENT_REF] as ComponentPublicInstance
  return createWrapper(app, App, setProps)
}

export function shallowMount(
  originalComponent,
  options?: MountingOptions<any>
) {
  return mount(originalComponent, { ...options, shallow: true })
}

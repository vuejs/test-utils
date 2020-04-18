import {
  h,
  createApp,
  VNode,
  defineComponent,
  VNodeNormalizedChildren,
  ComponentOptions,
  transformVNodeArgs,
  Plugin,
  Directive,
  Component,
  reactive,
  ComponentPublicInstance
} from 'vue'

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

interface MountingOptions {
  data?: () => Record<string, unknown>
  props?: Record<string, any>
  slots?: {
    default?: Slot
    [key: string]: Slot
  }
  global?: {
    plugins?: Plugin[]
    mixins?: ComponentOptions[]
    mocks?: Record<string, any>
    stubs?: Record<any, any>
    provide?: Record<any, any>
    // TODO how to type `defineComponent`? Using `any` for now.
    components?: Record<string, Component | object>
    directives?: Record<string, Directive>
  }
  stubs?: Record<string, any>
}

export function mount<TestedComponent extends ComponentPublicInstance>(
  originalComponent: new () => TestedComponent,
  options?: MountingOptions
): VueWrapper<TestedComponent>
export function mount(
  originalComponent: Component,
  options?: MountingOptions
): VueWrapper<any>
export function mount(
  originalComponent: any,
  options?: MountingOptions
): VueWrapper<any> {
  const component = { ...originalComponent }

  // Reset the document.body
  document.getElementsByTagName('html')[0].innerHTML = ''
  const el = document.createElement('div')
  el.id = MOUNT_ELEMENT_ID
  document.body.appendChild(el)

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
  const props = reactive({ ...options?.props, ref: MOUNT_COMPONENT_REF })

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

    return app.$nextTick()
  }

  // create the vm
  const vm = createApp(Parent)

  // global mocks mixin
  if (options?.global?.mocks) {
    const mixin = {
      beforeCreate() {
        for (const [k, v] of Object.entries(options.global?.mocks)) {
          this[k] = v
        }
      }
    }

    vm.mixin(mixin)
  }

  // use and plugins from mounting options
  if (options?.global?.plugins) {
    for (const use of options?.global?.plugins) vm.use(use)
  }

  // use any mixins from mounting options
  if (options?.global?.mixins) {
    for (const mixin of options?.global?.mixins) vm.mixin(mixin)
  }

  if (options?.global?.components) {
    for (const key of Object.keys(options?.global?.components))
      vm.component(key, options.global.components[key])
  }

  if (options?.global?.directives) {
    for (const key of Object.keys(options?.global?.directives))
      vm.directive(key, options.global.directives[key])
  }

  // provide any values passed via provides mounting option
  if (options?.global?.provide) {
    for (const key of Reflect.ownKeys(options.global.provide)) {
      // @ts-ignore: https://github.com/microsoft/TypeScript/issues/1863
      vm.provide(key, options.global.provide[key])
    }
  }

  // add tracking for emitted events
  vm.mixin(attachEmitListener())

  // stubs
  if (options?.global?.stubs) {
    stubComponents(options.global.stubs)
  } else {
    transformVNodeArgs()
  }

  // mount the app!
  const app = vm.mount(el)
  const App = app.$refs[MOUNT_COMPONENT_REF] as ComponentPublicInstance
  return createWrapper(App, setProps)
}

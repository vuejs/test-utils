import {
  h,
  createApp,
  VNode,
  defineComponent,
  VNodeNormalizedChildren,
  transformVNodeArgs,
  reactive,
  ComponentPublicInstance
} from 'vue'

import { config } from './config'
import { GlobalMountOptions } from './types'
import { mergeGlobalProperties } from './utils'
import { createWrapper, VueWrapper } from './vue-wrapper'
import { createEmitMixin } from './emitMixin'
import { createDataMixin } from './dataMixin'
import { MOUNT_ELEMENT_ID } from './constants'
import { stubComponents } from './stubs'

type Slot = VNode | string | { render: Function }

interface MountingOptions {
  data?: () => Record<string, unknown>
  props?: Record<string, any>
  slots?: {
    default?: Slot
    [key: string]: Slot
  }
  global?: GlobalMountOptions
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
  const props = reactive({ ...options?.props, ref: 'VTU_COMPONENT' })

  // create the wrapper component
  const Parent = defineComponent({
    name: 'VTU_COMPONENT',
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

  const global = mergeGlobalProperties(config.global, options?.global)

  // global mocks mixin
  if (global?.mocks) {
    const mixin = {
      beforeCreate() {
        for (const [k, v] of Object.entries(global.mocks)) {
          this[k] = v
        }
      }
    }

    vm.mixin(mixin)
  }

  // use and plugins from mounting options
  if (global?.plugins) {
    for (const use of global.plugins) vm.use(use)
  }

  // use any mixins from mounting options
  if (global?.mixins) {
    for (const mixin of global.mixins) vm.mixin(mixin)
  }

  if (global?.components) {
    for (const key of Object.keys(global.components))
      vm.component(key, global.components[key])
  }

  if (global?.directives) {
    for (const key of Object.keys(global.directives))
      vm.directive(key, global.directives[key])
  }

  // provide any values passed via provides mounting option
  if (global?.provide) {
    for (const key of Reflect.ownKeys(global.provide)) {
      // @ts-ignore: https://github.com/microsoft/TypeScript/issues/1863
      vm.provide(key, global.provide[key])
    }
  }

  // add tracking for emitted events
  const { emitMixin, events } = createEmitMixin()
  vm.mixin(emitMixin)

  // stubs
  if (options?.global?.stubs) {
    stubComponents(options.global.stubs)
  } else {
    transformVNodeArgs()
  }

  // mount the app!
  const app = vm.mount(el)

  return createWrapper(app, events, setProps)
}

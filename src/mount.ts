import {
  h,
  createApp,
  VNode,
  defineComponent,
  transformVNodeArgs,
  VNodeNormalizedChildren,
  VNodeProps,
  ComponentOptions,
  Plugin,
  Directive,
  Component
} from 'vue'
import { isEqual, kebabCase } from 'lodash'

import { VueWrapper, createWrapper } from './vue-wrapper'
import { createEmitMixin } from './emitMixin'
import { createDataMixin } from './dataMixin'
import { MOUNT_ELEMENT_ID } from './constants'

type Slot = VNode | string

interface MountingOptions<Props> {
  data?: () => Record<string, unknown>
  shallow?: boolean
  props?: Props
  slots?: {
    default?: Slot
    [key: string]: Slot
  }
  global?: {
    plugins?: Plugin[]
    mixins?: ComponentOptions[]
    provide?: Record<any, any>
    components?: Record<string, Component>
    directives?: Record<string, Directive>
  }
  stubs?: Record<string, any>
}

export function mount<P>(
  originalComponent: any,
  options?: MountingOptions<P>
): VueWrapper {
  const component = { ...originalComponent }

  // Reset the document.body
  document.getElementsByTagName('html')[0].innerHTML = ''
  const el = document.createElement('div')
  el.id = MOUNT_ELEMENT_ID
  document.body.appendChild(el)

  // handle any slots passed via mounting options
  const slots: VNodeNormalizedChildren =
    options?.slots &&
    Object.entries(options.slots).reduce((acc, [name, fn]) => {
      acc[name] = () => fn
      return acc
    }, {})
  // override component data with mounting options data
  if (options?.data) {
    const dataMixin = createDataMixin(options.data())
    component.mixins = [...(component.mixins || []), dataMixin]
  }

  // create the wrapper component
  const PARENT_NAME = 'VTU_PARENT'
  const Parent = (props?: VNodeProps) =>
    defineComponent({
      name: PARENT_NAME,
      render() {
        return h(component, { ...props, ref: 'VTU_COMPONENT' }, slots)
      }
    })

  // create the vm
  const vm = createApp(Parent(options && options.props))

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

  if (options?.shallow) {
    transformVNodeArgs((args, instance) => {
      // VTU Root node. Keep this or there won't be anything to render!
      if (typeof args[0] === 'object' && args[0]['name'] === PARENT_NAME) {
        return args
      }

      // original component we are mounting - don't stub that!
      if (isEqual(args[0], originalComponent)) {
        return args
      }

      // regular HTML tags
      if (typeof args[0] === 'string') {
        return args
      }

      // don't care about comments/fragments
      if (typeof args[0] === 'symbol') {
        return args
      }

      // must be a custom component. Stub!
      const name = kebabCase(args[0]['name'] || 'anonymous')
      return [`${name}-stub`]
    })
  }

  // add tracking for emitted events
  const { emitMixin, events } = createEmitMixin()
  vm.mixin(emitMixin)

  // mount the app!
  const app = vm.mount(el)

  return createWrapper(app, events)
}

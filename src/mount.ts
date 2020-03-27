import {
  h,
  createApp,
  VNode,
  defineComponent,
  VNodeNormalizedChildren,
  VNodeProps,
  ComponentOptions,
  Plugin
} from 'vue'

import { VueWrapper, createWrapper } from './vue-wrapper'
import { createEmitMixin } from './emitMixin'
import { createDataMixin } from './dataMixin'

type Slot = VNode | string

interface MountingOptions<Props> {
  data?: () => Record<string, unknown>
  props?: Props
  slots?: {
    default?: Slot
    [key: string]: Slot
  }
  global?: {
    plugins?: Plugin[]
    mixins?: ComponentOptions[]
  }
  provides?: Record<any, any>
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
  el.id = 'app'
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
  const Parent = (props?: VNodeProps) =>
    defineComponent({
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

  // provide any values passed via provides mounting option
  if (options?.provides) {
    for (const key of Reflect.ownKeys(options.provides)) {
      // @ts-ignore: https://github.com/microsoft/TypeScript/issues/1863
      vm.provide(key, options.provides[key])
    }
  }

  // add tracking for emitted events
  const { emitMixin, events } = createEmitMixin()
  vm.mixin(emitMixin)

  // mount the app!
  const app = vm.mount(el)

  return createWrapper(app, events)
}

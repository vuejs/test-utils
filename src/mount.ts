import { h, createApp, VNode, defineComponent } from 'vue'

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
  },
  stubs?: Record<string, any>
}

export function mount<P>(
  component: any,
  options?: MountingOptions<P>
): VueWrapper {

  document.getElementsByTagName('html')[0].innerHTML = '';
  const el = document.createElement('div')
  el.id = 'app'
  document.body.appendChild(el)

  const slots = options?.slots &&
    Object.entries(options.slots).reduce<Record<string, () => VNode | string>>((acc, [name, fn]) => {
    acc[name] = () => fn
    return acc
  }, {})

  const Parent = (props?: P) => defineComponent({
    render() {
      return h(component, props, slots)
    }
  })

  const vm = createApp(Parent(options && options.props))

  const { emitMixin, events } = createEmitMixin()
  vm.mixin(emitMixin)

  if (options?.data) {
    const dataMixin = createDataMixin(options.data())
    vm.mixin(dataMixin)
  }
  const app = vm.mount('#app')

  return createWrapper(app, events)
}
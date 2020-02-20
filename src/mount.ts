import { h, createApp, VNode, defineComponent, getCurrentInstance } from 'vue'

import { VueWrapper, createWrapper } from './vue-wrapper'

type Slot = VNode | string

interface MountingOptions<Props> {
  props?: Props
  slots?: {
    default?: Slot
    [key: string]: Slot
  },
  stubs?: Record<string, any>
}

export function mount<P>(
  component: any,
  // component: new () => ComponentPublicInstance<P>,
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

  const events: Record<string, unknown[]> = {}
  const emitMixin = {
    beforeCreate() {
      const originalEmit = getCurrentInstance().emit
      getCurrentInstance().emit = (event: string, ...args: unknown[]) => {
        events[event] 
          ? events[event] = [...events[event], [...args]]
          : events[event] = [[...args]]

        return originalEmit.call(getCurrentInstance(), event, ...args)
      }

    }
  }

  const vm = createApp(Parent(options && options.props))
  vm.mixin(emitMixin)
  const app = vm.mount('#app')

  return createWrapper(app, events)
}
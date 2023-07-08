import { nextTick, App, ComponentPublicInstance, VNode } from 'vue'

import { config } from './config'
import domEvents from './constants/dom-events'
import { VueElement, VueNode } from './types'
import { hasSetupState, mergeDeep } from './utils'
import { getRootNodes } from './utils/getRootNodes'
import { emitted, recordEvent, removeEventHistory } from './emit'
import BaseWrapper from './baseWrapper'
import type { DOMWrapper } from './domWrapper'
import {
  createDOMWrapper,
  registerFactory,
  WrapperType
} from './wrapperFactory'
import { ShapeFlags } from './utils/vueShared'

/**
 * Creates a proxy around the VM instance.
 * This proxy returns the value from the setupState if there is one, or the one from the VM if not.
 * See https://github.com/vuejs/core/issues/7103
 */
function createVMProxy<T extends ComponentPublicInstance>(
  vm: T,
  setupState: Record<string, any>
): T {
  return new Proxy(vm, {
    get(vm, key, receiver) {
      if (vm.$.exposed && vm.$.exposeProxy && key in vm.$.exposeProxy) {
        // first if the key is exposed
        return Reflect.get(vm.$.exposeProxy, key, receiver)
      } else if (key in setupState) {
        // second if the key is acccessible from the setupState
        return Reflect.get(setupState, key, receiver)
      } else {
        // vm.$.ctx is the internal context of the vm
        // with all variables, methods and props
        return (vm as any).$.ctx[key]
      }
    },
    set(vm, key, value, receiver) {
      if (key in setupState) {
        return Reflect.set(setupState, key, value, receiver)
      } else {
        return Reflect.set(vm, key, value, receiver)
      }
    },
    has(vm, property) {
      return Reflect.has(setupState, property) || Reflect.has(vm, property)
    },
    defineProperty(vm, key, attributes) {
      if (key in setupState) {
        return Reflect.defineProperty(setupState, key, attributes)
      } else {
        return Reflect.defineProperty(vm, key, attributes)
      }
    },
    getOwnPropertyDescriptor(vm, property) {
      if (property in setupState) {
        return Reflect.getOwnPropertyDescriptor(setupState, property)
      } else {
        return Reflect.getOwnPropertyDescriptor(vm, property)
      }
    },
    deleteProperty(vm, property) {
      if (property in setupState) {
        return Reflect.deleteProperty(setupState, property)
      } else {
        return Reflect.deleteProperty(vm, property)
      }
    }
  })
}

export class VueWrapper<
  VM = unknown,
  T extends ComponentPublicInstance = VM & ComponentPublicInstance
> extends BaseWrapper<Node> {
  private readonly componentVM: T
  private readonly rootVM: ComponentPublicInstance | undefined | null
  private readonly __app: App | null
  private readonly __setProps:
    | ((props: Record<string, unknown>) => void)
    | undefined
  private cleanUpCallbacks: Array<() => void> = []

  constructor(
    app: App | null,
    vm: T,
    setProps?: (props: Record<string, unknown>) => void
  ) {
    super(vm?.$el)
    this.__app = app
    // root is null on functional components
    this.rootVM = vm?.$root
    // `vm.$.setupState` is what the template has access to
    // so even if the component is closed (as they are by default for `script setup`)
    // a test will still be able to do something like
    // `expect(wrapper.vm.count).toBe(1)`
    // if we return it as `vm`
    // This does not work for functional components though (as they have no vm)
    // or for components with a setup that returns a render function (as they have an empty proxy)
    // in both cases, we return `vm` directly instead
    if (hasSetupState(vm)) {
      this.componentVM = createVMProxy<T>(vm, vm.$.setupState)
    } else {
      this.componentVM = vm
    }
    this.__setProps = setProps

    this.attachNativeEventListener()

    config.plugins.VueWrapper.extend(this)
  }

  private get hasMultipleRoots(): boolean {
    // Recursive check subtree for nested root elements
    // <template>
    //   <WithMultipleRoots />
    // </template>
    const checkTree = (subTree: VNode): boolean => {
      // if the subtree is an array of children, we have multiple root nodes
      if (subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN) return true
      if (
        subTree.shapeFlag & ShapeFlags.STATEFUL_COMPONENT ||
        subTree.shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT
      ) {
        // We are rendering other component, check it's tree instead
        if (subTree.component?.subTree) {
          return checkTree(subTree.component.subTree)
        }

        // Component has multiple children
        if (subTree.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          return true
        }
      }

      return false
    }

    return checkTree(this.vm.$.subTree)
  }

  protected getRootNodes(): VueNode[] {
    return getRootNodes(this.vm.$.vnode)
  }

  private get parentElement(): VueElement {
    return this.vm.$el.parentElement
  }

  getCurrentComponent() {
    return this.vm.$
  }

  exists() {
    return !this.getCurrentComponent().isUnmounted
  }

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[] {
    return this.findAllDOMElements(selector).map(createDOMWrapper)
  }

  private attachNativeEventListener(): void {
    const vm = this.vm
    if (!vm) return

    const emits = vm.$options.emits
      ? // if emits is declared as an array
        Array.isArray(vm.$options.emits)
        ? // use it
          vm.$options.emits
        : // otherwise it's declared as an object
          // and we only need the keys
          Object.keys(vm.$options.emits)
      : []

    const elementRoots = this.getRootNodes().filter(
      (node): node is Element => node instanceof Element
    )
    if (elementRoots.length !== 1) {
      return
    }
    const [element] = elementRoots
    for (let eventName of Object.keys(domEvents)) {
      // if a component includes events in 'emits' with the same name as native
      // events, the native events with that name should be ignored
      // @see https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md#fallthrough-control
      if (emits.includes(eventName)) continue

      const eventListener: EventListener = (...args) => {
        recordEvent(vm.$, eventName, args)
      }
      element.addEventListener(eventName, eventListener)
      this.cleanUpCallbacks.push(() => {
        element.removeEventListener(eventName, eventListener)
      })
    }
  }

  get element(): Element {
    // if the component has multiple root elements, we use the parent's element
    return this.hasMultipleRoots ? this.parentElement : this.vm.$el
  }

  get vm(): T {
    return this.componentVM
  }

  props(): { [key: string]: any }
  props(selector: string): any
  props(selector?: string): { [key: string]: any } | any {
    const props = this.componentVM.$props as { [key: string]: any }
    return selector ? props[selector] : props
  }

  emitted<T = unknown>(): Record<string, T[]>
  emitted<T = unknown[]>(eventName: string): undefined | T[]
  emitted<T = unknown>(
    eventName?: string
  ): undefined | T[] | Record<string, T[]> {
    return emitted(this.vm, eventName)
  }

  isVisible(): boolean {
    const domWrapper = createDOMWrapper(this.element)
    return domWrapper.isVisible()
  }

  setData(data: Record<string, unknown>): Promise<void> {
    mergeDeep(this.componentVM.$data, data)
    return nextTick()
  }

  setProps(props: Record<string, unknown>): Promise<void> {
    // if this VM's parent is not the root or if setProps does not exist, error out
    if (this.vm.$parent !== this.rootVM || !this.__setProps) {
      throw Error('You can only use setProps on your mounted component')
    }
    this.__setProps(props)
    return nextTick()
  }

  setValue(value: unknown, prop?: string): Promise<void> {
    const propEvent = prop || 'modelValue'
    this.vm.$emit(`update:${propEvent}`, value)
    return this.vm.$nextTick()
  }

  unmount() {
    // preventing dispose of child component
    if (!this.__app) {
      throw new Error(
        `wrapper.unmount() can only be called by the root wrapper`
      )
    }
    // Clear emitted events cache for this component instance
    removeEventHistory(this.vm)

    this.cleanUpCallbacks.forEach((cb) => cb())
    this.cleanUpCallbacks = []

    this.__app.unmount()
  }
}

registerFactory(
  WrapperType.VueWrapper,
  (app, vm, setProps) => new VueWrapper(app, vm, setProps)
)

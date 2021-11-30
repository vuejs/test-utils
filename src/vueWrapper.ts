import {
  nextTick,
  App,
  ComponentCustomProperties,
  ComponentPublicInstance
} from 'vue'
import { ShapeFlags } from '@vue/shared'
// @ts-ignore todo - No DefinitelyTyped package exists for this
import pretty from 'pretty'

import { config } from './config'
import domEvents from './constants/dom-events'
import { VueElement, VueNode } from './types'
import { mergeDeep } from './utils'
import { getRootNodes } from './utils/getRootNodes'
import { emitted, recordEvent } from './emit'
import BaseWrapper from './baseWrapper'
import {
  createDOMWrapper,
  registerFactory,
  WrapperType
} from './wrapperFactory'

export class VueWrapper<
  T extends Omit<
    ComponentPublicInstance,
    '$emit' | keyof ComponentCustomProperties
  > & {
    $emit: (event: any, ...args: any[]) => void
  } & ComponentCustomProperties = ComponentPublicInstance
> extends BaseWrapper<Node> {
  private componentVM: T
  private rootVM: ComponentPublicInstance | undefined | null
  private __app: App | null
  private __setProps: ((props: Record<string, unknown>) => void) | undefined

  constructor(
    app: App | null,
    vm: T,
    setProps?: (props: Record<string, unknown>) => void
  ) {
    super(vm?.$el)
    this.__app = app
    // root is null on functional components
    this.rootVM = vm?.$root
    // `vm.$.proxy` is what the template has access to
    // so even if the component is closed (as they are by default for `script setup`)
    // a test will still be able to do something like
    // `expect(wrapper.vm.count).toBe(1)`
    // if we return it as `vm`
    // This does not work for functional components though (as they have no vm)
    // or for components with a setup that returns a render function (as they have an empty proxy)
    // in both cases, we return `vm` directly instead
    this.componentVM =
      vm &&
      // a component with a setup that returns a render function will have no `devtoolsRawSetupState`
      (vm.$ as unknown as { devtoolsRawSetupState: any }).devtoolsRawSetupState
        ? ((vm.$ as any).proxy as T)
        : (vm as T)
    this.__setProps = setProps

    this.attachNativeEventListener()

    config.plugins.VueWrapper.extend(this)
  }

  private get hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.vm.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
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
    const element = this.element
    for (let eventName of Object.keys(domEvents)) {
      // if a component includes events in 'emits' with the same name as native
      // events, the native events with that name should be ignored
      // @see https://github.com/vuejs/rfcs/blob/master/active-rfcs/0030-emits-option.md#fallthrough-control
      if (emits.includes(eventName)) continue

      element.addEventListener(eventName, (...args) => {
        recordEvent(vm.$, eventName, args)
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
  emitted<T = unknown>(eventName: string): undefined | T[]
  emitted<T = unknown>(
    eventName?: string
  ): undefined | T[] | Record<string, T[]> {
    return emitted(this.vm, eventName)
  }

  html() {
    // cover cases like <Suspense>, multiple root nodes.
    if (this.parentElement['__vue_app__']) {
      return pretty(this.parentElement.innerHTML)
    }

    return pretty(this.element.outerHTML)
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

    this.__app.unmount()
  }
}

registerFactory(
  WrapperType.VueWrapper,
  (app, vm, setProps) => new VueWrapper(app, vm, setProps)
)

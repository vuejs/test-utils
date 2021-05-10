import { ComponentPublicInstance, nextTick, App } from 'vue'
import { ShapeFlags } from '@vue/shared'
// @ts-ignore todo - No DefinitelyTyped package exists for this
import eventTypes from 'dom-event-types'
import pretty from 'pretty'

import { config } from './config'
import { DOMWrapper } from './domWrapper'
import {
  FindAllComponentsSelector,
  FindComponentSelector,
  VueElement
} from './types'
import { createWrapperError } from './errorWrapper'
import { find, matches } from './utils/find'
import { mergeDeep } from './utils'
import { emitted, recordEvent } from './emit'
import BaseWrapper from './baseWrapper'
import WrapperLike from './interfaces/wrapperLike'

export class VueWrapper<T extends ComponentPublicInstance>
  extends BaseWrapper<T['$el']>
  implements WrapperLike
{
  private componentVM: T
  private rootVM: ComponentPublicInstance | null
  private __app: App | null
  private __setProps: ((props: Record<string, any>) => void) | undefined

  constructor(
    app: App | null,
    vm: ComponentPublicInstance,
    setProps?: (props: Record<string, any>) => void
  ) {
    super(vm?.$el)
    this.__app = app
    // root is null on functional components
    this.rootVM = vm?.$root
    this.componentVM = vm as T
    this.__setProps = setProps

    this.attachNativeEventListener()

    config.plugins.VueWrapper.extend(this)
  }

  private get hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.vm.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
  }

  private get parentElement(): VueElement {
    return this.vm.$el.parentElement
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
    for (let eventName of Object.keys(eventTypes)) {
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

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  find<T extends Element>(selector: string): DOMWrapper<T>
  find(selector: string): DOMWrapper<Element> {
    const result = this.parentElement['__vue_app__']
      ? // force using the parentElement to allow finding the root element
        this.parentElement.querySelector(selector)
      : this.element.querySelector(selector)

    if (result) {
      return new DOMWrapper(result)
    }

    return createWrapperError('DOMWrapper')
  }

  get<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
  get<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
  get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
  get(selector: string): Omit<DOMWrapper<Element>, 'exists'> {
    const result = this.find(selector)
    if (result instanceof DOMWrapper) {
      return result
    }

    throw new Error(`Unable to get ${selector} within: ${this.html()}`)
  }

  findComponent<T extends ComponentPublicInstance>(
    selector: new () => T
  ): VueWrapper<T>
  findComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector
  ): VueWrapper<T>
  findComponent<T extends ComponentPublicInstance>(
    selector: any
  ): VueWrapper<T> {
    if (typeof selector === 'object' && 'ref' in selector) {
      const result = this.vm.$refs[selector.ref]
      if (result) {
        return createWrapper(null, result as T)
      }
    }

    const result = find(this.vm.$.subTree, selector)
    if (result.length) {
      return createWrapper(null, result[0])
    }

    // https://github.com/vuejs/vue-test-utils-next/issues/211
    // VTU v1 supported finding the component mounted itself.
    // eg: mount(Comp).findComponent(Comp)
    // this is the same as doing `wrapper.vm`, but we keep this behavior for back compat.
    if (matches(this.vm.$.vnode, selector)) {
      return createWrapper(null, this.vm.$.vnode.component?.proxy!)
    }

    return createWrapperError('VueWrapper')
  }

  getComponent<T extends ComponentPublicInstance>(
    selector: new () => T
  ): Omit<VueWrapper<T>, 'exists'>
  getComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector
  ): Omit<VueWrapper<T>, 'exists'>
  getComponent<T extends ComponentPublicInstance>(
    selector: any
  ): Omit<VueWrapper<T>, 'exists'> {
    const result = this.findComponent(selector)

    if (result instanceof VueWrapper) {
      return result as VueWrapper<T>
    }

    let message = 'Unable to get '
    if (typeof selector === 'string') {
      message += `component with selector ${selector}`
    } else if (selector.name) {
      message += `component with name ${selector.name}`
    } else if (selector.ref) {
      message += `component with ref ${selector.ref}`
    } else {
      message += 'specified component'
    }
    message += ` within: ${this.html()}`
    throw new Error(message)
  }

  findAllComponents(selector: FindAllComponentsSelector): VueWrapper<T>[] {
    return find(this.vm.$.subTree, selector).map((c) => createWrapper(null, c))
  }

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[] {
    const results = this.parentElement['__vue_app__']
      ? this.parentElement.querySelectorAll(selector)
      : this.element.querySelectorAll(selector)

    return Array.from(results).map((element) => new DOMWrapper(element))
  }

  setData(data: Record<string, any>): Promise<void> {
    mergeDeep(this.componentVM.$data, data)
    return nextTick()
  }

  setProps(props: Record<string, any>): Promise<void> {
    // if this VM's parent is not the root or if setProps does not exist, error out
    if (this.vm.$parent !== this.rootVM || !this.__setProps) {
      throw Error('You can only use setProps on your mounted component')
    }
    this.__setProps(props)
    return nextTick()
  }

  setValue(value: any, prop?: string): Promise<void> {
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

export function createWrapper<T extends ComponentPublicInstance>(
  app: App | null,
  vm: ComponentPublicInstance,
  setProps?: (props: Record<string, any>) => void
): VueWrapper<T> {
  return new VueWrapper<T>(app, vm, setProps)
}

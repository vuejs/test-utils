import { ComponentPublicInstance, nextTick, App } from 'vue'
import { ShapeFlags } from '@vue/shared'

import { config } from './config'
import { DOMWrapper } from './dom-wrapper'
import {
  FindAllComponentsSelector,
  FindComponentSelector,
  VueWrapperAPI
} from './types'
import { ErrorWrapper } from './error-wrapper'
import { TriggerOptions } from './create-dom-event'
import { find } from './utils/find'

export class VueWrapper<T extends ComponentPublicInstance>
  implements VueWrapperAPI<T> {
  private componentVM: T
  private rootVM: ComponentPublicInstance
  private __app: App | null
  private __setProps: (props: Record<string, any>) => void

  constructor(
    app: App | null,
    vm: ComponentPublicInstance,
    setProps?: (props: Record<string, any>) => void
  ) {
    this.__app = app
    this.rootVM = vm.$root
    this.componentVM = vm as T
    this.__setProps = setProps
    // plugins hook
    config.plugins.VueWrapper.extend(this)
  }

  private get hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.vm.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
  }

  private get parentElement(): Element {
    return this.vm.$el.parentElement
  }

  get element(): Element {
    // if the component has multiple root elements, we use the parent's element
    return this.hasMultipleRoots ? this.parentElement : this.vm.$el
  }

  get vm(): T {
    return this.componentVM
  }

  props(selector?: string) {
    return selector
      ? this.componentVM.$props[selector]
      : this.componentVM.$props
  }

  classes(className?: string) {
    return new DOMWrapper(this.element).classes(className)
  }

  attributes(key?: string) {
    return new DOMWrapper(this.element).attributes(key)
  }

  exists() {
    return true
  }

  emitted(): Record<string, unknown[]> {
    // TODO Should we define this?
    // @ts-ignore
    return this.vm.__emitted
  }

  html() {
    return this.parentElement.innerHTML
  }

  text() {
    return this.element.textContent?.trim()
  }

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]> | ErrorWrapper
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]> | ErrorWrapper
  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper
  find(selector: string): DOMWrapper<Element> | ErrorWrapper {
    // force using the parentElement to allow finding the root element
    const result = this.parentElement.querySelector(selector)
    if (result) {
      return new DOMWrapper(result)
    }

    return new ErrorWrapper({ selector })
  }

  get<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  get<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  get<T extends Element>(selector: string): DOMWrapper<T>
  get(selector: string): DOMWrapper<Element> {
    const result = this.find(selector)
    if (result instanceof ErrorWrapper) {
      throw new Error(`Unable to get ${selector} within: ${this.html()}`)
    }

    return result
  }

  findComponent<T extends ComponentPublicInstance>(
    selector: new () => T
  ): VueWrapper<T> | ErrorWrapper
  findComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector
  ): VueWrapper<T> | ErrorWrapper
  findComponent<T extends ComponentPublicInstance>(
    selector: any
  ): VueWrapper<T> | ErrorWrapper {
    if (typeof selector === 'object' && 'ref' in selector) {
      const result = this.vm.$refs[selector.ref]
      return result
        ? createWrapper(null, result as T)
        : new ErrorWrapper({ selector })
    }

    const result = find(this.vm.$.subTree, selector)
    if (!result.length) return new ErrorWrapper({ selector })
    return createWrapper(null, result[0])
  }

  getComponent<T extends ComponentPublicInstance>(
    selector: new () => T
  ): VueWrapper<T>
  getComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector
  ): VueWrapper<T>
  getComponent<T extends ComponentPublicInstance>(
    selector: any
  ): VueWrapper<T> {
    const result = this.findComponent(selector)
    if (result instanceof ErrorWrapper) {
      throw new Error(
        `Unable to get component with selector ${selector} within: ${this.html()}`
      )
    }

    return result as VueWrapper<T>
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
    const results = this.parentElement.querySelectorAll(selector)
    return Array.from(results).map((element) => new DOMWrapper(element))
  }

  setProps(props: Record<string, any>): Promise<void> {
    // if this VM's parent is not the root, error out
    if (this.vm.$parent !== this.rootVM) {
      throw Error('You can only use setProps on your mounted component')
    }
    this.__setProps(props)
    return nextTick()
  }

  trigger(eventString: string, options?: TriggerOptions) {
    const rootElementWrapper = new DOMWrapper(this.element)
    return rootElementWrapper.trigger(eventString, options)
  }

  unmount() {
    // preventing dispose of child component
    if (!this.__app) {
      throw new Error(
        `wrapper.unmount() can only be called by the root wrapper`
      )
    }

    if (this.parentElement) {
      this.parentElement.removeChild(this.element)
    }
    this.__app.unmount(this.element)
  }
}

export function createWrapper<T extends ComponentPublicInstance>(
  app: App,
  vm: ComponentPublicInstance,
  setProps?: (props: Record<string, any>) => void
): VueWrapper<T> {
  return new VueWrapper<T>(app, vm, setProps)
}

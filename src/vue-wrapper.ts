import { ComponentPublicInstance, nextTick, App, render } from 'vue'
import { ShapeFlags } from '@vue/shared'

import { DOMWrapper } from './dom-wrapper'
import {
  FindAllComponentsSelector,
  FindComponentSelector,
  WrapperAPI
} from './types'
import { ErrorWrapper } from './error-wrapper'
import { find } from './utils/find'

export class VueWrapper<T extends ComponentPublicInstance>
  implements WrapperAPI {
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

  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper {
    // force using the parentElement to allow finding the root element
    const result = this.parentElement.querySelector(selector) as T
    if (result) {
      return new DOMWrapper(result)
    }

    return new ErrorWrapper({ selector })
  }

  get<T extends Element>(selector: string): DOMWrapper<T> {
    const result = this.find<T>(selector)
    if (result instanceof ErrorWrapper) {
      throw new Error(`Unable to find ${selector} within: ${this.html()}`)
    }

    return result
  }

  findComponent(selector: FindComponentSelector): VueWrapper<T> | ErrorWrapper {
    if (typeof selector === 'object' && 'ref' in selector) {
      return createWrapper(null, this.vm.$refs[selector.ref] as T)
    }
    const result = find(this.vm.$.subTree, selector)
    if (!result.length) return new ErrorWrapper({ selector })
    return createWrapper(null, result[0])
  }

  findAllComponents(selector: FindAllComponentsSelector): VueWrapper<T>[] {
    return find(this.vm.$.subTree, selector).map((c) => createWrapper(null, c))
  }

  findAll<T extends Element>(selector: string): DOMWrapper<T>[] {
    const results = this.parentElement.querySelectorAll<T>(selector)
    return Array.from(results).map((x) => new DOMWrapper(x))
  }

  setProps(props: Record<string, any>): Promise<void> {
    // if this VM's parent is not the root, error out
    if (this.vm.$parent !== this.rootVM) {
      throw Error('You can only use setProps on your mounted component')
    }
    this.__setProps(props)
    return nextTick()
  }

  trigger(eventString: string) {
    const rootElementWrapper = new DOMWrapper(this.element)
    return rootElementWrapper.trigger(eventString)
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

import { ComponentPublicInstance, nextTick } from 'vue'
import { ShapeFlags } from '@vue/shared'
import merge from 'lodash/merge'

import { DOMWrapper } from './dom-wrapper'
import { WrapperAPI } from './types'
import { ErrorWrapper } from './error-wrapper'
import { MOUNT_ELEMENT_ID } from './constants'

export class VueWrapper<T extends ComponentPublicInstance>
  implements WrapperAPI {
  private componentVM: T
  private __emitted: Record<string, unknown[]> = {}
  private __vm: ComponentPublicInstance
  private __setProps: (props: Record<string, any>) => void

  constructor(
    vm: ComponentPublicInstance,
    events: Record<string, unknown[]>,
    setProps: (props: Record<string, any>) => void
  ) {
    this.__vm = vm
    this.__setProps = setProps
    this.componentVM = this.__vm.$refs['VTU_COMPONENT'] as T
    this.__emitted = events
  }

  private get appRootNode() {
    return document.getElementById(MOUNT_ELEMENT_ID) as HTMLDivElement
  }

  private get hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.componentVM.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
  }

  private get parentElement(): Element {
    return this.componentVM.$el.parentElement
  }

  get element(): Element {
    // if the component has multiple root elements, we use the parent's element
    return this.hasMultipleRoots ? this.parentElement : this.componentVM.$el
  }

  get vm(): T {
    return this.componentVM
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

  emitted() {
    return this.__emitted
  }

  html() {
    return this.appRootNode.innerHTML
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

  findAll<T extends Element>(selector: string): DOMWrapper<T>[] {
    const results = this.appRootNode.querySelectorAll<T>(selector)
    return Array.from(results).map((x) => new DOMWrapper(x))
  }

  setProps(props: Record<string, any>) {
    this.__setProps(props)
    return nextTick()
  }

  setData(data: Record<string, any>) {
    // lodash.merge merges by *reference* so this will update
    // any existing data with the newly passed data.
    merge(this.componentVM.$data, data)
    return nextTick()
  }

  trigger(eventString: string) {
    const rootElementWrapper = new DOMWrapper(this.element)
    return rootElementWrapper.trigger(eventString)
  }
}

export function createWrapper<T extends ComponentPublicInstance>(
  vm: ComponentPublicInstance,
  events: Record<string, unknown[]>,
  setProps: (props: Record<string, any>) => void
): VueWrapper<T> {
  return new VueWrapper<T>(vm, events, setProps)
}

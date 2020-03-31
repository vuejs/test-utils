import { ComponentPublicInstance } from 'vue'
import { ShapeFlags } from '@vue/shared'

import { DOMWrapper } from './dom-wrapper'
import { WrapperAPI } from './types'
import { ErrorWrapper } from './error-wrapper'
import { MOUNT_ELEMENT_ID } from './constants'

export class VueWrapper implements WrapperAPI {
  rootVM: ComponentPublicInstance
  componentVM: ComponentPublicInstance
  __emitted: Record<string, unknown[]> = {}

  constructor(vm: ComponentPublicInstance, events: Record<string, unknown[]>) {
    this.rootVM = vm
    this.componentVM = this.rootVM.$refs[
      'VTU_COMPONENT'
    ] as ComponentPublicInstance
    this.__emitted = events
  }

  private get appRootNode() {
    return document.getElementById(MOUNT_ELEMENT_ID) as HTMLDivElement
  }

  private get hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.componentVM.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
  }

  get element() {
    return this.hasMultipleRoots
      ? // get the parent element of the current component
        this.componentVM.$el.parentElement
      : this.componentVM.$el
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
    const result = this.appRootNode.querySelector(selector) as T
    if (result) {
      return new DOMWrapper(result)
    }

    return new ErrorWrapper({ selector })
  }

  findAll<T extends Element>(selector: string): DOMWrapper<T>[] {
    const results = this.appRootNode.querySelectorAll<T>(selector)
    return Array.from(results).map((x) => new DOMWrapper(x))
  }

  async setChecked(checked: boolean = true) {
    return new DOMWrapper(this.element).setChecked(checked)
  }

  trigger(eventString: string) {
    const rootElementWrapper = new DOMWrapper(this.element)
    return rootElementWrapper.trigger(eventString)
  }
}

export function createWrapper(
  vm: ComponentPublicInstance,
  events: Record<string, unknown[]>
): VueWrapper {
  return new VueWrapper(vm, events)
}

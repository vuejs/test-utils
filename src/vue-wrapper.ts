import { ComponentPublicInstance } from 'vue'

import { DOMWrapper } from './dom-wrapper'
import { WrapperAPI } from './types'
import { ErrorWrapper } from './error-wrapper'

export class VueWrapper implements WrapperAPI {
  vm: ComponentPublicInstance
  __emitted: Record<string, unknown[]> = {}

  constructor(vm: ComponentPublicInstance, events: Record<string, unknown[]>) {
    this.vm = vm
    this.__emitted = events
  }

  classes(): string[] {
    throw Error('TODO: Implement VueWrapper#classes')
  }

  exists() {
    return true
  }

  emitted() {
    return this.__emitted
  }

  html() {
    return this.vm.$el.outerHTML
  }

  text() {
    return this.vm.$el.textContent?.trim()
  }

  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper {
    const result = this.vm.$el.querySelector(selector) as T
    if (result) {
      return new DOMWrapper(result)
    }

    return new ErrorWrapper({ selector })
  }

  findAll<T extends Element>(selector: string): DOMWrapper<T>[] {
    const results = (this.vm.$el as Element).querySelectorAll<T>(selector)
    return Array.from(results).map(x => new DOMWrapper(x))
  }

  async setChecked(checked: boolean = true) {
    return new DOMWrapper(this.vm.$el).setChecked(checked)
  }


  trigger(eventString: string) { 
    const rootElementWrapper = new DOMWrapper(this.vm.$el)
    return rootElementWrapper.trigger(eventString)
  }
}

export function createWrapper(vm: ComponentPublicInstance, events: Record<string, unknown[]>): VueWrapper {
  return new VueWrapper(vm, events)
}

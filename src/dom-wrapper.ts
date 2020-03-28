import { nextTick } from 'vue'

import { WrapperAPI } from './types'
import { ErrorWrapper } from './error-wrapper'

export class DOMWrapper<ElementType extends Element> implements WrapperAPI {
  element: ElementType

  constructor(element: ElementType) {
    this.element = element
  }

  classes(className?) {
    const classes = this.element.classList

    if (className) return classes.contains(className)

    return Array.from(classes)
  }

  attributes(key?: string) {
    const attributes = this.element.attributes
    const attributeMap = {}
    for (let i = 0; i < attributes.length; i++) {
      const att = attributes.item(i)
      attributeMap[att.localName] = att.value
    }

    return key ? attributeMap[key] : attributeMap
  }

  exists() {
    return true
  }

  text() {
    return this.element.textContent?.trim()
  }

  html() {
    return this.element.outerHTML
  }

  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper {
    const result = this.element.querySelector<T>(selector)
    if (result) {
      return new DOMWrapper<T>(result)
    }

    return new ErrorWrapper({ selector })
  }

  findAll<T extends Element>(selector: string): DOMWrapper<T>[] {
    return Array.from(this.element.querySelectorAll<T>(selector)).map(
      (x) => new DOMWrapper(x)
    )
  }

  async setChecked(checked: boolean = true) {
    // typecast so we get typesafety
    const element = (this.element as unknown) as HTMLInputElement

    if (element.tagName !== 'INPUT') {
      throw Error(
        `You need to call setChecked on an input element. You called it on a ${this.element.tagName}`
      )
    }

    // we do not want to trigger an event if the user
    // attempting set the same value twice
    // this is beacuse in a browser setting checked = true when it is
    // already true is a no-op; no change event is triggered
    if (checked === element.checked) {
      return
    }

    element.checked = checked
    return this.trigger('change')
  }

  async trigger(eventString: string) {
    const evt = document.createEvent('Event')
    evt.initEvent(eventString)

    if (this.element) {
      this.element.dispatchEvent(evt)
      return nextTick
    }
  }
}

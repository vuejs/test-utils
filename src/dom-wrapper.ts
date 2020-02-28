import { nextTick } from 'vue'

import { WrapperAPI } from './types'
import { ErrorWrapper } from './error-wrapper'

export class DOMWrapper<ElementType extends Element> implements WrapperAPI {
  element: ElementType

  constructor(element: ElementType) {
    this.element = element
  }

  classes() {
    return Array.from(this.element.classList)
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
    return Array.from(this.element.querySelectorAll<T>(selector)).map(x => new DOMWrapper(x))
  }

  async setChecked(checked: boolean = true) {
    if (this.element.tagName === 'INPUT') {
      (this.element as unknown as HTMLInputElement).checked = checked
      return this.trigger('change')
    }
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

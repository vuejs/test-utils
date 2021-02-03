import { nextTick } from 'vue'

import { createWrapperError } from './errorWrapper'
import { TriggerOptions, createDOMEvent } from './createDomEvent'
import { config } from './config'
import { isElementVisible } from './utils/isElementVisible'
import { textContent } from './utils'

export class DOMWrapper<ElementType extends Element> {
  element: ElementType

  constructor(element: ElementType) {
    this.element = element
    // plugins hook
    config.plugins.DOMWrapper.extend(this)
  }

  classes(): string[]
  classes(className: string): boolean
  classes(className?: string): string[] | boolean {
    const classes = this.element.classList

    if (className) return classes.contains(className)

    return Array.from(classes)
  }

  attributes(): { [key: string]: string }
  attributes(key: string): string
  attributes(key?: string): { [key: string]: string } | string {
    const attributes = Array.from(this.element.attributes)
    const attributeMap: Record<string, string> = {}
    for (const attribute of attributes) {
      attributeMap[attribute.localName] = attribute.value
    }

    return key ? attributeMap[key] : attributeMap
  }

  exists() {
    return true
  }

  isVisible() {
    return isElementVisible(this.element)
  }

  text() {
    return textContent(this.element)
  }

  html() {
    return this.element.outerHTML
  }

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  find<T extends Element>(selector: string): DOMWrapper<T>
  find(selector: string): DOMWrapper<Element> {
    const result = this.element.querySelector(selector)
    if (result) {
      return new DOMWrapper(result)
    }

    return createWrapperError('DOMWrapper')
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
    if (result instanceof DOMWrapper) {
      return result
    }

    throw new Error(`Unable to get ${selector} within: ${this.html()}`)
  }

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[] {
    return Array.from(this.element.querySelectorAll(selector)).map(
      (x) => new DOMWrapper(x)
    )
  }

  private async setChecked(checked: boolean = true) {
    // typecast so we get type safety
    const element = (this.element as unknown) as HTMLInputElement
    const type = this.attributes().type

    if (type === 'radio' && !checked) {
      throw Error(
        `wrapper.setChecked() cannot be called with parameter false on a '<input type="radio" /> element.`
      )
    }

    // we do not want to trigger an event if the user
    // attempting set the same value twice
    // this is because in a browser setting checked = true when it is
    // already true is a no-op; no change event is triggered
    if (checked === element.checked) {
      return
    }

    element.checked = checked
    return this.trigger('change')
  }

  setValue(value?: any) {
    const element = (this.element as unknown) as HTMLInputElement
    const tagName = element.tagName
    const type = this.attributes().type

    if (tagName === 'OPTION') {
      return this.setSelected()
    } else if (tagName === 'INPUT' && type === 'checkbox') {
      return this.setChecked(value)
    } else if (tagName === 'INPUT' && type === 'radio') {
      return this.setChecked(value)
    } else if (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT'
    ) {
      element.value = value

      if (tagName === 'SELECT') {
        return this.trigger('change')
      }
      this.trigger('input')
      // trigger `change` for `v-model.lazy`
      return this.trigger('change')
    } else {
      throw Error(`wrapper.setValue() cannot be called on ${tagName}`)
    }
  }

  private setSelected() {
    const element = (this.element as unknown) as HTMLOptionElement

    if (element.selected) {
      return
    }

    element.selected = true
    let parentElement = element.parentElement

    if (parentElement.tagName === 'OPTGROUP') {
      parentElement = parentElement.parentElement
    }

    return new DOMWrapper(parentElement).trigger('change')
  }

  async trigger(eventString: string, options?: TriggerOptions) {
    if (options && options['target']) {
      throw Error(
        `[vue-test-utils]: you cannot set the target value of an event. See the notes section ` +
          `of the docs for more details—` +
          `https://vue-test-utils.vuejs.org/api/wrapper/trigger.html`
      )
    }

    const isDisabled = () => {
      const validTagsToBeDisabled = [
        'BUTTON',
        'COMMAND',
        'FIELDSET',
        'KEYGEN',
        'OPTGROUP',
        'OPTION',
        'SELECT',
        'TEXTAREA',
        'INPUT'
      ]
      const hasDisabledAttribute = this.attributes().disabled !== undefined
      const elementCanBeDisabled = validTagsToBeDisabled.includes(
        this.element.tagName
      )

      return hasDisabledAttribute && elementCanBeDisabled
    }

    if (this.element && !isDisabled()) {
      const event = createDOMEvent(eventString, options)
      this.element.dispatchEvent(event)
    }

    return nextTick
  }
}

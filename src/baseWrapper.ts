import { textContent } from './utils'
import type { TriggerOptions } from './createDomEvent'
import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  nextTick
} from 'vue'
import { createDOMEvent } from './createDomEvent'
import { DomEventNameWithModifier } from './constants/dom-events'
import type { VueWrapper } from './vueWrapper'
import type { DOMWrapper } from './domWrapper'
import { FindAllComponentsSelector, FindComponentSelector } from './types'

export default abstract class BaseWrapper<ElementType extends Element> {
  private readonly wrapperElement: ElementType & {
    __vueParentComponent?: ComponentInternalInstance
  }

  get element() {
    return this.wrapperElement
  }

  constructor(element: ElementType) {
    this.wrapperElement = element
  }

  abstract find(selector: string): DOMWrapper<Element>
  abstract findAll(selector: string): DOMWrapper<Element>[]
  abstract findComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector | (new () => T)
  ): VueWrapper<T>
  abstract findAllComponents(
    selector: FindAllComponentsSelector
  ): VueWrapper<any>[]
  abstract html(): string

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

  text() {
    return textContent(this.element)
  }

  exists() {
    return true
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
    if (result.exists()) {
      return result
    }

    throw new Error(`Unable to get ${selector} within: ${this.html()}`)
  }

  getComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector | (new () => T)
  ): Omit<VueWrapper<T>, 'exists'> {
    const result = this.findComponent(selector)

    if (result.exists()) {
      return result as VueWrapper<T>
    }

    let message = 'Unable to get '
    if (typeof selector === 'string') {
      message += `component with selector ${selector}`
    } else if ('name' in selector) {
      message += `component with name ${selector.name}`
    } else if ('ref' in selector) {
      message += `component with ref ${selector.ref}`
    } else {
      message += 'specified component'
    }
    message += ` within: ${this.html()}`
    throw new Error(message)
  }

  protected isDisabled = () => {
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

  async trigger(
    eventString: DomEventNameWithModifier,
    options?: TriggerOptions
  ): Promise<void>
  async trigger(eventString: string, options?: TriggerOptions): Promise<void>
  async trigger(eventString: string, options?: TriggerOptions) {
    if (options && options['target']) {
      throw Error(
        `[vue-test-utils]: you cannot set the target value of an event. See the notes section ` +
          `of the docs for more details—` +
          `https://vue-test-utils.vuejs.org/api/wrapper/trigger.html`
      )
    }

    if (this.element && !this.isDisabled()) {
      const event = createDOMEvent(eventString, options)
      this.element.dispatchEvent(event)
    }

    return nextTick()
  }
}

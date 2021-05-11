import { textContent } from './utils'
import type { TriggerOptions } from './createDomEvent'
import { nextTick } from 'vue'
import { createDOMEvent } from './createDomEvent'
import {
  DomEventName,
  DomEventNameWithModifiers
} from './constants/dom-event-types'

export default class BaseWrapper<ElementType extends Element> {
  private readonly wrapperElement: ElementType

  get element() {
    return this.wrapperElement
  }

  constructor(element: ElementType) {
    this.wrapperElement = element
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

  text() {
    return textContent(this.element)
  }

  exists() {
    return true
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
    eventString: DomEventNameWithModifiers,
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

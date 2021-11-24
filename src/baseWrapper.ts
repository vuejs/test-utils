import { textContent } from './utils'
import type { TriggerOptions } from './createDomEvent'
import {
  ComponentInternalInstance,
  ComponentPublicInstance,
  FunctionalComponent,
  nextTick
} from 'vue'
import { createDOMEvent } from './createDomEvent'
import { DomEventNameWithModifier } from './constants/dom-events'
import type { VueWrapper } from './vueWrapper'
import {
  DefinedComponent,
  FindAllComponentsSelector,
  FindComponentSelector,
  NameSelector,
  RefSelector
} from './types'
import WrapperLike from './interfaces/wrapperLike'
import { find, matches } from './utils/find'
import { createWrapperError } from './errorWrapper'
import { isElementVisible } from './utils/isElementVisible'
import { isElement } from './utils/isElement'
import type { DOMWrapper } from './domWrapper'
import { createDOMWrapper, createVueWrapper } from './wrapperFactory'

export default abstract class BaseWrapper<ElementType extends Node>
  implements WrapperLike
{
  private readonly wrapperElement: ElementType & {
    __vueParentComponent?: ComponentInternalInstance
  }

  get element() {
    return this.wrapperElement
  }

  constructor(element: ElementType) {
    this.wrapperElement = element
  }

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  find<T extends Element>(selector: string | RefSelector): DOMWrapper<T>
  find(selector: string | RefSelector): DOMWrapper<Element>
  find(selector: string | RefSelector): DOMWrapper<Element> {
    // allow finding the root element
    if (!isElement(this.element)) {
      return createWrapperError('DOMWrapper')
    }

    if (typeof selector === 'object' && 'ref' in selector) {
      const currentComponent = this.getCurrentComponent()
      if (!currentComponent) {
        return createWrapperError('DOMWrapper')
      }

      const result = currentComponent.refs[selector.ref]

      if (result instanceof HTMLElement) {
        return createDOMWrapper(result)
      } else {
        return createWrapperError('DOMWrapper')
      }
    }

    if (this.element.matches(selector)) {
      return createDOMWrapper(this.element)
    }
    const result = this.element.querySelector(selector)
    if (result) {
      return createDOMWrapper(result)
    }

    return createWrapperError('DOMWrapper')
  }

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[] {
    if (!isElement(this.element)) {
      return []
    }

    const result = this.element.matches(selector)
      ? [createDOMWrapper(this.element)]
      : []

    return [
      ...result,
      ...Array.from(this.element.querySelectorAll(selector)).map((x) =>
        createDOMWrapper(x)
      )
    ]
  }

  // searching by string without specifying component results in WrapperLike object
  findComponent<T extends never>(selector: string): WrapperLike
  // searching for component created via defineComponent results in VueWrapper of proper type
  findComponent<T extends DefinedComponent>(
    selector: T | Exclude<FindComponentSelector, FunctionalComponent>
  ): VueWrapper<InstanceType<T>>
  // searching for functional component results in DOMWrapper
  findComponent<T extends FunctionalComponent>(
    selector: T | string
  ): DOMWrapper<Element>
  // searching by name or ref always results in VueWrapper
  findComponent<T extends never>(
    selector: NameSelector | RefSelector
  ): VueWrapper
  findComponent<T extends ComponentPublicInstance>(
    selector: T | FindComponentSelector
  ): VueWrapper<T>
  // catch all declaration
  findComponent<T extends never>(selector: FindComponentSelector): WrapperLike

  findComponent(selector: FindComponentSelector): WrapperLike {
    const currentComponent = this.getCurrentComponent()
    if (!currentComponent) {
      return createWrapperError('VueWrapper')
    }

    if (typeof selector === 'object' && 'ref' in selector) {
      const result = currentComponent.refs[selector.ref]
      if (result && !(result instanceof HTMLElement)) {
        return createVueWrapper(null, result as ComponentPublicInstance)
      } else {
        return createWrapperError('VueWrapper')
      }
    }

    if (
      matches(currentComponent.vnode, selector) &&
      this.element.contains(currentComponent.vnode.el as Node)
    ) {
      return createVueWrapper(null, currentComponent.proxy!)
    }

    const [result] = this.findAllComponents(selector)
    return result ?? createWrapperError('VueWrapper')
  }

  findAllComponents<T extends never>(selector: string): WrapperLike[]
  findAllComponents<T extends DefinedComponent>(
    selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>
  ): VueWrapper<InstanceType<T>>[]
  findAllComponents<T extends FunctionalComponent>(
    selector: T | string
  ): DOMWrapper<Element>[]
  findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
  findAllComponents<T extends ComponentPublicInstance>(
    selector: T | FindAllComponentsSelector
  ): VueWrapper<T>[]
  // catch all declaration
  findAllComponents<T extends never>(
    selector: FindAllComponentsSelector
  ): WrapperLike[]

  findAllComponents(selector: FindAllComponentsSelector): WrapperLike[] {
    const currentComponent = this.getCurrentComponent()
    if (!currentComponent) {
      return []
    }

    let results = find(currentComponent.subTree, selector)

    return results.map((c) =>
      c.proxy
        ? createVueWrapper(null, c.proxy)
        : createDOMWrapper(c.vnode.el as Element)
    )
  }
  abstract setValue(value?: any): Promise<void>
  abstract html(): string

  classes(): string[]
  classes(className: string): boolean
  classes(className?: string): string[] | boolean {
    const classes = isElement(this.element)
      ? Array.from(this.element.classList)
      : []

    if (className) return classes.includes(className)

    return classes
  }

  attributes(): { [key: string]: string }
  attributes(key: string): string
  attributes(key?: string): { [key: string]: string } | string {
    const attributeMap: Record<string, string> = {}
    if (isElement(this.element)) {
      const attributes = Array.from(this.element.attributes)
      for (const attribute of attributes) {
        attributeMap[attribute.localName] = attribute.value
      }
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

  getComponent<T extends never>(selector: string): Omit<WrapperLike, 'exists'>
  getComponent<T extends DefinedComponent>(
    selector: T | Exclude<FindComponentSelector, FunctionalComponent>
  ): Omit<VueWrapper<InstanceType<T>>, 'exists'>
  // searching for functional component results in DOMWrapper
  getComponent<T extends FunctionalComponent>(
    selector: T | string
  ): Omit<DOMWrapper<Element>, 'exists'>
  // searching by name or ref always results in VueWrapper
  getComponent<T extends never>(
    selector: NameSelector | RefSelector
  ): Omit<VueWrapper, 'exists'>
  getComponent<T extends ComponentPublicInstance>(
    selector: T | FindComponentSelector
  ): Omit<VueWrapper<T>, 'exists'>
  // catch all declaration
  getComponent<T extends never>(
    selector: FindComponentSelector
  ): Omit<WrapperLike, 'exists'>
  getComponent(selector: FindComponentSelector): Omit<WrapperLike, 'exists'> {
    const result = this.findComponent(selector)

    if (result.exists()) {
      return result
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
    const elementCanBeDisabled =
      isElement(this.element) &&
      validTagsToBeDisabled.includes(this.element.tagName)

    return hasDisabledAttribute && elementCanBeDisabled
  }

  isVisible() {
    return isElement(this.element) && isElementVisible(this.element)
  }

  protected abstract getCurrentComponent(): ComponentInternalInstance | void

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

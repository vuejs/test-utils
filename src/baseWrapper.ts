import { textContent } from './utils'
import type { TriggerOptions } from './createDomEvent'
import {
  ComponentInternalInstance,
  ComponentOptions,
  ComponentPublicInstance,
  ComputedOptions,
  CreateComponentPublicInstance,
  FunctionalComponent,
  MethodOptions,
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
  RefSelector,
  VueNode
} from './types'
import WrapperLike from './interfaces/wrapperLike'
import { find, matches } from './utils/find'
import { createWrapperError } from './errorWrapper'
import { isElementVisible } from './utils/isElementVisible'
import { isElement } from './utils/isElement'
import type { DOMWrapper } from './domWrapper'
import { createDOMWrapper, createVueWrapper } from './wrapperFactory'
import { stringifyNode } from './utils/stringifyNode'
import beautify, { HTMLBeautifyOptions } from 'js-beautify'

export default abstract class BaseWrapper<ElementType extends Node>
  implements WrapperLike
{
  protected readonly wrapperElement: VueNode<ElementType>
  protected abstract getRootNodes(): VueNode[]

  get element() {
    return this.wrapperElement
  }

  protected constructor(element: ElementType) {
    this.wrapperElement = element
  }

  protected findAllDOMElements(selector: string): Element[] {
    const elementRootNodes = this.getRootNodes().filter(isElement)
    if (elementRootNodes.length === 0) return []

    const result: Element[] = [
      ...elementRootNodes.filter((node) => node.matches(selector))
    ]

    elementRootNodes.forEach((rootNode) => {
      result.push(...Array.from(rootNode.querySelectorAll(selector)))
    })

    return result
  }

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  find<T extends Element = Element>(selector: string): DOMWrapper<T>
  find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>
  find(selector: string | RefSelector): DOMWrapper<Node> {
    if (typeof selector === 'object' && 'ref' in selector) {
      const currentComponent = this.getCurrentComponent()
      if (!currentComponent) {
        return createWrapperError('DOMWrapper')
      }

      let result = currentComponent.refs[selector.ref]

      // When using ref inside v-for, then refs contains array of component instances and nodes
      if (Array.isArray(result)) {
        result = result.length ? result[0] : undefined
      }

      if (result instanceof Node) {
        return createDOMWrapper(result)
      } else {
        return createWrapperError('DOMWrapper')
      }
    }

    const elements = this.findAll(selector)
    if (elements.length > 0) {
      return elements[0]
    }

    return createWrapperError('DOMWrapper')
  }

  abstract findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  abstract findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  abstract findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  abstract findAll(selector: string): DOMWrapper<Element>[]

  // searching by string without specifying component results in WrapperLike object
  findComponent<T extends never>(selector: string): WrapperLike
  // Find Component Options aka plain object
  findComponent<
    Props,
    RawBindings = any,
    D = any,
    C extends ComputedOptions = ComputedOptions,
    M extends MethodOptions = MethodOptions
  >(
    selector: ComponentOptions<Props, RawBindings, D, C, M>
  ): VueWrapper<CreateComponentPublicInstance<Props, RawBindings, D, C, M>>
  findComponent<T extends ComponentOptions>(
    selector: string
  ): VueWrapper<
    T extends ComponentOptions<
      infer Props,
      infer RawBindings,
      infer D,
      infer C,
      infer M
    >
      ? CreateComponentPublicInstance<Props, RawBindings, D, C, M>
      : VueWrapper<CreateComponentPublicInstance>
  >
  // searching for component created via defineComponent results in VueWrapper of proper type
  findComponent<T extends DefinedComponent>(
    selector: T | Exclude<FindComponentSelector, FunctionalComponent>
  ): VueWrapper<InstanceType<T>>
  // searching for functional component results in DOMWrapper
  findComponent<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>
  findComponent<T extends FunctionalComponent>(
    selector: string
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
      let result = currentComponent.refs[selector.ref]

      // When using ref inside v-for, then refs contains array of component instances
      if (Array.isArray(result)) {
        result = result.length ? result[0] : undefined
      }

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
      return createVueWrapper(
        null,
        currentComponent.subTree.component
          ? currentComponent.subTree.component.proxy!
          : currentComponent.proxy!
      )
    }

    const [result] = this.findAllComponents(selector)
    return result ?? createWrapperError('VueWrapper')
  }

  findAllComponents<T extends never>(selector: string): WrapperLike[]
  findAllComponents<T extends DefinedComponent>(
    selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>
  ): VueWrapper<InstanceType<T>>[]
  findAllComponents<T extends FunctionalComponent>(
    selector: T
  ): DOMWrapper<Node>[]
  findAllComponents<T extends FunctionalComponent>(
    selector: string
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

  html(options?: { raw?: boolean }): string {
    const stringNodes = this.getRootNodes().map((node) => stringifyNode(node))
    if (options?.raw) return stringNodes.join('')

    return stringNodes
      .map((node) =>
        beautify.html(node, {
          unformatted: ['code', 'pre', 'em', 'strong', 'span'],
          indent_inner_html: true,
          indent_size: 2,
          inline_custom_elements: false
          // TODO the cast can be removed when @types/js-beautify will be up-to-date
        } as HTMLBeautifyOptions)
      )
      .join('\n')
  }

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
  attributes(key: string): string | undefined
  attributes(key?: string): { [key: string]: string } | string | undefined {
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
    return this.getRootNodes().map(textContent).join('')
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
  get<T extends Element = Element>(
    selector: string
  ): Omit<DOMWrapper<T>, 'exists'>
  get<T extends Node = Node>(
    selector: string | RefSelector
  ): Omit<DOMWrapper<T>, 'exists'>
  get(selector: string | RefSelector): Omit<DOMWrapper<Node>, 'exists'> {
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
      // see https://github.com/vuejs/test-utils/issues/1854
      // fakeTimers provoke an issue as Date.now() always return the same value
      // and Vue relies on it to determine if the handler should be invoked
      // see https://github.com/vuejs/core/blob/5ee40532a63e0b792e0c1eccf3cf68546a4e23e9/packages/runtime-dom/src/modules/events.ts#L100-L104
      // we workaround this issue by manually setting _vts to Date.now() + 1
      // thus making sure the event handler is invoked
      event._vts = Date.now() + 1
      this.element.dispatchEvent(event)
    }

    return nextTick()
  }
}

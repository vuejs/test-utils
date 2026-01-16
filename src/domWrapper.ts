import type { VNode } from 'vue'
import { config } from './config'
import BaseWrapper from './baseWrapper'
import type WrapperLike from './interfaces/wrapperLike'
import {
  createDOMWrapper,
  registerFactory,
  WrapperType
} from './wrapperFactory'
import type { RefSelector } from './types'
import { isRefSelector } from './utils'
import { createWrapperError } from './errorWrapper'

export class DOMWrapper<NodeType extends Node> extends BaseWrapper<NodeType> {
  protected readonly subTree: VNode | null | undefined = null

  constructor(element: NodeType | null | undefined, subTree?: VNode | null) {
    if (!element) {
      return createWrapperError('DOMWrapper')
    }
    super(element)
    this.subTree = subTree

    // plugins hook
    config.plugins.DOMWrapper.extend(this)
  }

  getRootNodes() {
    if (Array.isArray(this.subTree?.children)) {
      return this.subTree.children.map(node => (node as any)?.el)
    }
    return [this.wrapperElement]
  }

  getCurrentComponent() {
    let component = this.element.__vueParentComponent
    while (component?.parent?.vnode.el === this.element) {
      component = component.parent
    }
    return component
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
    const result = super.find(selector)
    if (result.exists() && isRefSelector(selector)) {
      return this.element.contains(result.element)
        ? result
        : createWrapperError('DOMWrapper')
    }

    return result
  }

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[] {
    if (!(this.wrapperElement instanceof Element)) {
      return []
    }
    return Array.from(this.wrapperElement.querySelectorAll(selector), element =>
      createDOMWrapper(element)
    )
  }

  findAllComponents(selector: any): any {
    const results = super.findAllComponents(selector)
    return results.filter((r: WrapperLike) => this.element.contains(r.element))
  }

  private async setChecked(checked = true) {
    // typecast so we get type safety
    const element = this.element as unknown as HTMLInputElement
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
    this.trigger('input')
    return this.trigger('change')
  }

  setValue(value?: any): Promise<void> {
    const element = this.element as unknown as HTMLInputElement
    const tagName = element.tagName
    const type = this.attributes().type

    if (tagName === 'OPTION') {
      this.setSelected()
      return Promise.resolve()
    } else if (tagName === 'INPUT' && type === 'checkbox') {
      return this.setChecked(value)
    } else if (tagName === 'INPUT' && type === 'radio') {
      return this.setChecked(value)
    } else if (tagName === 'SELECT') {
      if (Array.isArray(value)) {
        const selectElement = element as unknown as HTMLSelectElement
        for (let i = 0; i < selectElement.options.length; i++) {
          const option = selectElement.options[i]
          option.selected = value.includes(option.value)
        }
      } else {
        element.value = value
      }

      this.trigger('input')
      return this.trigger('change')
    } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      element.value = value

      this.trigger('input')
      // trigger `change` for `v-model.lazy`
      return this.trigger('change')
    } else {
      throw Error(`wrapper.setValue() cannot be called on ${tagName}`)
    }
  }

  private setSelected() {
    const element = this.element as unknown as HTMLOptionElement

    if (element.selected) {
      return
    }

    // todo - review all non-null assertion operators in project
    // search globally for `!.` and with regex `!$`
    element.selected = true
    let parentElement = element.parentElement!

    if (parentElement.tagName === 'OPTGROUP') {
      parentElement = parentElement.parentElement!
    }

    const parentWrapper = new DOMWrapper(parentElement)
    parentWrapper.trigger('input')
    return parentWrapper.trigger('change')
  }
}

registerFactory(
  WrapperType.DOMWrapper,
  (element, subTree) => new DOMWrapper(element, subTree)
)

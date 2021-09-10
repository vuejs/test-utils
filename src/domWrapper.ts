import { config } from './config'
import { isElementVisible } from './utils/isElementVisible'
import BaseWrapper from './baseWrapper'
import { createWrapperError } from './errorWrapper'
import WrapperLike from './interfaces/wrapperLike'
import { ComponentInternalInstance, ComponentPublicInstance } from 'vue'
import { FindAllComponentsSelector, FindComponentSelector } from './types'
import { matches, find } from './utils/find'
import { VueWrapper, createWrapper } from './vueWrapper'

export class DOMWrapper<ElementType extends Element>
  extends BaseWrapper<ElementType>
  implements WrapperLike
{
  constructor(element: ElementType) {
    super(element)
    // plugins hook
    config.plugins.DOMWrapper.extend(this)
  }

  isVisible() {
    return isElementVisible(this.element)
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

  findComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector | (new () => T)
  ): VueWrapper<T> {
    const parentComponent = this.element.__vueParentComponent

    if (!parentComponent) {
      return createWrapperError('VueWrapper')
    }

    if (typeof selector === 'object' && 'ref' in selector) {
      const result = parentComponent.refs[selector.ref]
      if (result && !(result instanceof HTMLElement)) {
        return createWrapper(null, result as T)
      } else {
        return createWrapperError('VueWrapper')
      }
    }

    if (
      matches(parentComponent.vnode, selector) &&
      this.element.contains(parentComponent.vnode.el as Node)
    ) {
      return createWrapper(null, parentComponent.proxy!)
    }

    const result = find(parentComponent.subTree, selector).filter((v) =>
      this.element.contains(v.$el)
    )

    if (result.length) {
      return createWrapper(null, result[0])
    }

    return createWrapperError('VueWrapper')
  }

  findAllComponents(selector: FindAllComponentsSelector): VueWrapper<any>[] {
    const parentComponent: ComponentInternalInstance = (this.element as any)
      .__vueParentComponent

    return find(parentComponent.subTree, selector)
      .filter((v) => this.element.contains(v.$el))
      .map((c) => createWrapper(null, c))
  }

  private async setChecked(checked: boolean = true) {
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

    return new DOMWrapper(parentElement).trigger('change')
  }
}

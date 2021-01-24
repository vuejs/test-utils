import { ComponentPublicInstance, nextTick, App } from 'vue'
import { ShapeFlags } from '@vue/shared'

import { config } from './config'
import { DOMWrapper } from './domWrapper'
import { FindAllComponentsSelector, FindComponentSelector } from './types'
import { createWrapperError } from './errorWrapper'
import { TriggerOptions } from './createDomEvent'
import { find, matches } from './utils/find'
import { mergeDeep } from './utils'
import { emitted } from './emit'

export class VueWrapper<T extends ComponentPublicInstance> {
  private componentVM: T
  private rootVM: ComponentPublicInstance
  private __app: App | null
  private __setProps: ((props: Record<string, any>) => void) | undefined

  constructor(
    app: App | null,
    vm: ComponentPublicInstance,
    setProps?: (props: Record<string, any>) => void
  ) {
    this.__app = app
    // root is null on functional components
    this.rootVM = vm?.$root
    this.componentVM = vm as T
    this.__setProps = setProps
    config.plugins.VueWrapper.extend(this)
  }

  private get hasMultipleRoots(): boolean {
    // if the subtree is an array of children, we have multiple root nodes
    return this.vm.$.subTree.shapeFlag === ShapeFlags.ARRAY_CHILDREN
  }

  private get parentElement(): Element {
    return this.vm.$el.parentElement
  }

  get element(): Element {
    // if the component has multiple root elements, we use the parent's element
    return this.hasMultipleRoots ? this.parentElement : this.vm.$el
  }

  get vm(): T {
    return this.componentVM
  }

  props(): { [key: string]: any }
  props(selector: string): any
  props(selector?: string): { [key: string]: any } | any {
    const props = this.componentVM.$props as { [key: string]: any }
    return selector ? props[selector] : props
  }

  classes(): string[]
  classes(className: string): boolean
  classes(className?: string): string[] | boolean {
    return new DOMWrapper(this.element).classes(className)
  }

  attributes(): { [key: string]: string }
  attributes(key: string): string
  attributes(key?: string): { [key: string]: string } | string {
    return new DOMWrapper(this.element).attributes(key)
  }

  exists() {
    return true
  }

  emitted<T = unknown>(): Record<string, T[]>
  emitted<T = unknown>(eventName?: string): T[]
  emitted<T = unknown>(eventName?: string): T[] | Record<string, T[]> {
    return emitted(eventName)
  }

  html() {
    // cover cases like <Suspense>, multiple root nodes.
    if (this.parentElement['__vue_app__']) {
      return this.parentElement.innerHTML
    }

    return this.element.outerHTML
  }

  text() {
    return this.element.textContent?.trim()
  }

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  find<T extends Element>(selector: string): DOMWrapper<T>
  find(selector: string): DOMWrapper<Element> {
    // force using the parentElement to allow finding the root element
    const result = this.parentElement.querySelector(selector)
    if (result) {
      return new DOMWrapper(result)
    }

    return createWrapperError('DOMWrapper')
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
    if (result instanceof DOMWrapper) {
      return result
    }

    throw new Error(`Unable to get ${selector} within: ${this.html()}`)
  }

  findComponent<T extends ComponentPublicInstance>(
    selector: new () => T
  ): VueWrapper<T>
  findComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector
  ): VueWrapper<T>
  findComponent<T extends ComponentPublicInstance>(
    selector: any
  ): VueWrapper<T> {
    if (typeof selector === 'object' && 'ref' in selector) {
      const result = this.vm.$refs[selector.ref]
      if (result) {
        return createWrapper(null, result as T)
      }
    }

    const result = find(this.vm.$.subTree, selector)
    if (result.length) {
      return createWrapper(null, result[0])
    }

    // https://github.com/vuejs/vue-test-utils-next/issues/211
    // VTU v1 supported finding the component mounted itself.
    // eg: mount(Comp).findComponent(Comp)
    // this is the same as doing `wrapper.vm`, but we keep this behavior for back compat.
    if (matches(this.vm.$.vnode, selector)) {
      return createWrapper(null, this.vm.$.vnode.component.proxy)
    }

    return createWrapperError('VueWrapper')
  }

  getComponent<T extends ComponentPublicInstance>(
    selector: new () => T
  ): Omit<VueWrapper<T>, 'exists'>
  getComponent<T extends ComponentPublicInstance>(
    selector: FindComponentSelector
  ): Omit<VueWrapper<T>, 'exists'>
  getComponent<T extends ComponentPublicInstance>(
    selector: any
  ): Omit<VueWrapper<T>, 'exists'> {
    const result = this.findComponent(selector)

    if (result instanceof VueWrapper) {
      return result as VueWrapper<T>
    }

    let message = 'Unable to get '
    if (typeof selector === 'string') {
      message += `component with selector ${selector}`
    } else if (selector.name) {
      message += `component with name ${selector.name}`
    } else if (selector.ref) {
      message += `component with ref ${selector.ref}`
    } else {
      message += 'specified component'
    }
    message += ` within: ${this.html()}`
    throw new Error(message)
  }

  findAllComponents(selector: FindAllComponentsSelector): VueWrapper<T>[] {
    return find(this.vm.$.subTree, selector).map((c) => createWrapper(null, c))
  }

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[] {
    const results = this.parentElement.querySelectorAll(selector)
    return Array.from(results).map((element) => new DOMWrapper(element))
  }

  setData(data: Record<string, any>): Promise<void> {
    mergeDeep(this.componentVM.$data, data)
    return nextTick()
  }

  setProps(props: Record<string, any>): Promise<void> {
    // if this VM's parent is not the root or if setProps does not exist, error out
    if (this.vm.$parent !== this.rootVM || !this.__setProps) {
      throw Error('You can only use setProps on your mounted component')
    }
    this.__setProps(props)
    return nextTick()
  }

  setValue(value: any, prop?: string): Promise<void> {
    const propEvent = prop || 'modelValue'
    this.vm.$emit(`update:${propEvent}`, value)
    return this.vm.$nextTick()
  }

  trigger(eventString: string, options?: TriggerOptions) {
    const rootElementWrapper = new DOMWrapper(this.element)
    return rootElementWrapper.trigger(eventString, options)
  }

  unmount() {
    // preventing dispose of child component
    if (!this.__app) {
      throw new Error(
        `wrapper.unmount() can only be called by the root wrapper`
      )
    }

    this.__app.unmount(this.parentElement)
  }
}

export function createWrapper<T extends ComponentPublicInstance>(
  app: App | null,
  vm: ComponentPublicInstance,
  setProps?: (props: Record<string, any>) => void
): VueWrapper<T> {
  return new VueWrapper<T>(app, vm, setProps)
}

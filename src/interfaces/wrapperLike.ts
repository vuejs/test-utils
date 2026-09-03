import type { DomEventNameWithModifier } from '../constants/dom-events'
import type { TriggerOptions } from '../createDomEvent'
import type { VNode } from 'vue'
import type {
  DefinedComponent,
  FindAllComponentsSelector,
  FindComponentSelector,
  NameSelector,
  RefSelector
} from '../types'
import type { VueWrapper } from '../vueWrapper'
import type { ComponentPublicInstance, FunctionalComponent } from 'vue'
import type { DOMWrapper } from '../domWrapper'

export default interface WrapperLike {
  readonly element: Node
  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  find<T extends Element = Element>(selector: string): DOMWrapper<T>
  find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]

  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[]

  findComponent<T extends never>(selector: string): WrapperLike
  findComponent<T extends DefinedComponent>(
    selector: T | Exclude<FindComponentSelector, FunctionalComponent<any>>
  ): VueWrapper<InstanceType<T>>
  // vue-tsc emits generic SFCs as call signatures returning `VNode & { __ctx?: ... }`,
  // not as `DefineComponent` constructs. The `__ctx` property is the discriminator:
  // a plain generic functional component returns bare `VNode` and must keep returning
  // `DOMWrapper` so `.vm` does not type-check.
  findComponent<T extends (...args: any[]) => VNode>(
    selector: T
  ): unknown extends ReturnType<T>
    ? DOMWrapper<Element>
    : '__ctx' extends keyof ReturnType<T>
      ? VueWrapper
      : DOMWrapper<Element>
  findComponent<T extends FunctionalComponent<any>>(
    selector: T | string
  ): DOMWrapper<Element>
  findComponent<T extends never>(
    selector: NameSelector | RefSelector
  ): VueWrapper
  findComponent<T extends ComponentPublicInstance>(
    selector: T | FindComponentSelector
  ): VueWrapper<T>
  findComponent(selector: FindComponentSelector): WrapperLike

  findAllComponents<T extends never>(selector: string): WrapperLike[]
  findAllComponents<T extends DefinedComponent>(
    selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent<any>>
  ): VueWrapper<InstanceType<T>>[]
  // See findComponent above: vue-tsc generic SFCs are discriminated by `__ctx` in
  // the return type. A plain generic functional component falls through to the
  // FunctionalComponent overloads below.
  findAllComponents<T extends (...args: any[]) => VNode>(
    selector: T
  ): unknown extends ReturnType<T>
    ? DOMWrapper<Node>[]
    : '__ctx' extends keyof ReturnType<T>
      ? VueWrapper[]
      : DOMWrapper<Node>[]
  findAllComponents<T extends FunctionalComponent<any>>(
    selector: string
  ): DOMWrapper<Element>[]
  findAllComponents<T extends FunctionalComponent<any>>(
    selector: T
  ): DOMWrapper<Node>[]
  findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
  findAllComponents<T extends ComponentPublicInstance>(
    selector: T | FindAllComponentsSelector
  ): VueWrapper<T>[]
  findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]

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

  getComponent<T extends never>(selector: string): Omit<WrapperLike, 'exists'>
  getComponent<T extends DefinedComponent>(
    selector: T | Exclude<FindComponentSelector, FunctionalComponent<any>>
  ): Omit<VueWrapper<InstanceType<T>>, 'exists'>
  // vue-tsc generic SFCs share the same `__ctx` discriminator as findComponent.
  // A plain generic functional component must keep resolving to DOMWrapper so that
  // accessing `.vm` does not type-check at runtime.
  getComponent<T extends (...args: any[]) => VNode>(
    selector: T
  ): unknown extends ReturnType<T>
    ? Omit<DOMWrapper<Element>, 'exists'>
    : '__ctx' extends keyof ReturnType<T>
      ? Omit<VueWrapper, 'exists'>
      : Omit<DOMWrapper<Element>, 'exists'>
  // searching for functional component results in DOMWrapper
  getComponent<T extends FunctionalComponent<any>>(
    selector: T | string
  ): Omit<DOMWrapper<Element>, 'exists'>
  getComponent<T extends ComponentPublicInstance>(
    selector: T | FindComponentSelector
  ): Omit<VueWrapper<T>, 'exists'>
  // catch all declaration
  getComponent<T extends never>(
    selector: FindComponentSelector
  ): Omit<WrapperLike, 'exists'>

  html(): string

  classes(): string[]
  classes(className: string): boolean
  classes(className?: string): string[] | boolean

  attributes(): { [key: string]: string }
  attributes(key: string): string | undefined
  attributes(key?: string): { [key: string]: string } | string | undefined

  text(): string
  exists(): boolean

  setValue(value: any): Promise<void>

  isVisible(): boolean

  trigger(
    eventString: DomEventNameWithModifier,
    options?: TriggerOptions
  ): Promise<void>
  trigger(eventString: string, options?: TriggerOptions): Promise<void>
}

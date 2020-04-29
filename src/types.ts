import { Component, ComponentOptions, Directive, Plugin } from 'vue'

import { DOMWrapper } from './dom-wrapper'
import { ErrorWrapper } from './error-wrapper'
import { DOMWrapperError } from './dom-wrapper-error'

export interface VueWrapperAPI<T> {
  element: Element
}

export interface DOMWrapperAPI {
  attributes: (key?: string) => string | Record<string, string>
  classes: (className?: string) => string[] | boolean | ErrorWrapper
  readonly element: Element
  exists: () => boolean

  get<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>
  get<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>
  get<T extends Element>(selector: string): DOMWrapper<T>
  get(selector: string): DOMWrapper<Element>

  find<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]> | DOMWrapperError
  find<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]> | DOMWrapperError
  find<T extends Element>(selector: string): DOMWrapper<T> | DOMWrapperError
  find<T extends Element>(selector: string): DOMWrapper<T> | DOMWrapperError
  find(selector: string): DOMWrapper<Element> | DOMWrapperError

  findAll<K extends keyof HTMLElementTagNameMap>(
    selector: K
  ): DOMWrapper<HTMLElementTagNameMap[K]>[]
  findAll<K extends keyof SVGElementTagNameMap>(
    selector: K
  ): DOMWrapper<SVGElementTagNameMap[K]>[]
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  findAll(selector: string): DOMWrapper<Element>[]

  html: () => string
  text: () => string
  setValue: (value?: any) => Promise<(fn?: () => void) => Promise<void>>
  trigger: (
    eventString: string,
    options?: Object
  ) => Promise<(fn?: () => void) => Promise<void>>
}

interface RefSelector {
  ref: string
}

interface NameSelector {
  name: string
}

interface RefSelector {
  ref: string
}

interface NameSelector {
  name: string
}

export type FindComponentSelector = RefSelector | NameSelector | string
export type FindAllComponentsSelector = NameSelector | string

export type GlobalMountOptions = {
  plugins?: Plugin[]
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Record<any, any>
}

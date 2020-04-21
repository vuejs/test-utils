import { Component, ComponentOptions, Directive, Plugin } from 'vue'

import { DOMWrapper } from './dom-wrapper'
import { ErrorWrapper } from './error-wrapper'

export interface WrapperAPI {
  attributes: (key?: string) => string | Record<string, string>
  classes: (className?: string) => string[] | boolean | ErrorWrapper
  readonly element: Element
  exists: () => boolean
  get<T extends Element>(selector: string): DOMWrapper<T>
  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  html: () => string
  text: () => string
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

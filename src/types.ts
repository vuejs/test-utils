import { Component, ComponentOptions, Directive, Plugin } from 'vue'

import { DOMWrapper } from './dom-wrapper'
import { ErrorWrapper } from './error-wrapper'

export interface WrapperAPI {
  attributes: (key?: string) => string | Record<string, string>
  classes: (className?: string) => string[] | boolean | ErrorWrapper
  readonly element: Element
  exists: () => boolean
  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  html: () => string
  text: () => string
  trigger: (eventString: string) => Promise<(fn?: () => void) => Promise<void>>
}

export type GlobalMountOptions = {
  plugins?: Plugin[]
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  // TODO how to type `defineComponent`? Using `any` for now.
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  globalProperties?: Record<any, any>
  stubs?: Record<any, any>
}

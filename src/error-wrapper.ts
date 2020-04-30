import { ComponentPublicInstance } from 'vue'

import { DOMWrapper } from './dom-wrapper'
import { VueWrapper } from './vue-wrapper'

interface ErrorWrapperOptions {
  selector?: string
}

export function createWrapperError(options?: ErrorWrapperOptions) {
  return new Proxy<DOMWrapper<Element>>(Object.create(null), {
    get(obj, prop) {
      switch (prop) {
        case 'exists':
          return () => false
        default:
          throw new Error(`Cannot call ${String(prop)} on an empty DOMWrapper.`)
      }
    }
  })
}

export function createVueWrapperError<T extends ComponentPublicInstance>(
  options?: ErrorWrapperOptions
) {
  return new Proxy<VueWrapper<T>>(Object.create(null), {
    get(obj, prop) {
      switch (prop) {
        case 'exists':
          return () => false
        default:
          throw new Error(`Cannot call ${String(prop)} on an empty VueWrapper.`)
      }
    }
  })
}

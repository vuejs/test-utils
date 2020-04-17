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
  trigger: (eventString: string, options?: Object) => Promise<(fn?: () => void) => Promise<void>>
}

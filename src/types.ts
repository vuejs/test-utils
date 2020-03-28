import { DOMWrapper } from './dom-wrapper'
import { ErrorWrapper } from './error-wrapper'

export interface WrapperAPI {
  attributes: (key?: string) => string | Record<string, string>
  classes: (className?: string) => string[] | boolean | ErrorWrapper
  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  exists: () => boolean
}

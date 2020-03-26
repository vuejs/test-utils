import { DOMWrapper } from './dom-wrapper'
import { ErrorWrapper } from './error-wrapper'

export interface WrapperAPI {
  classes: () => string[] | ErrorWrapper
  find<T extends Element>(selector: string): DOMWrapper<T> | ErrorWrapper
  findAll<T extends Element>(selector: string): DOMWrapper<T>[]
  exists: () => boolean
}

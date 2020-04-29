import { FindComponentSelector, DOMWrapperAPI } from './types'

interface Options {
  selector: FindComponentSelector
}

export class ErrorWrapper implements DOMWrapperAPI {
  selector: FindComponentSelector
  element: null

  constructor({ selector }: Options) {
    this.selector = selector
  }

  wrapperError(method: string): Error {
    return Error(`Cannot call ${method} on an empty dom wrapper.`)
  }

  vm(): Error {
    throw this.wrapperError('vm')
  }

  attributes(): never {
    throw this.wrapperError('attributes')
  }

  classes(): never {
    throw this.wrapperError('classes')
  }

  exists() {
    return false
  }

  find(): never {
    throw this.wrapperError('find')
  }

  get(): never {
    throw this.wrapperError('get')
  }

  html(): never {
    throw this.wrapperError('html')
  }

  findAll(): never {
    throw this.wrapperError('findAll')
  }

  setProps() {
    throw this.wrapperError('setProps')
  }

  setValue(): never {
    throw this.wrapperError('setValue')
  }

  props() {
    throw this.wrapperError('props')
  }

  text(): never {
    throw this.wrapperError('text')
  }

  trigger(): never {
    throw this.wrapperError('trigger')
  }

  unmount() {
    throw this.wrapperError('unmount')
  }
}

import { FindComponentSelector } from './types'

interface Options {
  selector: FindComponentSelector
}

export class ErrorWrapper {
  selector: FindComponentSelector
  element: null

  constructor({ selector }: Options) {
    this.selector = selector
  }

  wrapperError(method: string): Error {
    return Error(`Cannot call ${method} on an empty wrapper.`)
  }

  vm(): Error {
    throw this.wrapperError('vm')
  }

  attributes() {
    throw this.wrapperError('attributes')
  }

  classes() {
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

  findAll(): never {
    throw this.wrapperError('findAll')
  }

  setProps() {
    throw this.wrapperError('setProps')
  }

  setValue() {
    throw this.wrapperError('setValue')
  }

  text() {
    throw this.wrapperError('text')
  }

  trigger() {
    throw this.wrapperError('trigger')
  }

  unmount() {
    throw this.wrapperError('unmount')
  }
}

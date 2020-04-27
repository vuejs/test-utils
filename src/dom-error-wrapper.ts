import { FindComponentSelector, DOMWrapperAPI } from './types'

interface Options {
  selector: FindComponentSelector
}

export class DOMErrorWrapper implements DOMWrapperAPI {
  private selector: FindComponentSelector
  element: null

  constructor({ selector }: Options) {
    this.selector = selector
  }

  wrapperError(method: string): Error {
    return Error(`Cannot call ${method} on an empty wrapper.`)
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

  get(): never {
    throw this.wrapperError('get')
  }

  find(): never {
    throw this.wrapperError('find')
  }

  findAll(): never {
    throw this.wrapperError('findAll')
  }

  html(): never {
    throw this.wrapperError('html')
  }

  text(): never {
    throw this.wrapperError('text')
  }

  setValue(): never {
    throw this.wrapperError('setValue')
  }

  trigger(): never {
    throw this.wrapperError('trigger')
  }
}

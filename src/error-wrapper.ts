interface Options {
  selector: string
}

export class ErrorWrapper {
  selector: string
  element: null

  constructor({ selector }: Options) {
    this.selector = selector
  }

  wrapperError(method: string): Error {
    return Error(`Cannot call ${method} on an empty wrapper.`)
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

  find() {
    throw this.wrapperError('find')
  }

  findAll() {
    throw this.wrapperError('findAll')
  }

  setChecked() {
    throw this.wrapperError('setChecked')
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
}

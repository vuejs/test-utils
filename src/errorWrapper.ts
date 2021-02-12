export function createWrapperError<T extends object>(wrapperType: 'DOMWrapper' | 'VueWrapper') {
  return new Proxy<T>(Object.create(null), {
    get(obj, prop) {
      switch (prop) {
        case 'exists':
          return () => false
        default:
          throw new Error(
            `Cannot call ${String(prop)} on an empty ${wrapperType}.`
          )
      }
    }
  })
}

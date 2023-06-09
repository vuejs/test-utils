/**
 * Wraps the asynchronous methods of a component in promises.
 *
 * @param instance Vue component instance
 * @returns Array of promises
 */

export function promisify(instance: any) {
  const promises: Array<Promise<unknown>> = []

  Object.entries(instance.vm).forEach(([name, func]) => {
    if (func instanceof Function && func.constructor.name === 'AsyncFunction') {
      Object.defineProperty(instance.vm, name, {
        async value(...args: any[]) {
          const promise = new Promise<unknown>((resolve) => {
            func.apply(this, args).then(resolve)
          })
          promises.push(promise)
          return promise
        },
      })
    }
  })

  return promises
}

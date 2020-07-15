const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout

export function flushPromises() {
  return new Promise((resolve) => {
    scheduler(resolve, 0)
  })
}

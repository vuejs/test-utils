const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout

// Credit to: https://github.com/kentor/flush-promises
export function flushPromises() {
  return new Promise((resolve) => {
    scheduler(resolve, 0)
  })
}

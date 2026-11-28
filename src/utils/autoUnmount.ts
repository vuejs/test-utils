let isEnabled = false
const wrapperInstances: { unmount(): void }[] = []

export function disableAutoUnmount() {
  isEnabled = false
  wrapperInstances.length = 0
}

export function enableAutoUnmount(hook: (callback: () => void) => void) {
  if (isEnabled) {
    throw new Error('enableAutoUnmount cannot be called more than once')
  }

  isEnabled = true

  hook(() => {
    wrapperInstances.forEach(wrapper => {
      wrapper.unmount()
    })

    wrapperInstances.length = 0
  })
}

export function trackInstance(wrapper: { unmount(): void }) {
  if (!isEnabled) return

  wrapperInstances.push(wrapper)
}

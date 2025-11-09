import type { ComponentPublicInstance } from 'vue'
import type { VueWrapper } from '../vueWrapper'

let isEnabled = false
const wrapperInstances: VueWrapper<ComponentPublicInstance>[] = []

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
    wrapperInstances.forEach((wrapper: VueWrapper<ComponentPublicInstance>) => {
      wrapper.unmount()
    })

    wrapperInstances.length = 0
  })
}

export function trackInstance(wrapper: VueWrapper<ComponentPublicInstance>) {
  if (!isEnabled) return

  wrapperInstances.push(wrapper)
}

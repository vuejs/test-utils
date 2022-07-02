import { vi } from 'vitest'

const originalConsole = console.info

console.info = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0] &&
    args[0].includes('Make sure to use the production build')
  ) {
    return
  }

  originalConsole(...args)
}

vi.mock('./src', () => {
  if (!__USE_BUILD__) {
    return vi.importActual('./dist/vue-test-utils.esm-bundler.mjs')
  } else {
    return vi.importActual('./src')
  }
})

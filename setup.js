import { defineComponent, h } from 'vue'
import { config } from './src'

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

if (__USE_BUILD__) {
  jest.mock('./src', () => jest.requireActual('./dist/vue-test-utils.cjs'))
}

class TestPlugin {
  static install (app) {
    app.component('foo-bar-plugin-component', defineComponent({
      render() {
        return h('div', 'Foo Bar')
      }
    }))
  }
}

config.global.plugins.push(TestPlugin)

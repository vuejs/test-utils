import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import { mount } from '../../src'

describe('mounting options: mixins', () => {
  it('installs a mixin via `mixins`', () => {
    const createdHook = vi.fn()
    const mixin = {
      created() {
        createdHook()
      }
    }
    const Component = {
      render() {
        return h('div')
      }
    }

    mount(Component, {
      global: {
        mixins: [mixin]
      }
    })

    expect(createdHook).toHaveBeenCalled()
  })
})

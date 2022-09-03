import { beforeEach, describe, expect, test, vi } from 'vitest'
import SuspenseComponent from '../components/Suspense.vue'
import { mount, flushPromises } from '../../src'
import { defineComponent } from 'vue'

let mockShouldError = false
vi.mock('../utils', () => ({
  simulateDelay: () => {
    if (mockShouldError) {
      throw new Error('Error!')
    }
  }
}))

beforeEach(() => {
  mockShouldError = false
})

describe('suspense', () => {
  test('fallback state', () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
  })

  test('default state', async () => {
    const wrapper = mount(SuspenseComponent)

    await flushPromises()
    expect(wrapper.html()).toContain('Default content')
  })

  test('error state', async () => {
    mockShouldError = true
    const wrapper = mount(SuspenseComponent)

    await flushPromises()

    expect(wrapper.html()).toContain('Error!')
  })

  test('returns the element if it is a multi root element inside Suspense', () => {
    const Async = defineComponent({
      template: '<h1>Hello</h1><span id="my-span">There</span>'
    })
    const Component = defineComponent({
      components: { Async },
      template: '<Suspense><Async/></Suspense>'
    })

    const wrapper = mount(Component)
    expect(wrapper.get('#my-span')).not.toBeNull()
  })

  test('returns the element if it is a root element inside Suspense', () => {
    const Async = defineComponent({
      template: '<div><h1>Hello</h1><span id="my-span">There</span></div>'
    })
    const Component = defineComponent({
      components: { Async },
      template: '<Suspense><Async/></Suspense>'
    })

    const wrapper = mount(Component)
    expect(wrapper.get('#my-span')).not.toBeNull()
  })
})

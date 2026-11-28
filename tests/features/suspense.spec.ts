import { beforeEach, describe, expect, test, vi } from 'vitest'
import SuspenseComponent from '../components/Suspense.vue'
import { flushPromises, mount } from '../../src'
import { Fragment, defineComponent, h } from 'vue'

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

  test('returns the container for multiple roots inside Suspense', () => {
    const Async = defineComponent({
      template: '<h1>Hello</h1><span id="my-span">There</span>'
    })
    const Component = defineComponent({
      components: { Async },
      template: '<Suspense><Async/></Suspense>'
    })

    const wrapper = mount(Component)
    expect(wrapper.element).toBe(wrapper.get('#my-span').element.parentElement)
  })

  test('returns the root element inside Suspense', () => {
    const Async = defineComponent({
      template: '<div><h1>Hello</h1><span id="my-span">There</span></div>'
    })
    const Component = defineComponent({
      components: { Async },
      template: '<Suspense><Async/></Suspense>'
    })

    const wrapper = mount(Component)
    expect(wrapper.element).toBe(wrapper.get('div').element)
  })

  test('updates element when a single-root fallback resolves to a one-child fragment', async () => {
    const Async = defineComponent({
      setup: () => Promise.resolve(() => h(Fragment, [h('p', 'Resolved')]))
    })
    const Component = defineComponent({
      components: { Async },
      template: `
        <Suspense>
          <Async />
          <template #fallback><h1>Loading</h1></template>
        </Suspense>
      `
    })

    const wrapper = mount(Component)
    expect(wrapper.element).toBe(wrapper.get('h1').element)

    await flushPromises()

    expect(wrapper.element).toBe(wrapper.get('p').element.parentElement)
  })
})

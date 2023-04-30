import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineAsyncComponent, defineComponent, h, AppConfig } from 'vue'
import { mount, shallowMount, flushPromises } from '../../src'
import Hello from '../components/Hello.vue'

const config: Partial<AppConfig> = {
  errorHandler: (error: unknown) => {
    if ((error as Error).message.match(/Async component failed to load./)) {
      return
    }
  }
}

// AsyncComponents are documented here: https://github.com/vuejs/rfcs/blob/async-component/active-rfcs/0026-async-component-api.md
describe('defineAsyncComponent', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })
  afterAll(() => {
    vi.useRealTimers()
  })

  it('works with the basic usage', async () => {
    const AsyncHello = defineAsyncComponent(
      () => import('../components/Hello.vue')
    )
    const Comp = defineComponent({
      render() {
        return h('div', [h(AsyncHello)])
      }
    })

    const wrapper = mount(Comp, { global: { config } })
    await flushPromises()
    await vi.dynamicImportSettled()
    expect(wrapper.html()).toContain('Hello world')
  })

  it('works with options usage', async () => {
    const Async = defineAsyncComponent({
      loader: () =>
        new Promise<any>((res) => {
          setTimeout(() => {
            res({
              template: '<div>Async Component</div>'
            })
          }, 75)
        }),
      loadingComponent: {
        template: '<div>Loading Component</div>'
      },
      delay: 10
    })

    const Comp = defineComponent({
      render() {
        return h('div', [h(Async)])
      }
    })

    const wrapper = mount(Comp, { global: { config } })
    vi.advanceTimersByTime(35)
    await flushPromises()
    expect(wrapper.html()).toContain('Loading Component')

    vi.advanceTimersByTime(100)
    await flushPromises()
    expect(wrapper.html()).toContain('Async Component')
  })

  it('catches error and renders ErrorComponent', async () => {
    const Async = defineAsyncComponent({
      loader: () =>
        new Promise<any>((res, rej) => {
          rej('Async component failed to load.')
        }),
      errorComponent: {
        template: '<div>Error Component</div>'
      },
      onError(error, retry, fail, attempts) {
        fail()
      }
    })

    const Comp = defineComponent({
      render() {
        return h('div', [h(Async)])
      }
    })

    const wrapper = mount(Comp, { global: { config } })
    await flushPromises()

    expect(wrapper.html()).toContain('Error Component')
  })

  it('works when AsyncComponent is the root', async () => {
    const AsyncHello = defineAsyncComponent(
      () => import('../components/Hello.vue')
    )
    const Comp = defineComponent({
      render() {
        return h(AsyncHello)
      }
    })

    const wrapper = mount(Comp, { global: { config } })
    await flushPromises()
    await vi.dynamicImportSettled()
    expect(wrapper.html()).toContain('Hello world')
  })

  it('finds Async Component by async definition when using shallow mount', async () => {
    const AsyncHello = defineAsyncComponent(
      () => import('../components/Hello.vue')
    )

    const Comp = defineComponent({
      render() {
        return h(AsyncHello)
      }
    })

    const wrapper = shallowMount(Comp)
    await flushPromises()
    await vi.dynamicImportSettled()
    expect(wrapper.findComponent(AsyncHello).exists()).toBe(true)
  })

  it('finds Async Component by definition when using shallow mount', async () => {
    const AsyncHello = defineAsyncComponent(
      () => import('../components/Hello.vue')
    )

    const Comp = defineComponent({
      render() {
        return h(AsyncHello)
      }
    })

    const wrapper = shallowMount(Comp)
    await flushPromises()
    await vi.dynamicImportSettled()
    expect(wrapper.findComponent(Hello).exists()).toBe(true)
  })
})

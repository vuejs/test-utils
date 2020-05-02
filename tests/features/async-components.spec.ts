import {
  defineAsyncComponent,
  defineComponent,
  h,
  ComponentPublicInstance
} from 'vue'
import flushPromises from 'flush-promises'

import { mount } from '../../src'

// AsyncComponents are documented here: https://github.com/vuejs/rfcs/blob/async-component/active-rfcs/0026-async-component-api.md

describe('defineAsyncComponent', () => {
  it('works with the basic usage', async () => {
    const AsyncHello = defineAsyncComponent(() =>
      import('../components/Hello.vue')
    )
    const Comp = defineComponent({
      render() {
        return h('div', [h(AsyncHello)])
      }
    })

    const wrapper = mount(Comp)
    await flushPromises()
    expect(wrapper.html()).toContain('Hello world')
  })

  it('works with options usage', async (done) => {
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

    const wrapper = mount(Comp)

    setTimeout(() => {
      expect(wrapper.html()).toContain('Loading Component')
    }, 35)

    setTimeout(() => {
      expect(wrapper.html()).toContain('Async Component')
      done()
    }, 100)
  })

  it('works with vue files', async () => {
    const Async = defineAsyncComponent({
      loader: () => import('../components/Hello.vue')
    })

    const Comp = defineComponent({
      render() {
        return h('div', [h(Async)])
      }
    })

    const wrapper = mount(Comp)
    await flushPromises()

    expect(wrapper.html()).toContain('Hello world')
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

    const wrapper = mount(Comp)
    await flushPromises()

    expect(wrapper.html()).toContain('Error Component')
  })

  // TODO: Find out why this does not work
  // Is it valid to have an AsyncComponent as the root? Was it ever?
  it.skip('works when AsyncComponent is the root', async () => {
    const AsyncHello = defineAsyncComponent(() =>
      import('../components/Hello.vue')
    )
    const Comp = defineComponent({
      render() {
        return h(AsyncHello)
      }
    })

    const wrapper = mount(Comp)
    await flushPromises()
    expect(wrapper.html()).toContain('Hello world')
  })
})

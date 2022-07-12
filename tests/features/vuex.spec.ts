import { describe, expect, test } from 'vitest'
import { defineComponent } from 'vue'
import { createStore, useStore } from 'vuex'

import { mount } from '../../src'

describe('vuex', () => {
  test('renders a component using a vuex store', async () => {
    const Foo = defineComponent({
      template: `
        <div>
          count: {{ $store.state.count }}
          <button @click="$store.dispatch('inc')" />
        </div>
      `
    })

    const store = createStore({
      state: {
        count: 1
      },
      mutations: {
        INC(state) {
          state.count += 1
        }
      },
      actions: {
        inc(context) {
          context.commit('INC')
        }
      }
    })

    const wrapper = mount(Foo, {
      global: {
        plugins: [store]
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.html()).toContain('count: 2')
  })

  test('works with an injection key and composition API', () => {
    const store = createStore({
      state() {
        return {
          count: 1
        }
      }
    })

    const key = Symbol()

    const Foo = defineComponent({
      template: `<div>count: {{ store.state.count }}</div>`,
      setup() {
        return {
          store: useStore(key)
        }
      }
    })

    const wrapper = mount(Foo, {
      global: {
        plugins: [[store, key]]
      }
    })

    expect(wrapper.html()).toContain('count: 1')
  })
})

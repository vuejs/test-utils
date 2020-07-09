import { createStore } from 'vuex'

import { mount } from '../../src'

describe('vuex', () => {
  test('renders a component using a vuex store', async () => {
    const Foo = {
      template: `
        <div>
          count: {{ $store.state.count }}
          <button @click="$store.dispatch('inc')" />
        </div>
      `
    }
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
})

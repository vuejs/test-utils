import { mount } from '../../src'

describe('mocks', () => {
  it('mocks a vuex store', async () => {
    const Foo = {
      template: `
        <div>
          count: {{ $store.state.count }}
          <button @click="$store.dispatch('inc')" />
        </div>
      `
    }
    const $store = {
      state: {
        count: 1
      },
      dispatch: jest.fn()
    }

    const wrapper = mount(Foo, {
      global: {
        mocks: { $store }
      }
    })

    expect(wrapper.html()).toContain('count: 1')
    await wrapper.find('button').trigger('click')
    expect($store.dispatch).toHaveBeenCalledWith('inc')
  })
})

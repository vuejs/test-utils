import { h, ComponentOptions } from 'vue'

import { mount } from '../../src'

describe('mounting options: stubs', () => {
  it('stubs a component globally via `stubs`', () => {
    const Foo = {
      name: 'Foo',
      render() {
        return h('p')
      }
    }
    const Component: ComponentOptions = {
      render() {
        return h('div', [h('span'), h(Foo)])
      }
    }

    const wrapper = mount(Component, {
      global: {
        stubs: {
          Foo: true
        }
      }
    })

    console.log(wrapper.html())
  })
})

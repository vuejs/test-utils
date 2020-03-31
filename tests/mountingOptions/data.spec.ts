import { h } from 'vue'

import { mount } from '../../src'

describe('mounting options: data', () => {
  it('merges data from mounting options with component', () => {
    const Comp = {
      data() {
        return {
          foo: 'foo',
          bar: 'bar'
        }
      },
      render() {
        return h('div', `Foo is ${this.foo} bar is ${this.bar}`)
      }
    }

    const wrapper = mount(Comp, {
      data() {
        return {
          foo: 'qux'
        }
      }
    })

    expect(wrapper.text()).toBe('Foo is qux bar is bar')
  })
})

import { h } from 'vue'
import { mount } from '../../src'

describe('globalProperties', () => {
  it('adds globally available properties to the component', () => {
    const Component = {
      render() {
        return h('div', this.foo)
      }
    }
    const wrapper = mount(Component, {
      globalProperties: {
        foo: 'bar'
      }
    })
    expect(wrapper.html()).toEqual('<div>bar</div>')
  })
})

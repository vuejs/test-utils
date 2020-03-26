import { h } from 'vue'

import { mount } from '../../src'

describe('mounting options: shallow', () => {
  it('stubs everything', () => {
    const Bar = {
      name: 'Bar',
      render() {
        return h('div', 'Bar')
      }
    }
    const Foo = {
      name: 'Foo',
      render() {
        return h('div', [h('p', 'hello'), h(Bar)])
      }
    }

    const wrapper = mount(Foo, {
      shallow: true
    })

    expect(wrapper.html()).toBe('<div><p>hello</p><bar-stub></bar-stub></div>')
    expect(wrapper.find('bar-stub').exists()).toBeTruthy()
  })
})

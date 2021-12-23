import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('get', () => {
  test('returns the element if it exists', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [h('span', { id: 'my-span' })])
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.get('#my-span')).not.toBeNull()
  })

  test('returns the element if it is a root element inside Suspense', () => {
    const Async = defineComponent({
      // works if there is a root element
      // template: '<div><h1>Hello</h1><span id="my-span">There</span></div>'
      // otherwise does not find the element
      template: '<h1>Hello</h1><span id="my-span">There</span>'
    })
    const Component = defineComponent({
      components: { Async },
      template: '<Suspense><Async/></Suspense>'
    })

    const wrapper = mount(Component)
    expect(wrapper.get('#my-span')).not.toBeNull()
  })

  test('throws if it does not exist', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [h('span', { id: 'my-span' })])
      }
    })

    const wrapper = mount(Component)
    expect(() => wrapper.get('#other-span')).toThrowError(
      'Unable to get #other-span within: <div><span id="my-span"></span></div>'
    )
  })
})

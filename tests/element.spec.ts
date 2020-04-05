import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('element', () => {
  it('returns element when mounting single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, 'element content')
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.element.nodeName).toBe('DIV')
  })

  it('returns the VTU root element when mounting multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [h('div', {}, 'foo'), h('div', {}, 'bar'), h('div', {}, 'baz')]
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.element.innerHTML).toBe(
      '<div>foo</div><div>bar</div><div>baz</div>'
    )
  })
})

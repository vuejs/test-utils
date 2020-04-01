import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('html', () => {
  it('returns html when mounting single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, 'Text content')
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>Text content</div>')
  })

  it('returns the html when mounting multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [h('div', {}, 'foo'), h('div', {}, 'bar'), h('div', {}, 'baz')]
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>foo</div><div>bar</div><div>baz</div>')
  })
})

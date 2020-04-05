import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('text', () => {
  it('returns text when mounting single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, 'Text content')
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.text()).toBe('Text content')
  })

  it('returns text when mounting multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [h('div', {}, 'foo'), h('div', {}, 'bar'), h('div', {}, 'baz')]
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.text()).toBe('foobarbaz')
  })
})

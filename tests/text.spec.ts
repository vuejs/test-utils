import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'

import { mount } from '../src'

const MultiRootText = defineComponent({
  render: () => [h('div', {}, 'foo'), h('div', {}, 'bar'), h('div', {}, 'baz')]
})
const ReturnSlot = defineComponent({
  render() {
    return this.$slots.default!({})
  }
})

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
    const wrapper = mount(MultiRootText)

    expect(wrapper.text()).toBe('foobarbaz')
  })

  it('returns empty string when the root element is a comment', () => {
    const Component = defineComponent({
      template: '<div v-if="condition">Hello</div>',
      setup() {
        return { condition: false }
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.text()).toBe('')
  })

  it('returns correct text for root component with multiple roots', () => {
    const Parent = defineComponent({
      components: { MultiRootText },
      template: '<MultiRootText/>'
    })

    const wrapper = mount(Parent)

    expect(wrapper.findComponent(MultiRootText).text()).toBe('foobarbaz')
    expect(wrapper.text()).toBe('foobarbaz')
  })

  it('returns correct text for root slot', () => {
    const Parent = defineComponent({
      components: { ReturnSlot },
      template: `
    <ReturnSlot>
      <div>foo</div>
      <div>bar</div>
      <div>baz</div>
    </ReturnSlot>`
    })

    const wrapper = mount(Parent)
    expect(wrapper.text()).toBe('foobarbaz')
  })

  it('should return text for multi root functional component', () => {
    const Foo = () => h(MultiRootText)
    const wrapper = mount(Foo)

    expect(wrapper.text()).toBe('foobarbaz')
  })

  it('returns correct text for root slot with functional component', () => {
    const wrapper = mount(() =>
      h(ReturnSlot, {}, () => [
        h('div', {}, 'foo'),
        h('div', {}, 'bar'),
        h('div', {}, 'baz')
      ])
    )
    expect(wrapper.text()).toBe('foobarbaz')
  })

  it('returns correct text for root slot with nested component', () => {
    const wrapper = mount(() => h(ReturnSlot, {}, () => h(MultiRootText)))
    expect(wrapper.text()).toBe('foobarbaz')
  })
})

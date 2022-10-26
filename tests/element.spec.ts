import { describe, expect, it, vi } from 'vitest'
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

  it('returns the VTU root element when mounting component with slot', () => {
    const NestedComponent = defineComponent({
      template: `<h1><slot></slot></h1>`
    })

    const RootComponent = defineComponent({
      components: { NestedComponent },
      template: `<nested-component>test</nested-component>`
    })
    const wrapper = mount(RootComponent)

    expect(wrapper.element.tagName).toBe('H1')
    expect(wrapper.html()).toBe('<h1>test</h1>')
  })

  it('returns the VTU root element when mounting multiple root nodes', () => {
    const wrapper = mount(MultiRootText)

    expect(wrapper.element.innerHTML).toBe(
      '<div>foo</div><div>bar</div><div>baz</div>'
    )
  })

  it('returns correct element for root component with multiple roots', () => {
    const Parent = defineComponent({
      components: { MultiRootText },
      template: '<MultiRootText/>'
    })

    const wrapper = mount(Parent)

    expect(wrapper.findComponent(MultiRootText).text()).toBe('foobarbaz')
    expect(wrapper.text()).toBe('foobarbaz')
  })

  it('returns correct element for root slot', () => {
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
    expect(wrapper.element.innerHTML).toBe(
      '<div>foo</div><div>bar</div><div>baz</div>'
    )
  })

  it('should return element for multi root functional component', () => {
    const Foo = () => h(MultiRootText)
    const wrapper = mount(Foo)

    expect(wrapper.element.innerHTML).toBe(
      '<div>foo</div><div>bar</div><div>baz</div>'
    )
  })

  it('returns correct element for root slot with functional component', () => {
    const wrapper = mount(() =>
      h(ReturnSlot, {}, () => [
        h('div', {}, 'foo'),
        h('div', {}, 'bar'),
        h('div', {}, 'baz')
      ])
    )
    expect(wrapper.element.innerHTML).toBe(
      '<div>foo</div><div>bar</div><div>baz</div>'
    )
  })

  it('returns correct element for root slot with nested component', () => {
    const wrapper = mount(() => h(ReturnSlot, {}, () => h(MultiRootText)))
    expect(wrapper.element.innerHTML).toBe(
      '<div>foo</div><div>bar</div><div>baz</div>'
    )
  })

  it('returns correct element for component which renders other component with array of vnodes in default slot', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Nested = {
      template: '<div class="nested-root"><slot></slot></div>'
    }
    const Root = () => h(Nested, {}, [h('div', {}, 'foo'), h('div', {}, 'bar')])

    const wrapper = mount(Root)
    expect(wrapper.element.innerHTML).toBe('<div>foo</div><div>bar</div>')
    // we're expecting a warning from Vue as we're using non-function slots
    expect(spy.mock.calls[0][0]).toContain(
      'Non-function value encountered for default slot'
    )
  })
})

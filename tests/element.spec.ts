import { describe, expect, it, vi } from 'vitest'
import {
  type FunctionalComponent,
  defineComponent,
  h,
  nextTick,
  ref
} from 'vue'

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

  it('returns correct output for functional component with multiple text roots', () => {
    const Func = () => ['foo', 'bar']

    const Parent = defineComponent({
      name: 'Parent',
      components: { Func },
      template: '<div><Func/></div>'
    })
    const wrapper = mount(Parent)

    expect(wrapper.findComponent(Func).html()).toBe('foo\nbar')
    expect(wrapper.findComponent(Func).text()).toBe('foobar')
  })

  it('returns correct output for functional component with multiple element roots', () => {
    const Func = () => [h('div', {}, 'foo'), h('div', {}, 'bar')]

    const Parent = defineComponent({
      name: 'Parent',
      components: { Func },
      template: '<div><Func/></div>'
    })
    const wrapper = mount(Parent)

    expect(wrapper.findComponent(Func).html()).toBe(
      '<div>foo</div>\n<div>bar</div>'
    )
    expect(wrapper.findComponent(Func).text()).toBe('foobar')
  })

  it('returns correct output for functional component with nested array roots', () => {
    const Func: FunctionalComponent = (_, { slots }) => [
      h('h1', {}, 'title'),
      slots.default?.()
    ]

    const Parent = defineComponent({
      components: { Func },
      template: '<div><Func><span>foo</span><span>bar</span></Func></div>'
    })
    const func = mount(Parent).findComponent(Func)

    expect(func.html()).toBe(
      '<h1>title</h1>\n<span>foo</span>\n<span>bar</span>'
    )
    expect(func.text()).toBe('titlefoobar')
  })

  it('finds elements inside functional component with multiple roots', () => {
    const Func = () => [
      h('div', { class: 'foo' }, [h('span', {}, 'nested')]),
      h('div', { class: 'bar' }, 'bar')
    ]

    const Parent = defineComponent({
      components: { Func },
      template: '<div><Func/><div class="outside" /></div>'
    })
    const func = mount(Parent).findComponent(Func)

    expect(func.get('span').text()).toBe('nested')
    expect(func.findAll('div')).toHaveLength(2)
    expect(func.find('.outside').exists()).toBe(false)
  })

  it('finds components inside functional component with multiple roots', () => {
    const Child = defineComponent({ name: 'Child', render: () => h('i') })
    const MultiRoot = defineComponent({ render: () => [h('b'), h('b')] })
    const Func = () => [h(Child), h(MultiRoot)]

    const Parent = defineComponent({
      components: { Func, Child },
      template: '<div><Func/><Child/></div>'
    })
    const func = mount(Parent).findComponent(Func)

    expect(func.findAllComponents(Child)).toHaveLength(1)
    expect(func.findComponent(MultiRoot).exists()).toBe(true)
  })

  it('finds components inside functional component with multiple roots after re-render', async () => {
    const Child = defineComponent({ name: 'Child', render: () => h('i') })
    const Func: FunctionalComponent<{ count: number }> = props =>
      Array.from({ length: props.count }, (_, i) => h(Child, { key: i }))
    const count = ref(1)
    const Parent = defineComponent({
      render: () => h('div', [h(Func, { count: count.value })])
    })
    const func = mount(Parent).findComponent(Func)

    count.value = 2
    await nextTick()

    expect(func.findAllComponents(Child)).toHaveLength(2)
    expect(func.findAll('i')).toHaveLength(2)
  })

  it('text() reads DOM content for single-root components with empty vnode children', () => {
    const Child = defineComponent({
      render: () => h('button')
    })
    const Parent = defineComponent({
      components: { Child },
      template: '<Child/>'
    })

    const wrapper = mount(Parent)
    const child = wrapper.findComponent(Child)
    child.element.textContent = 'foobar'

    expect(child.text()).toBe('foobar')
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

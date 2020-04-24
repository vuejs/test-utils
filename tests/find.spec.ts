import { defineComponent, h } from 'vue'

import { mount } from '../src'
import SuspenseComponent from './components/Suspense.vue'

describe('find', () => {
  it('find using single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [h('span', { id: 'my-span' })])
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('#my-span').exists()).toBe(true)
  })

  it('find using multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [h('div', 'text'), h('span', { id: 'my-span' })]
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('#my-span').exists()).toBe(true)
  })

  it('returns the root element in single root element', () => {
    const Component = defineComponent({
      render() {
        return h('div', { class: 'foo' }, 'text')
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('.foo').exists()).toBe(true)
  })

  test('works with suspense', async () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
    expect(wrapper.find('div').exists()).toBeTruthy()
  })
})

describe('findAll', () => {
  test('findAll using single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [
          h('span', { className: 'span' }),
          h('span', { className: 'span' })
        ])
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.findAll('.span')).toHaveLength(2)
  })

  test('findAll using multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [
          h('span', { className: 'span' }),
          h('span', { className: 'span' })
        ]
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.findAll('.span')).toHaveLength(2)
  })

  test('works with suspense', async () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
    expect(wrapper.findAll('div')).toBeTruthy()
  })

  test('chaining finds compiles successfully', () => {
    const Bar = {
      render() {
        return h('span', { id: 'bar' })
      }
    }
    const Foo = {
      render() {
        return h('span', { id: 'foo' }, h(Bar))
      }
    }
    const wrapper = mount(Foo)

    expect(wrapper.find('#foo').find('#bar').exists()).toBe(true)
  })
})

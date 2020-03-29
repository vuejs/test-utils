import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('find', () => {
  it('find using single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, [h('span', { id: 'my-span' })])
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('#my-span')).toBeTruthy()
  })

  it('find using multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [h('div', 'text'), h('span', { id: 'my-span' })]
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('#my-span')).toBeTruthy()
  })

  it('returns the root element in single root element', () => {
    const Component = defineComponent({
      render() {
        return h('div', { class: 'foo' }, 'text')
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('.foo')).toBeTruthy()
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
})

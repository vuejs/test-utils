import { defineComponent, h } from 'vue'

import { mount } from '../src'
import SuspenseComponent from './components/Suspense.vue'
import Hello from './components/Hello.vue'

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

  it('finds deeply nested vue components', () => {
    const compC = {
      template: '<div class="C">C</div>'
    }
    const compB = {
      template: '<div class="B">TextBefore<comp-c/>TextAfter<comp-c/></div>',
      components: { compC }
    }
    const compA = {
      template: '<div class="A"><comp-b/><hello ref="b"/></div>',
      components: { compB, Hello }
    }
    const wrapper = mount(compA)
    // find by ref
    expect(wrapper.findByComponent({ ref: 'b' })).toBeTruthy()
    // find by DOM selector
    expect(wrapper.findByComponent('.C').el.textContent).toEqual('C')
    expect(wrapper.findByComponent({ name: 'Hello' }).el.textContent).toBe(
      'Hello world'
    )
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
})

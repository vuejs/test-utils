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

  test('find using current node after findAllComponents', () => {
    const ComponentB = defineComponent({
      name: 'ComponentB',
      template: '<div><slot></slot></div>'
    })

    const ComponentA = defineComponent({
      name: 'ComponentA',
      template: `
        <div>
          <component-b v-for="item in [1, 2]" :key="item">
            <input type="text" :value="item">
          </component-b>
        </div> 
      `,
      components: { ComponentB }
    })

    const wrapper = mount(ComponentA)
    const firstCompB = wrapper.findComponent({ name: 'ComponentB' })
    const lastCompB = wrapper.findAllComponents({ name: 'ComponentB' })[1]

    expect(firstCompB.find('input').element.value).toBe('1')
    expect(lastCompB.find('input').element.value).toBe('2')
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

  it('can be chained', () => {
    const Component = defineComponent({
      render() {
        return h('div', { class: 'foo' }, [h('div', { class: 'bar' })])
      }
    })

    const wrapper = mount(Component)
    expect(wrapper.find('.foo').find('.bar').exists()).toBe(true)
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

  test('findAll using current node after findAllComponents', () => {
    const ComponentB = defineComponent({
      name: 'ComponentB',
      template: '<div><slot></slot></div>'
    })

    const ComponentA = defineComponent({
      name: 'ComponentA',
      template: `
        <div>
          <component-b v-for="item in [1, 2]" :key="item">
            <input type="text" :value="item">
          </component-b>
        </div>
      `,
      components: { ComponentB }
    })

    const wrapper = mount(ComponentA)
    const firstCompB = wrapper.findComponent({ name: 'ComponentB' })
    const lastCompB = wrapper.findAllComponents({ name: 'ComponentB' })[1]

    expect(firstCompB.findAll('input')[0].element.value).toBe('1')
    expect(lastCompB.findAll('input')[0].element.value).toBe('2')
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

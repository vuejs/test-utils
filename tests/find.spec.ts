import { defineComponent, h, nextTick } from 'vue'

import { mount, VueWrapper } from '../src'
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

  it('returns the root element from dom wrapper if it matches', () => {
    const Component = defineComponent({
      render() {
        return h('div', { class: 'foo' }, 'text')
      }
    })

    const wrapper = mount(Component)
    const domWrapper = wrapper.find('.foo')
    expect(domWrapper.find('.foo').exists()).toBe(true)
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

  test('can wrap `find` in an async function', async () => {
    async function findAfterNextTick(
      wrapper: VueWrapper<any>,
      selector: string
    ) {
      await nextTick()
      return wrapper.find(selector)
    }

    const wrapper = mount({
      template: `<div>My component</div>`
    })
    const foundElement = await findAfterNextTick(
      wrapper,
      '.something-that-does-not-exist'
    )
    expect(foundElement.exists()).toBeFalsy()
  })

  test('handle empty root node', () => {
    const EmptyTestComponent = {
      name: 'EmptyTestComponent',
      render: () => null
    }
    const Component = defineComponent({
      render() {
        return h('div', [h(EmptyTestComponent)])
      }
    })

    const wrapper = mount(Component)
    const etc = wrapper.findComponent({ name: 'EmptyTestComponent' })
    expect(etc.find('p').exists()).toBe(false)
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

  test('handle empty/comment root node', () => {
    const EmptyTestComponent = {
      name: 'EmptyTestComponent',
      render: () => null
    }
    const Component = defineComponent({
      render() {
        return h('div', [h(EmptyTestComponent)])
      }
    })

    const wrapper = mount(Component)
    const etc = wrapper.findComponent({ name: 'EmptyTestComponent' })
    expect(etc.findAll('p')).toHaveLength(0)
  })
})

import { defineComponent, h, nextTick, Fragment } from 'vue'

import { mount, VueWrapper } from '../src'
import SuspenseComponent from './components/Suspense.vue'
import MultipleRootRender from './components/MultipleRootRender.vue'

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

  describe('find DOM element by ref', () => {
    it('works for root element', () => {
      const Component = defineComponent({
        render() {
          return h('div', {}, [h('span', { ref: 'span', id: 'my-span' })])
        }
      })
      const wrapper = mount(Component)
      expect(wrapper.find({ ref: 'span' }).exists()).toBe(true)
      expect(wrapper.find({ ref: 'span' }).attributes('id')).toBe('my-span')
    })

    it('works when ref is pointing to non-element node', () => {
      const Component = defineComponent({
        render() {
          return h('div', null, h(Fragment, { ref: 'plain' }, ['hello']))
        }
      })

      const wrapper = mount(Component)
      expect(wrapper.find({ ref: 'plain' }).exists()).toBe(true)
      expect(wrapper.find({ ref: 'plain' }).element).toBeInstanceOf(Text)
    })

    it('does not find ref located in the same component but not in current DOM wrapper', () => {
      const Component = defineComponent({
        render() {
          return h('div', [
            h('span', { ref: 'span', id: 'my-span' }),
            h('div', { class: 'search-target' })
          ])
        }
      })
      const wrapper = mount(Component)
      expect(
        wrapper.find('.search-target').find({ ref: 'span' }).exists()
      ).toBe(false)
    })
  })

  it('find using current node after findAllComponents', () => {
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

  it('works with suspense', async () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
    expect(wrapper.find('div').exists()).toBeTruthy()
  })

  it('can wrap `find` in an async function', async () => {
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

  it('handle empty root node', () => {
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

  it('finds root node with SFC render function', () => {
    const wrapper = mount(MultipleRootRender)
    expect(wrapper.find('a').exists()).toBe(true)
  })
})

describe('findAll', () => {
  it('findAll using single root node', () => {
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

  it('findAll using multiple root nodes', () => {
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

  it('findAll using current node after findAllComponents', () => {
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

  it('works with suspense', async () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
    expect(wrapper.findAll('div')).toBeTruthy()
  })

  it('chaining finds compiles successfully', () => {
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

  it('handle empty/comment root node', () => {
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

  describe('with multiple root nodes', () => {
    const MultipleRootComponentWithRenderFn = defineComponent({
      render() {
        return [
          h(
            'div',
            { class: 'root1' },
            h('div', { class: 'target1' }, 'target1')
          ),
          h(
            'div',
            { class: 'root2' },
            h('div', { class: 'target2' }, 'target2')
          ),
          h(
            'div',
            { class: 'root3' },
            h('div', { class: 'target3' }, 'target3')
          )
        ]
      }
    })

    const MultipleRootComponentWithTemplate = defineComponent({
      template: [
        '<div class="root1"><div class="target1">target1</div></div>',
        '<div class="root2"><div class="target2">target2</div></div>',
        '<div class="root3"><div class="target3">target3</div></div>'
      ].join('\n')
    })

    const WrapperComponent = defineComponent({
      components: {
        MultipleRootComponentWithTemplate,
        MultipleRootComponentWithRenderFn
      },
      template: [
        '<div><multiple-root-component-with-template /></div>',
        '<div><multiple-root-component-with-render-fn /></div>'
      ].join('\n')
    })
    it('find one of root nodes', () => {
      const Component = defineComponent({
        render() {
          return [h('div', 'text'), h('span', { id: 'my-span' })]
        }
      })

      const wrapper = mount(Component)
      expect(wrapper.find('#my-span').exists()).toBe(true)
    })

    it('finds second root node when component is not mount root', () => {
      const wrapper = mount(WrapperComponent)
      expect(
        wrapper
          .findComponent(MultipleRootComponentWithRenderFn)
          .find('.root2')
          .exists()
      ).toBe(true)
      expect(
        wrapper
          .findComponent(MultipleRootComponentWithTemplate)
          .find('.root2')
          .exists()
      ).toBe(true)
    })

    it('finds contents of second root node when component is not mount root', () => {
      const wrapper = mount(WrapperComponent)
      expect(
        wrapper
          .findComponent(MultipleRootComponentWithTemplate)
          .find('.target2')
          .exists()
      ).toBe(true)
      expect(
        wrapper
          .findComponent(MultipleRootComponentWithRenderFn)
          .find('.target2')
          .exists()
      ).toBe(true)
    })

    it('finds all root nodes with SFC render function', () => {
      const wrapper = mount(MultipleRootRender)
      expect(wrapper.findAll('a')).toHaveLength(3)
    })
  })
})

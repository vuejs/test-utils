import { describe, expect, it, vi } from 'vitest'
import type { VueWrapper } from '../src'
import { mount, shallowMount } from '../src'
import WithProps from './components/WithProps.vue'
import PropWithSymbol from './components/PropWithSymbol.vue'
import Hello from './components/Hello.vue'
import { defineComponent, h, isRef, ref } from 'vue'
import Title from './components/FunctionComponent'
import Issue1476 from './components/Issue1476.vue'

describe('props', () => {
  it('returns a single prop applied to a component', () => {
    const wrapper = mount(WithProps, { props: { msg: 'ABC' } })
    expect(wrapper.props('msg')).toEqual('ABC')
  })

  it('returns all props applied to a component', () => {
    const wrapper = mount(WithProps, { props: { msg: 'ABC' } })
    expect(wrapper.props()).toEqual({ msg: 'ABC' })
  })

  it('returns undefined if props does not exist', () => {
    const wrapper = mount(WithProps, { props: { msg: 'ABC' } })
    // @ts-expect-error :: non-existent prop
    expect(wrapper.props('foo')).toEqual(undefined)
  })

  it('returns empty object for components without props', () => {
    const wrapper = mount(Hello)
    expect(wrapper.props()).toEqual({})
  })

  it('returns applied props on a stubbed component with boolean', () => {
    const Foo = {
      name: 'Foo',
      template: 'Foo',
      props: {
        foo: String,
        bar: Boolean,
        object: Object
      }
    }
    const Component = {
      data: () => ({ object: {} }),
      template: '<div><foo foo="foo" bar :object="object" /></div>',
      components: { Foo }
    }
    const wrapper = mount(Component, {
      global: {
        stubs: ['Foo']
      }
    })
    expect(wrapper.findComponent({ name: 'Foo' }).props()).toEqual({
      bar: true,
      foo: 'foo',
      object: {}
    })
  })

  it('returns props on a stubbed component with a custom implementation', () => {
    const Foo = {
      name: 'Foo',
      template: 'Foo',
      props: ['foo', 'bar', 'object']
    }
    const FooStub = {
      name: 'Foo',
      template: 'FooStub',
      props: {
        foo: String,
        bar: Boolean,
        object: Object
      }
    }
    const Component = {
      data: () => ({ object: {} }),
      template: '<div><foo foo="foo" bar :object="object" /></div>',
      components: { Foo }
    }

    const wrapper = mount(Component, {
      global: {
        stubs: { Foo: FooStub }
      }
    })
    expect(wrapper.findComponent({ name: 'Foo' }).props()).toEqual({
      bar: true,
      foo: 'foo',
      object: {}
    })
  })

  it('should return the updated props on 2 way binding', async () => {
    const component = defineComponent({
      template: '<button @click="increment"></button>',
      props: {
        modelValue: {
          type: Number,
          required: true
        }
      },
      emits: ['update:modelValue'],
      setup(props, ctx) {
        return {
          increment: () => ctx.emit('update:modelValue', props.modelValue + 1)
        }
      }
    })

    const wrapper = mount(component, {
      props: {
        modelValue: 1,
        'onUpdate:modelValue': async (modelValue: number) => {
          await wrapper.setProps({ modelValue })
        }
      }
    })

    expect(wrapper.props('modelValue')).toBe(1)
    await wrapper.trigger('click')
    expect(wrapper.props('modelValue')).toBe(2)
  })

  it('returns reactive props on a stubbed component', async () => {
    const Foo = {
      name: 'Foo',
      template: 'Foo',
      props: {
        foo: String
      }
    }
    const Component = defineComponent({
      data: () => ({ foo1: 'old value', foo2: 'foo2 value' }),
      template:
        '<div><foo id="foo1" :foo="foo1" /><foo id="foo2" :foo="foo2"/><button @click="buttonClick">Click me</button></div>',
      methods: {
        buttonClick() {
          this.foo1 = 'new value'
        }
      },
      components: { Foo }
    })

    const wrapper = mount(Component, {
      global: {
        stubs: ['Foo']
      }
    })

    const [fooCmp1, barCmp1] = wrapper.findAllComponents({ name: 'Foo' })
    expect(fooCmp1.props()).toEqual({ foo: 'old value' })
    expect(barCmp1.props()).toEqual({ foo: 'foo2 value' })
    expect(wrapper.find('#foo1').attributes().foo).toBe('old value')
    expect(wrapper.find('#foo2').attributes().foo).toBe('foo2 value')

    await wrapper.find('button').trigger('click')

    const [fooCmp2, barCmp2] = wrapper.findAllComponents({ name: 'Foo' })
    expect(fooCmp2.props()).toEqual({ foo: 'new value' })
    expect(barCmp2.props()).toEqual({ foo: 'foo2 value' })
    expect(wrapper.find('#foo1').attributes().foo).toBe('new value')
    expect(wrapper.find('#foo2').attributes().foo).toBe('foo2 value')
  })

  it('should forward ref as raw prop', () => {
    const TestComponent = defineComponent({
      props: {
        refProp: {
          type: [Object],
          required: true
        }
      },
      setup(props) {
        return () =>
          h('div', [
            h('h1', isRef(props.refProp) ? 'is ref' : 'is not ref'),
            h('span', props.refProp.value)
          ])
      }
    })

    const refProp = ref('Some value')
    const wrapper = mount(TestComponent, {
      props: { refProp }
    })
    expect(wrapper.find('h1').text()).toBe('is ref')
    expect(wrapper.find('span').text()).toBe('Some value')
  })

  it('should keep props as same object', async () => {
    // https://github.com/vuejs/test-utils/issues/1476
    const wrapper = mount(Issue1476, {
      props: {
        availableFields: [{ name: 'Animals' }, { name: 'Cities' }]
      }
    })

    expect(wrapper.find('.subField').exists()).toBe(false)

    await wrapper.findAll('.field')[0].trigger('click')

    expect(wrapper.find('.selectedField').exists()).toBe(true)
    expect(wrapper.find('.selectedField').text()).toBe('Animals')

    await wrapper.findAll('.field')[1].trigger('click')

    expect(wrapper.find('.selectedField').exists()).toBe(true)
    expect(wrapper.find('.selectedField').text()).toBe('Cities')
  })

  it('returns props of stubbed root component', async () => {
    const ChildComponent = defineComponent({
      props: {
        value: {
          type: Number,
          required: true
        }
      },
      template: '<div>{{ value }}</div>'
    })

    const TestComponent = defineComponent({
      components: { ChildComponent },
      template: '<ChildComponent :value="2"/>'
    })

    const wrapper = shallowMount(TestComponent)
    expect(
      wrapper.findComponent({ name: 'ChildComponent' }).props()
    ).toStrictEqual({ value: 2 })
    expect(
      (wrapper.findComponent('child-component-stub') as VueWrapper).props()
    ).toStrictEqual({ value: 2 })
  })

  it('returns reactive props on a stubbed component shallow case', async () => {
    const Foo = {
      name: 'Foo',
      template: 'Foo',
      props: {
        foo: String
      }
    }
    const Component = defineComponent({
      data: () => ({ foo: 'old value' }),
      template:
        '<div><foo :foo="foo" /><button @click="buttonClick">Click me</button></div>',
      methods: {
        buttonClick() {
          this.foo = 'new value'
        }
      },
      components: { Foo }
    })

    const wrapper = mount(Component, {
      shallow: true
    })
    const fooCmp = wrapper.findComponent({ name: 'Foo' })

    expect(fooCmp.props()).toEqual({
      foo: 'old value'
    })

    await wrapper.find('button').trigger('click')

    expect(fooCmp.props()).toEqual({
      foo: 'new value'
    })
  })

  it('https://github.com/vuejs/test-utils/issues/440', async () => {
    const Foo = defineComponent({
      name: 'Foo',
      props: {
        foo: String
      },
      emits: ['update:foo'],
      setup(props, ctx) {
        return () =>
          h(
            'div',
            {
              onClick: () => {
                ctx.emit('update:foo', 'world')
              }
            },
            props.foo
          )
      }
    })

    const wrapper = mount(Foo, {
      props: {
        foo: 'hello'
      }
    })

    expect(wrapper.text()).toEqual('hello')

    await wrapper.trigger('click')

    expect(wrapper.text()).toEqual('hello')
  })

  it('stub function props when shallow mounting', () => {
    const Comp = defineComponent({
      name: 'Comp',
      template: `<div>Test</div>`,
      props: ['fn']
    })

    const wrapper = shallowMount({
      render() {
        return h(Comp, { fn: () => {} })
      }
    })

    expect(wrapper.html()).toBe('<comp-stub fn="[Function]"></comp-stub>')
  })

  // https://github.com/vuejs/test-utils/issues/2411
  it('should not warn on stringify props in stubs', () => {
    const spy = vi.spyOn(console, 'warn').mockReturnValue()
    const Comp = defineComponent({
      name: 'Comp',
      template: `<transition @enter="() => {}"></transition>`
    })

    const wrapper = mount(Comp)

    expect(wrapper.html()).toContain('<transition-stub')
    expect(spy).not.toHaveBeenCalled()
  })

  describe('edge case with symbol props and stubs', () => {
    it('works with Symbol as default', () => {
      const Comp = defineComponent({
        template: `<div>Symbol: {{ sym }}</div>`,
        props: {
          sym: {
            type: Symbol,
            default: () => Symbol()
          }
        }
      })

      const wrapper = shallowMount(Comp)

      expect(wrapper.html()).toBe('<div>Symbol: Symbol()</div>')
    })

    it('works with symbol as array syntax', () => {
      const Comp = defineComponent({
        name: 'Comp',
        template: `<div>Symbol: {{ sym }}</div>`,
        props: ['sym']
      })

      const wrapper = shallowMount({
        render() {
          return h(Comp, { sym: Symbol() })
        }
      })

      expect(wrapper.html()).toBe('<comp-stub sym="Symbol()"></comp-stub>')
    })

    it('works with symbol as default from SFC', () => {
      const App = defineComponent({
        template: `<PropWithSymbol :sym="sym" />`,
        components: { PropWithSymbol },
        data() {
          return {
            sym: Symbol()
          }
        }
      })
      const wrapper = shallowMount(App)

      expect(wrapper.html()).toBe(
        '<prop-with-symbol-stub sym="Symbol()"></prop-with-symbol-stub>'
      )
    })

    it('should get props from functional component', async () => {
      const wrapper = mount(Title, {
        props: {
          title: 'nickname'
        }
      })
      expect(wrapper.props('title')).toBe('nickname')
    })
  })
})

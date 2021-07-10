import { mount } from '../src'
import WithProps from './components/WithProps.vue'
import Hello from './components/Hello.vue'
import { defineComponent, h } from 'vue'

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
        'onUpdate:modelValue': async (modelValue: number) =>
          wrapper.setProps({ modelValue })
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
    let fooCmp = wrapper.findComponent({ name: 'Foo' })

    expect(fooCmp.props()).toEqual({
      foo: 'old value'
    })

    await wrapper.find('button').trigger('click')

    expect(fooCmp.props()).toEqual({
      foo: 'new value'
    })
  })

  it('https://github.com/vuejs/vue-test-utils-next/issues/440', async () => {
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
})

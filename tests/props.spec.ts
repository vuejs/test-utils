import { mount } from '../src'
import WithProps from './components/WithProps.vue'
import Hello from './components/Hello.vue'
import { defineComponent } from 'vue'

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
    });

    const wrapper = mount(component, {
      props: {
        modelValue: 1
      }
    })

    expect(wrapper.props('modelValue')).toBe(1);
    await wrapper.trigger('click');
    expect(wrapper.props('modelValue')).toBe(2);
  })
})

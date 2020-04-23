import { h, ComponentOptions } from 'vue'

import { mount } from '../../src'
import Hello from '../components/Hello.vue'
import ComponentWithoutName from '../components/ComponentWithoutName.vue'
import ComponentWithSlots from '../components/ComponentWithSlots.vue'

describe('mounting options: stubs', () => {
  it('handles Array syntax', () => {
    const Foo = {
      name: 'Foo',
      render() {
        return h('p')
      }
    }
    const Component: ComponentOptions = {
      render() {
        return h(() => [h('div'), h(Foo)])
      }
    }

    const wrapper = mount(Component, {
      global: {
        stubs: ['foo']
      }
    })

    expect(wrapper.html()).toBe('<div></div><foo-stub></foo-stub>')
  })

  it('stubs a functional component by its variable declaration name', () => {
    const FunctionalFoo = (props) => h('p', props, 'Foo Text')

    const Component = {
      template: '<div><foo/></div>',
      components: { Foo: FunctionalFoo }
    }

    const wrapper = mount(Component, {
      global: {
        stubs: {
          FunctionalFoo: true
        }
      }
    })

    expect(wrapper.html()).toEqual(
      '<div><functional-foo-stub></functional-foo-stub></div>'
    )
  })

  // TODO: fix this
  // https://github.com/vuejs/vue-test-utils-next/pull/80#issuecomment-617188758
  it.skip('stubs a component without a name', () => {
    const Component = {
      template: '<div><foo/></div>',
      components: { Foo: ComponentWithoutName }
    }
    const wrapper = mount(Component, {
      global: {
        stubs: { Foo: true }
      }
    })

    expect(wrapper.html()).toEqual('<div><foo-stub></foo-stub></div>')
  })

  it('passes all attributes to stubbed components', () => {
    const Foo = {
      name: 'Foo',
      props: ['dynamic'],
      template: '<p class="Foo">Foo</p>'
    }
    const Component = {
      data: () => ({ dynamic: { foo: 'bar' } }),
      template:
        '<div><foo class="bar" test-id="foo" :dynamic="dynamic"/></div>',
      components: { Foo }
    }
    const wrapper = mount(Component, {
      global: {
        stubs: { Foo: true }
      }
    })

    expect(wrapper.html()).toEqual(
      '<div><foo-stub class="bar" test-id="foo"></foo-stub></div>'
    )
  })

  it('stubs in a fragment', () => {
    const Foo = {
      name: 'Foo',
      render() {
        return h('p')
      }
    }
    const Component: ComponentOptions = {
      render() {
        return h(() => [h('div'), h(Foo)])
      }
    }

    const wrapper = mount(Component, {
      global: {
        stubs: {
          Foo: true
        }
      }
    })

    expect(wrapper.html()).toBe('<div></div><foo-stub></foo-stub>')
  })

  it('prevents lifecycle hooks triggering in a stub', () => {
    const onBeforeMount = jest.fn()
    const beforeCreate = jest.fn()
    const Foo = {
      name: 'Foo',
      setup() {
        onBeforeMount(onBeforeMount)
        return () => h('div')
      },
      beforeCreate
    }
    const Comp = {
      render() {
        return h(Foo)
      }
    }

    const wrapper = mount(Comp, {
      global: {
        stubs: {
          Foo: true
        }
      }
    })

    expect(wrapper.html()).toBe('<foo-stub></foo-stub>')
    expect(onBeforeMount).not.toHaveBeenCalled()
    expect(beforeCreate).not.toHaveBeenCalled()
  })

  it('uses a custom stub implementation', () => {
    const onBeforeMount = jest.fn()
    const FooStub = {
      name: 'FooStub',
      setup() {
        onBeforeMount(onBeforeMount)
        return () => h('div', 'foo stub')
      }
    }
    const Foo = {
      name: 'Foo',
      render() {
        return h('div', 'real foo')
      }
    }

    const Comp = {
      render() {
        return h(Foo)
      }
    }

    const wrapper = mount(Comp, {
      global: {
        stubs: {
          Foo: FooStub
        }
      }
    })

    expect(onBeforeMount).toHaveBeenCalled()
    expect(wrapper.html()).toBe('<div>foo stub</div>')
  })

  it('uses an sfc as a custom stub', () => {
    const created = jest.fn()
    const HelloComp = {
      name: 'Hello',
      created() {
        created()
      },
      render() {
        return h('span', 'real implementation')
      }
    }

    const Comp = {
      render() {
        return h(HelloComp)
      }
    }

    const wrapper = mount(Comp, {
      global: {
        stubs: {
          Hello: Hello
        }
      }
    })

    expect(created).not.toHaveBeenCalled()
    expect(wrapper.html()).toBe(
      '<div id="root"><div id="msg">Hello world</div></div>'
    )
  })

  it('stubs using inline components', () => {
    const Foo = {
      name: 'Foo',
      render() {
        return h('p')
      }
    }
    const Bar = {
      name: 'Bar',
      render() {
        return h('p')
      }
    }
    const Component: ComponentOptions = {
      render() {
        return h(() => [h(Foo), h(Bar)])
      }
    }

    const wrapper = mount(Component, {
      global: {
        stubs: {
          Foo: {
            template: '<span />'
          },
          Bar: {
            render() {
              return h('div')
            }
          }
        }
      }
    })

    expect(wrapper.html()).toBe('<span></span><div></div>')
  })

  it('stubs a component with a kabeb-case name', () => {
    const FooBar = {
      name: 'foo-bar',
      render: () => h('span', 'real foobar')
    }
    const Comp = {
      render: () => h(FooBar)
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          FooBar: true
        }
      }
    })

    expect(wrapper.html()).toBe('<foo-bar-stub></foo-bar-stub>')
  })

  it('stubs a component with a PascalCase name', () => {
    const FooBar = {
      name: 'FooBar',
      render: () => h('span', 'real foobar')
    }
    const Comp = {
      render: () => h(FooBar)
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          'foo-bar': true
        }
      }
    })

    expect(wrapper.html()).toBe('<foo-bar-stub></foo-bar-stub>')
  })

  it('stubs a component with registered with strange casing', () => {
    const FooBar = {
      name: 'fooBar',
      render: () => h('span', 'real foobar')
    }
    const Comp = {
      render: () => h(FooBar)
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          fooBar: true
        }
      }
    })

    expect(wrapper.html()).toBe('<foo-bar-stub></foo-bar-stub>')
  })

  it('renders stub slots by default', () => {
    const Component = {
      name: 'Parent',
      template: `<div><component-with-slots>
        <template #default>Default</template>
        <template #named>A named</template>
        <template #noop>A not existing one</template>
      </component-with-slots></div>`,
      components: { ComponentWithSlots }
    }
    const wrapper = mount(Component, {
      global: {
        stubs: ['ComponentWithSlots']
      }
    })
    expect(wrapper.html()).toBe(
      '<div><component-with-slots-stub>Default A named With Default Content</component-with-slots-stub></div>'
    )
  })
})

import { h, ComponentOptions } from 'vue'

import { mount } from '../../src'
import Hello from '../components/Hello.vue'

describe('mounting options: stubs', () => {
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
})

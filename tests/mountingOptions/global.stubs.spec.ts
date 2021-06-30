import { h, ComponentOptions, defineComponent, defineAsyncComponent } from 'vue'

import { config, flushPromises, mount, RouterLinkStub } from '../../src'
import Hello from '../components/Hello.vue'
import ComponentWithoutName from '../components/ComponentWithoutName.vue'
import ComponentWithSlots from '../components/ComponentWithSlots.vue'

describe('mounting options: stubs', () => {
  let configStubsSave = config.global.stubs
  beforeEach(() => {
    config.global.stubs = configStubsSave
  })

  afterEach(() => {
    config.global.stubs = configStubsSave
  })

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

    expect(wrapper.html()).toBe('<div></div>\n' + '<foo-stub></foo-stub>')
  })

  // https://github.com/vuejs/vue-test-utils-next/issues/249
  it('applies stubs globally', () => {
    const Comp = defineComponent({
      template: '<div><foo /><router-link to="/foo" /><router-view /></div>'
    })
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          Foo: true,
          RouterLink: RouterLinkStub,
          RouterView: defineComponent({
            render() {
              return h('span')
            }
          })
        }
      }
    })

    expect(wrapper.html()).toBe(
      '<div>\n' + '  <foo-stub></foo-stub><a></a><span></span>\n' + '</div>'
    )
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toBe('/foo')
  })

  it('stubs a functional component by its variable declaration name', () => {
    const FunctionalFoo = (props: any) => h('p', props, 'Foo Text')

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
      '<div>\n' + '  <functional-foo-stub></functional-foo-stub>\n' + '</div>'
    )
  })

  it('stubs a component without a name', () => {
    const Component = {
      template: '<div><foo/></div>',
      components: { Foo: ComponentWithoutName }
    }
    const wrapper = mount(Component, {
      global: {
        stubs: { Foo: true }
      }
    })

    expect(wrapper.html()).toEqual(
      '<div>\n' + '  <foo-stub></foo-stub>\n' + '</div>'
    )
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
      '<div>\n' +
        '  <foo-stub dynamic="[object Object]" class="bar" test-id="foo"></foo-stub>\n' +
        '</div>'
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

    expect(wrapper.html()).toBe('<div></div>\n' + '<foo-stub></foo-stub>')
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

  it('uses functional component as a custom stub', () => {
    const FooStub = () => h('div', 'foo stub')
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
      '<div id="root">\n' + '  <div id="msg">Hello world</div>\n' + '</div>'
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

    expect(wrapper.html()).toBe('<span></span>\n' + '<div></div>')
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

  it('stubs transition by default', () => {
    const Comp = {
      template: `<transition><div id="content" /></transition>`
    }
    const wrapper = mount(Comp)

    expect(wrapper.html()).toBe(
      '<transition-stub>\n' +
        '  <div id="content"></div>\n' +
        '</transition-stub>'
    )
  })

  it('opts out of stubbing transition by default', () => {
    const Comp = {
      template: `<transition><div id="content" /></transition>`
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          transition: false
        }
      }
    })

    // Vue removes <transition> at run-time and does it's magic, so <transition> should not
    // appear in the html when it isn't stubbed.
    expect(wrapper.html()).toBe('<div id="content"></div>')
  })

  it('opts out of stubbing transition-group by default', () => {
    const Comp = {
      template: `<transition-group><div key="content" id="content" /></transition-group>`
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          'transition-group': false
        }
      }
    })

    // Vue removes <transition-group> at run-time and does it's magic, so <transition-group> should not
    // appear in the html when it isn't stubbed.
    expect(wrapper.html()).toBe('<div id="content"></div>')
  })

  it('stubs transition-group by default', () => {
    const Comp = {
      template: `<transition-group><div key="a" id="content" /></transition-group>`
    }
    const wrapper = mount(Comp)
    expect(wrapper.find('#content').exists()).toBe(true)
  })

  it('stubs component by key prior before name', () => {
    const MyComponent = defineComponent({
      name: 'MyComponent',
      template: '<span>MyComponent</span>'
    })

    const TestComponent = defineComponent({
      components: {
        MyComponentKey: MyComponent
      },
      template: '<MyComponentKey/>'
    })

    const wrapper = mount(TestComponent, {
      global: {
        stubs: {
          MyComponentKey: {
            template: '<span>MyComponentKey stubbed</span>'
          },
          MyComponent: {
            template: '<span>MyComponent stubbed</span>'
          }
        }
      }
    })

    expect(wrapper.html()).toBe('<span>MyComponentKey stubbed</span>')
  })

  describe('stub async component', () => {
    const AsyncComponent = defineAsyncComponent(async () => ({
      name: 'AsyncComponent',
      template: '<span>AsyncComponent</span>'
    }))

    const AsyncComponentWithoutName = defineAsyncComponent(async () => ({
      template: '<span>AsyncComponent</span>'
    }))

    it('stubs async component with name', async () => {
      const TestComponent = defineComponent({
        components: {
          MyComponent: AsyncComponent
        },
        template: '<MyComponent/>'
      })

      const wrapper = mount(TestComponent, {
        global: {
          stubs: {
            AsyncComponent: true
          }
        }
      })

      // flushPromises required to resolve async component
      expect(wrapper.html()).not.toBe(
        '<async-component-stub></async-component-stub>'
      )
      await flushPromises()

      expect(wrapper.html()).toBe(
        '<async-component-stub></async-component-stub>'
      )
    })

    it('stubs async component with name by alias', () => {
      const TestComponent = defineComponent({
        components: {
          MyComponent: AsyncComponent
        },
        template: '<MyComponent/>'
      })

      const wrapper = mount(TestComponent, {
        global: {
          stubs: {
            MyComponent: true
          }
        }
      })

      // flushPromises no longer required
      expect(wrapper.html()).toBe('<my-component-stub></my-component-stub>')
    })

    it('stubs async component without name', () => {
      const TestComponent = defineComponent({
        components: {
          Foo: {
            template: '<div />'
          },
          MyComponent: AsyncComponentWithoutName
        },
        template: '<MyComponent/>'
      })

      const wrapper = mount(TestComponent, {
        global: {
          stubs: {
            MyComponent: true
          }
        }
      })

      expect(wrapper.html()).toBe('<my-component-stub></my-component-stub>')
    })

    it('stubs async component without name and kebab-case', () => {
      const TestComponent = defineComponent({
        components: {
          MyComponent: AsyncComponentWithoutName
        },
        template: '<MyComponent/>'
      })

      const wrapper = mount(TestComponent, {
        global: {
          stubs: {
            'my-component': true
          }
        }
      })

      expect(wrapper.html()).toBe('<my-component-stub></my-component-stub>')
    })

    it('stubs async component with string', () => {
      const TestComponent = defineComponent({
        components: {
          MyComponent: AsyncComponentWithoutName
        },
        template: '<my-component/>'
      })

      const wrapper = mount(TestComponent, {
        global: {
          stubs: ['MyComponent']
        }
      })

      expect(wrapper.html()).toBe('<my-component-stub></my-component-stub>')
    })

    it('stubs async component with other component', () => {
      const TestComponent = defineComponent({
        components: {
          MyComponent: AsyncComponentWithoutName
        },
        template: '<my-component/>'
      })

      const wrapper = mount(TestComponent, {
        global: {
          stubs: {
            MyComponent: defineComponent({
              template: '<span>StubComponent</span>'
            })
          }
        }
      })

      expect(wrapper.html()).toBe('<span>StubComponent</span>')
    })
  })

  describe('stub slots', () => {
    const Component = {
      name: 'Parent',
      template: `
        <div>
          <component-with-slots>
            <template #default>Default</template>
            <template #named>A named</template>
            <template #noop>A not existing one</template>
            <template #scoped="{ boolean, string }">{{ boolean }} {{ string }}</template>
          </component-with-slots>
        </div>`,
      components: { ComponentWithSlots }
    }

    afterEach(() => {
      config.renderStubDefaultSlot = false
    })

    it('renders only the default stub slot only behind flag', () => {
      config.renderStubDefaultSlot = true

      const wrapper = mount(Component, {
        global: {
          stubs: ['ComponentWithSlots']
        }
      })
      expect(wrapper.html()).toBe(
        '<div>\n' +
          '  <component-with-slots-stub>Default</component-with-slots-stub>\n' +
          '</div>'
      )
    })

    it('renders none of the slots on a stub', () => {
      config.renderStubDefaultSlot = false
      const wrapper = mount(Component, {
        global: {
          stubs: ['ComponentWithSlots']
        }
      })
      expect(wrapper.html()).toBe(
        '<div>\n' +
          '  <component-with-slots-stub></component-with-slots-stub>\n' +
          '</div>'
      )
    })

    it('renders the default slot of deeply nested stubs when renderStubDefaultSlot=true', () => {
      config.renderStubDefaultSlot = true

      const SimpleSlot = {
        name: 'SimpleSlot',
        template: '<div class="simpleSlot"><slot/></div>'
      }
      const WrappingComponent = {
        template: `
          <component-with-slots>
            <component-with-slots>
              <simple-slot>
                <template #default>nested content</template>
                <template #not-existing>not rendered</template>
              </simple-slot>
            </component-with-slots>
          </component-with-slots>`,
        components: {
          ComponentWithSlots,
          SimpleSlot
        }
      }
      const wrapper = mount(WrappingComponent, {
        global: {
          stubs: ['component-with-slots', 'simple-slot']
        }
      })

      expect(wrapper.html()).toEqual(
        '<component-with-slots-stub>\n' +
          '  <component-with-slots-stub>\n' +
          '    <simple-slot-stub>nested content</simple-slot-stub>\n' +
          '  </component-with-slots-stub>\n' +
          '</component-with-slots-stub>'
      )
    })
  })

  it('renders stub for anonymous component when using shallow mount', () => {
    const AnonymousComponent = defineComponent({
      template: `<div class="original"><slot></slot></div>`
    })

    const WrapperComponent = defineComponent({
      computed: {
        cmp() {
          return AnonymousComponent
        }
      },
      template: `<component :is="cmp">test</component>`
    })

    const wrapper = mount(WrapperComponent, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true
      }
    })

    expect(wrapper.html()).toBe('<anonymous-stub>test</anonymous-stub>')
  })
})

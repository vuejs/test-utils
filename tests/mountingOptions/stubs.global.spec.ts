import { h, ComponentOptions, defineComponent } from 'vue'

import { config, mount, RouterLinkStub } from '../../src'
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

    expect(wrapper.html()).toBe('<div></div><foo-stub></foo-stub>')
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
      '<div><foo-stub></foo-stub><a></a><span></span></div>'
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
      '<div><functional-foo-stub></functional-foo-stub></div>'
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
      '<div><foo-stub class="bar" test-id="foo" dynamic="[object Object]"></foo-stub></div>'
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

  it('stubs transition by default', () => {
    const Comp = {
      template: `<transition><div id="content" /></transition>`
    }
    const wrapper = mount(Comp)

    expect(wrapper.html()).toBe(
      '<transition-stub><div id="content"></div></transition-stub>'
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
        `<div><component-with-slots-stub>Default</component-with-slots-stub></div>`
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
        '<div><component-with-slots-stub></component-with-slots-stub></div>'
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
        '<component-with-slots-stub>' +
          '<component-with-slots-stub>' +
          '<simple-slot-stub>nested content</simple-slot-stub>' +
          '</component-with-slots-stub>' +
          '</component-with-slots-stub>'
      )
    })
  })
})

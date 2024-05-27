import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { h, defineComponent, defineAsyncComponent, Directive } from 'vue'
import { config, flushPromises, mount, RouterLinkStub } from '../../src'
import Hello from '../components/Hello.vue'
import ComponentWithoutName from '../components/ComponentWithoutName.vue'
import ComponentWithSlots from '../components/ComponentWithSlots.vue'
import ScriptSetupWithChildren from '../components/ScriptSetupWithChildren.vue'
import AutoImportScriptSetup from '../components/AutoImportScriptSetup.vue'
import HelloJsx from '../components/HelloJsx'

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
    const Component = {
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

  // https://github.com/vuejs/test-utils/issues/249
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

  it('stubs a Hello SFC component from render function', () => {
    const Comp = {
      render: () => h(Hello)
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          Hello: true
        }
      }
    })

    expect(wrapper.html()).toEqual('<hello-stub></hello-stub>')
  })

  it('stubs a JSX component with name', () => {
    const Comp = {
      render: () => h(HelloJsx)
    }
    const wrapper = mount(Comp, {
      global: {
        stubs: {
          HelloJsx: true
        }
      }
    })

    expect(wrapper.html()).toEqual('<hello-jsx-stub></hello-jsx-stub>')
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
    const Component = {
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
    const onBeforeMount = vi.fn()
    const beforeCreate = vi.fn()
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
    const onBeforeMount = vi.fn()
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
    const created = vi.fn()
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
    const Component = {
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

  it('stubs components within script setup', () => {
    const wrapper = mount(ScriptSetupWithChildren as any, {
      global: {
        stubs: {
          Hello: { template: '<span>Stubbed Hello</span>' },
          ComponentWithInput: {
            template: '<span>Stubbed ComponentWithInput</span>'
          },
          ComponentWithoutName: {
            template: '<span>Stubbed ComponentWithoutName</span>'
          },
          ComponentAsync: { template: '<span>Stubbed ComponentAsync</span>' },
          ScriptSetup: { template: '<span>Stubbed ScriptSetup</span>' },
          WithProps: { template: '<span>Stubbed WithProps</span>' }
        }
      }
    })
    expect(wrapper.html()).toBe(
      '<span>Stubbed Hello</span>\n' +
        '<span>Stubbed ComponentWithInput</span>\n' +
        '<span>Stubbed ComponentWithoutName</span>\n' +
        '<span>Stubbed ComponentAsync</span>\n' +
        '<span>Stubbed ScriptSetup</span>\n' +
        '<span>Stubbed WithProps</span>'
    )
  })

  it('stubs a script setup component imported by unplugin-vue-components', () => {
    const wrapper = mount(AutoImportScriptSetup, {
      global: {
        stubs: {
          ScriptSetup: true
        }
      }
    })
    expect(wrapper.html()).toBe(`<script-setup-stub></script-setup-stub>`)
  })

  describe('transition', () => {
    it('stubs transition by default', () => {
      const CompStubbedByDefault = {
        template: `<transition><div id="content-stubbed-by-default" /></transition>`
      }
      const wrapper = mount(CompStubbedByDefault)

      expect(wrapper.html()).toBe(
        '<transition-stub appear="false" persisted="false" css="true">\n' +
          '  <div id="content-stubbed-by-default"></div>\n' +
          '</transition-stub>'
      )
    })

    it('opts out of stubbing transition', () => {
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

    it('does not stub transition on shallow with false', () => {
      const Comp = {
        template: `<transition><div id="content" /></transition>`
      }
      const wrapper = mount(Comp, {
        shallow: true,
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

    it('does not stub transition after overriding config.global.stubs', () => {
      const Comp = {
        template: `<transition><div id="content-global-stubs-no-transition" /></transition>`
      }
      config.global.stubs = {}
      const wrapper = mount(Comp)

      // Vue removes <transition> at run-time and does it's magic, so <transition> should not
      // appear in the html when it isn't stubbed.
      expect(wrapper.html()).toBe(
        '<div id="content-global-stubs-no-transition"></div>'
      )
    })

    it('stub transition after overriding config.global.stubs with Transition: true PascalCase', () => {
      const Comp = {
        template: `<transition><div id="content-global-stubs-transition" /></transition>`
      }
      config.global.stubs = {
        Transition: true
      }
      const wrapper = mount(Comp)

      expect(wrapper.html()).toBe(
        '<transition-stub appear="false" persisted="false" css="true">\n' +
          '  <div id="content-global-stubs-transition"></div>\n' +
          '</transition-stub>'
      )
    })

    it('custom transition stub', () => {
      const Comp = {
        template: `<transition><div id="content-custom-stub" /></transition>`
      }
      config.global.stubs = {
        transition: {
          template: '<div class="custom-transition-stub"><slot /></div>'
        }
      }
      const wrapper = mount(Comp)

      expect(wrapper.html()).toBe(
        '<div class="custom-transition-stub">\n' +
          '  <div id="content-custom-stub"></div>\n' +
          '</div>'
      )
    })
  })

  describe('transition-group', () => {
    it('stubs transition-group by default', () => {
      const Comp = {
        template: `<transition-group><div key="a" id="content" /></transition-group>`
      }
      const wrapper = mount(Comp)
      expect(wrapper.find('#content').exists()).toBe(true)
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

    it('does not stub transition-group on shallow with false', () => {
      const Comp = {
        template: `<transition-group><div key="content" id="content" /></transition-group>`
      }
      const wrapper = mount(Comp, {
        shallow: true,
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

    it('does not stub transition-group after overriding config.global.stubs', () => {
      const Comp = {
        template: `<transition-group><div key="content" id="content-global-stubs-no-transition-group" /></transition-group>`
      }
      config.global.stubs = {}
      const wrapper = mount(Comp)

      // Vue removes <transition-group> at run-time and does it's magic, so <transition-group> should not
      // appear in the html when it isn't stubbed.
      expect(wrapper.html()).toBe(
        '<div id="content-global-stubs-no-transition-group"></div>'
      )
    })

    it('stub transition-group after overriding config.global.stubs with TransitionGroup: true in PascalCase', () => {
      const Comp = {
        template: `<transition-group><div key="content" id="content-global-stubs-transition-group" /></transition-group>`
      }
      config.global.stubs = {
        TransitionGroup: true
      }
      const wrapper = mount(Comp)

      expect(wrapper.html()).toBe(
        '<transition-group-stub appear="false" persisted="false" css="true">\n' +
          '  <div id="content-global-stubs-transition-group"></div>\n' +
          '</transition-group-stub>'
      )
    })
  })

  describe('teleport', () => {
    it('does not stub teleport by default', () => {
      const Comp = {
        template: `<teleport to="body"><div id="content" /></teleport>`
      }
      const wrapper = mount(Comp)

      expect(wrapper.html()).toBe(
        '<!--teleport start-->\n' + '<!--teleport end-->'
      )
    })

    it('opts in to stubbing teleport ', () => {
      const spy = vi.spyOn(console, 'warn')
      const Comp = {
        template: `<teleport to="body"><div id="content" /></teleport>`
      }
      const wrapper = mount(Comp, {
        global: {
          stubs: {
            teleport: true
          }
        }
      })

      expect(wrapper.html()).toBe(
        '<teleport-stub to="body">\n' +
          '  <div id="content"></div>\n' +
          '</teleport-stub>'
      )
      // Make sure that we don't have a warning when stubbing teleport
      // https://github.com/vuejs/test-utils/issues/1829
      expect(spy).not.toHaveBeenCalled()
    })

    it('does not stub teleport with shallow', () => {
      const Comp = {
        template: `<teleport to="body"><div id="content" /></teleport>`
      }
      const wrapper = mount(Comp, {
        shallow: true,
        global: {
          stubs: {
            teleport: false
          }
        }
      })

      expect(wrapper.html()).toBe(
        '<!--teleport start-->\n' + '<!--teleport end-->'
      )
    })

    it('opts in to stubbing teleport with Teleport: true', () => {
      const Comp = {
        template: `<teleport to="body"><div id="content-global-stubs-teleport" /></teleport>`
      }
      const wrapper = mount(Comp, {
        global: {
          stubs: {
            Teleport: true
          }
        }
      })

      expect(wrapper.html()).toBe(
        '<teleport-stub to="body">\n' +
          '  <div id="content-global-stubs-teleport"></div>\n' +
          '</teleport-stub>'
      )
    })
  })

  describe('keep-alive', () => {
    it('will omit the keep-alive tag by default', () => {
      const Comp = {
        template: `<keep-alive><div id="content" /></keep-alive>`
      }
      const wrapper = mount(Comp)

      expect(wrapper.html()).toBe('<div id="content"></div>')
    })

    it('opts in to stubbing keep-alive with keep-alive: true', () => {
      const spy = vi.spyOn(console, 'warn')
      const Comp = {
        template: `<keep-alive><div id="content" /></keep-alive>`
      }
      const wrapper = mount(Comp, {
        global: {
          stubs: {
            'keep-alive': true
          }
        }
      })

      expect(wrapper.html()).toBe(
        '<keep-alive-stub>\n' +
          '  <div id="content"></div>\n' +
          '</keep-alive-stub>'
      )
      // Make sure that we don't have a warning when stubbing keep-alive
      // https://github.com/vuejs/test-utils/issues/1888
      expect(spy).not.toHaveBeenCalled()
    })

    it('opts in to stubbing KeepAlive with KeepAlive: true', () => {
      const spy = vi.spyOn(console, 'warn')
      const Comp = {
        template: `<KeepAlive><div id="content" /></KeepAlive>`
      }
      const wrapper = mount(Comp, {
        global: {
          stubs: {
            KeepAlive: true
          }
        }
      })

      expect(wrapper.html()).toBe(
        '<keep-alive-stub>\n' +
          '  <div id="content"></div>\n' +
          '</keep-alive-stub>'
      )
      // Make sure that we don't have a warning when stubbing keep-alive
      // https://github.com/vuejs/test-utils/issues/1888
      expect(spy).not.toHaveBeenCalled()
    })

    it('opts in to stubbing keep-alive with KeepAlive: true', () => {
      const spy = vi.spyOn(console, 'warn')
      const Comp = {
        template: `<keep-alive><div id="content" /></keep-alive>`
      }
      const wrapper = mount(Comp, {
        global: {
          stubs: {
            KeepAlive: true
          }
        }
      })

      expect(wrapper.html()).toBe(
        '<keep-alive-stub>\n' +
          '  <div id="content"></div>\n' +
          '</keep-alive-stub>'
      )
      // Make sure that we don't have a warning when stubbing keep-alive
      // https://github.com/vuejs/test-utils/issues/1888
      expect(spy).not.toHaveBeenCalled()
    })

    it('does not stub keep-alive with shallow', () => {
      const Comp = {
        template: `<keep-alive><div id="content" /></keep-alive>`
      }
      const wrapper = mount(Comp, {
        shallow: true,
        global: {
          stubs: {
            'keep-alive': false
          }
        }
      })

      expect(wrapper.html()).toBe('<div id="content"></div>')
    })
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
    const AsyncComponentWithoutName = defineAsyncComponent(async () => ({
      template: '<span>AsyncComponent</span>'
    }))

    it('stubs async component with name', async () => {
      const AsyncComponent = defineAsyncComponent(async () => ({
        name: 'AsyncComponent',
        template: '<span>AsyncComponent</span>'
      }))

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
      const AsyncComponent = defineAsyncComponent(async () => ({
        name: 'AsyncComponent',
        template: '<span>AsyncComponent</span>'
      }))

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
      config.global.renderStubDefaultSlot = false
    })

    it('renders only the default stub slot only behind flag', () => {
      config.global.renderStubDefaultSlot = true

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
      config.global.renderStubDefaultSlot = false
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
      config.global.renderStubDefaultSlot = true

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

  it('should not recreate stub across multiple renders', async () => {
    const FooBar = {
      name: 'FooBar',
      render: () => h('span', 'real foobar')
    }

    const Comp = defineComponent({
      data: () => ({ value: 1 }),
      render() {
        return h('div', {}, [this.value, h(FooBar)])
      }
    })

    const wrapper = mount(Comp, {
      global: {
        stubs: {
          'foo-bar': { name: 'FooBar', template: 'stub' }
        }
      }
    })

    const stub = wrapper.findComponent({ name: 'FooBar' })
    await wrapper.setData({ value: 2 })

    const stubAfterSecondRender = wrapper.findComponent({ name: 'FooBar' })

    expect(stub.vm).toBe(stubAfterSecondRender.vm)
  })

  describe('directives', () => {
    const MyDirective: Directive = {
      beforeMount(el: Element) {
        el.classList.add('DirectiveAdded')
      }
    }

    const MyDirectiveStub: Directive = {
      beforeMount(el: Element) {
        el.classList.add('DirectiveStubAdded')
      }
    }

    it('stubs directive on root component', () => {
      const Component = {
        template: '<div v-my-directive>text</div>',
        directives: { MyDirective }
      }

      const wrapper = mount(Component, {
        global: {
          stubs: {
            vMyDirective: MyDirectiveStub
          }
        }
      })

      expect(wrapper.classes()).toContain('DirectiveStubAdded')
    })

    it('stubs directive as noop when true passed as value', () => {
      const SomeDirective = () => {
        throw new Error('I will blow up!')
      }

      const Component = {
        template: '<div v-some-directive>text</div>',
        directives: { SomeDirective }
      }

      const wrapper = mount(Component, {
        global: {
          stubs: {
            vSomeDirective: true
          }
        }
      })

      expect(wrapper.html()).toBe('<div>text</div>')
    })

    it('does not stub directive as noop when false passed as value', () => {
      const Component = {
        template: '<div v-my-directive>text</div>',
        directives: { MyDirective }
      }

      const wrapper = mount(Component, {
        global: {
          stubs: {
            vMyDirective: false
          }
        }
      })

      expect(wrapper.html()).toBe('<div class="DirectiveAdded">text</div>')
    })

    it('stubs directive on child component', () => {
      const Component = {
        template: '<div v-my-directive>text</div>',
        directives: { MyDirective }
      }

      const RootComponent = {
        components: { ChildComponent: Component },
        template: '<div><child-component class="child" /></div>'
      }

      const wrapper = mount(RootComponent, {
        global: {
          stubs: {
            vMyDirective: MyDirectiveStub
          }
        }
      })

      expect(wrapper.find('.child').classes()).toContain('DirectiveStubAdded')
    })

    it('stubs directive on root component with script setup', () => {
      const Component = {
        setup() {
          // @ts-ignore-error (directive used by script setup)
          const vMyDirective = MyDirective
        },
        template: '<div v-my-directive>text</div>',
        directives: { MyDirective }
      }

      const MyDirectiveStub: Directive = {
        beforeMount(el: Element) {
          el.classList.add('DirectiveStubAdded')
        }
      }

      const wrapper = mount(Component, {
        global: {
          stubs: {
            vMyDirective: MyDirectiveStub
          }
        }
      })

      expect(wrapper.classes()).toContain('DirectiveStubAdded')
    })
  })
})

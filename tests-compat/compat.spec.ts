import * as Vue from '@vue/compat'
import { mount } from '../src'

const { configureCompat, extend, defineComponent, h } = Vue as any

describe('@vue/compat build', () => {
  it.each([true, false])(
    'correctly renders transition when RENDER_FUNCTION compat is %p',
    (RENDER_FUNCTION) => {
      configureCompat({ MODE: 3, RENDER_FUNCTION })

      const Component = defineComponent({
        template: '<transition><div class="hello"></div></transition>'
      })
      const wrapper = mount(Component)

      expect(wrapper.find('.hello').exists()).toBe(true)
    }
  )

  it('finds components declared with legacy Vue.extend', () => {
    configureCompat({ MODE: 3, GLOBAL_EXTEND: true })

    const LegacyComponent = extend({
      template: '<div>LEGACY</div>'
    })

    const Component = defineComponent({
      components: {
        LegacyComponent
      },
      template: '<div><legacy-component /></div>'
    })
    const wrapper = mount(Component)

    expect(wrapper.findComponent(LegacyComponent).exists()).toBe(true)
  })

  it('correctly mounts legacy functional component', () => {
    configureCompat({ MODE: 3, COMPONENT_FUNCTIONAL: true })

    const Component = defineComponent({
      functional: true,
      render: () => h('div', 'test')
    })
    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>test</div>')
  })

  it('correctly mounts legacy functional component wrapped in Vue.extend', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: true,
      COMPONENT_FUNCTIONAL: true
    })

    const Component = extend({
      functional: true,
      render: () => h('div', 'test')
    })
    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>test</div>')
  })

  it('correctly stubs legacy component wrapped in Vue.extend', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: true
    })

    const Foo = extend({
      name: 'Foo',
      template: '<div>original</div>'
    })

    const FooStub = { template: '<div>stubbed</div>' }

    const Component = {
      components: { NamedAsNotFoo: Foo },
      template: '<named-as-not-foo />'
    }

    debugger
    const wrapper = mount(Component, {
      global: {
        stubs: {
          Foo: FooStub
        }
      }
    })

    expect(wrapper.html()).toBe('<div>stubbed</div>')
  })
})

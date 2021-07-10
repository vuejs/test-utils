import * as Vue from '@vue/compat'
import { mount } from '../src'

const { configureCompat, extend, defineComponent, h } = Vue as any

describe('@vue/compat build', () => {
  describe.each([true, false])(
    'when RENDER_FUNCTION compat is %p',
    (RENDER_FUNCTION) => {
      beforeEach(() => {
        configureCompat({ MODE: 3, RENDER_FUNCTION })
      })

      it('renders default slot content when renderStubDefaultSlot is true', () => {
        const Foo = { template: '<div><slot></slot></div>' }
        const Component = {
          components: { Foo },
          template: '<foo>test</foo>'
        }

        const wrapper = mount(Component, {
          global: {
            stubs: { Foo: true },
            renderStubDefaultSlot: true
          }
        })

        expect(wrapper.html()).toBe('<foo-stub>test</foo-stub>')
      })

      it('correctly renders transition', () => {
        const Component = defineComponent({
          template: '<transition><div class="hello"></div></transition>'
        })
        const wrapper = mount(Component)

        expect(wrapper.find('.hello').exists()).toBe(true)
      })
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

  it('does not stub root legacy functional component when shallow', () => {
    configureCompat({
      MODE: 3,
      GLOBAL_EXTEND: true,
      COMPONENT_FUNCTIONAL: true
    })

    const Foo = {
      name: 'Foo',
      functional: true,
      render: () => h('div', 'test')
    }
    const wrapper = mount(Foo, { shallow: true })

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

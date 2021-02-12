import { h, inject } from 'vue'
import { config, mount } from '../src'
import Hello from './components/Hello.vue'
import ComponentWithSlots from './components/ComponentWithSlots.vue'

describe('config', () => {
  beforeEach(() => {
    config.global = {
      components: {},
      directives: {},
      mixins: [],
      plugins: [],
      mocks: {},
      provide: {},
      stubs: {},
      config: {},
      renderStubDefaultSlot: false
    }

    jest.clearAllMocks()
  })

  describe('config merger', () => {
    it('should merge the configs in the correct order', () => {
      config.global.config.globalProperties = {
        myProp: 1
      }
      config.global.components = { Hello }

      const comp = mount(ComponentWithSlots, {
        slots: {
          default: '<div id="default-slot" /><Hello />'
        },
        shallow: true,
        global: {
          config: {
            globalProperties: {
              myProp: 2
            }
          },
          renderStubDefaultSlot: true
        }
      })

      // mount config overrides user defined config
      expect(comp.vm.$.appContext.config.globalProperties.myProp).toBe(2)
      // mount config overrides default config
      expect(comp.find('#default-slot').exists()).toBe(true)
      // user defined config overrides default config
      expect(comp.findComponent(Hello).exists()).toBe(true);
    })
  })

  describe('renderStubDefaultSlot', () => {
    it('should override shallow option when set to true', () => {
      const comp = mount(ComponentWithSlots, {
        slots: {
          default: '<div id="default-slot" />'
        },
        shallow: true,
        global: {
          renderStubDefaultSlot: true
        }
      })

      expect(comp.find('#default-slot').exists()).toBe(true)
    })
  })

  describe('components', () => {
    const Component = {
      components: { Hello },
      template: '<div>{{ msg }} <Hello /></div>',
      props: ['msg']
    }

    it('allows setting components globally', () => {
      const HelloLocal = {
        name: 'Hello',
        render() {
          return h('div', 'Hello Local')
        }
      }
      config.global.components = { Hello: HelloLocal }
      const wrapper1 = mount(Component, {
        props: { msg: 'Wrapper1' }
      })
      const wrapper2 = mount(Component, {
        props: { msg: 'Wrapper2' }
      })
      expect(wrapper1.text()).toEqual('Wrapper1 Hello Local')
      expect(wrapper2.text()).toEqual('Wrapper2 Hello Local')
    })

    it('allows overwriting globally set component config on a per mount instance', () => {
      config.global.components = { Hello }
      const HelloLocal = { template: '<div>Hello Overwritten</div>' }
      const wrapper1 = mount(Component, { props: { msg: 'Wrapper1' } })
      const wrapper2 = mount(Component, {
        props: { msg: 'Wrapper2' },
        global: { components: { Hello: HelloLocal } }
      })
      expect(wrapper1.text()).toEqual('Wrapper1 Hello world')
      expect(wrapper2.text()).toEqual('Wrapper2 Hello Overwritten')
    })
  })

  describe('directives', () => {
    const Directive = {
      beforeMount(el: Element) {
        el.classList.add('DirectiveAdded')
      }
    }
    const Component = { template: '<div v-directive>msg</div>' }

    it('allows setting directives globally', () => {
      config.global.directives = { Directive }
      expect(mount(Component).classes()).toContain('DirectiveAdded')
      expect(mount(Component).classes()).toContain('DirectiveAdded')
    })

    it('allows overwriting globally set directives', () => {
      config.global.directives = { Directive }
      const LocalDirective = {
        beforeMount(el: Element) {
          el.classList.add('LocallyDirectiveAdded')
        }
      }

      expect(mount(Component).classes()).toContain('DirectiveAdded')
      expect(
        mount(Component, {
          global: { directives: { Directive: LocalDirective } }
        }).classes()
      ).toContain('LocallyDirectiveAdded')
    })
  })

  describe('mocks', () => {
    it('sets mock everywhere', () => {
      config.global.mocks = {
        foo: 'bar'
      }
      const Component = { template: '<div>{{ foo }}</div>' }
      expect(mount(Component).text()).toEqual('bar')
      expect(mount(Component).text()).toEqual('bar')
    })

    it('allows overwriting a global mock', () => {
      config.global.mocks = {
        foo: 'bar'
      }
      const Component = { template: '<div>{{ foo }}</div>' }

      expect(mount(Component).text()).toEqual('bar')
      expect(
        mount(Component, { global: { mocks: { foo: 'baz' } } }).text()
      ).toEqual('baz')
    })
  })

  describe('provide', () => {
    const Comp = {
      setup() {
        const theme = inject('theme')
        return () => h('div', theme)
      }
    }

    it('sets a provide everywhere', () => {
      config.global.provide = {
        theme: 'dark'
      }
      const wrapper = mount(Comp)
      expect(wrapper.html()).toContain('dark')
    })

    it('overrides with a local provide', () => {
      config.global.provide = {
        theme: 'dark'
      }
      const wrapper = mount(Comp, {
        global: {
          provide: {
            theme: 'light'
          }
        }
      })
      expect(wrapper.html()).toContain('light')
    })
  })

  describe('mixins', () => {
    const createdHook = jest.fn()
    const mixin = {
      created() {
        createdHook()
      }
    }
    const Component = {
      render() {
        return h('div')
      }
    }

    it('sets a mixin everywhere', () => {
      config.global.mixins = [mixin]
      mount(Component)

      // once on root, once in the mounted component
      expect(createdHook).toHaveBeenCalledTimes(2)
    })

    it('concats with locally defined mixins', () => {
      config.global.mixins = [mixin]
      const localHook = jest.fn()
      const localMixin = {
        created() {
          localHook(this.$options.name)
        }
      }

      mount(Component, {
        global: {
          mixins: [localMixin]
        }
      })

      // once on root, once in the mounted component
      expect(localHook).toHaveBeenCalledTimes(2)
      expect(createdHook).toHaveBeenCalledTimes(2)
    })
  })

  describe('stubs', () => {
    const Foo = {
      name: 'Foo',
      render() {
        return h('div', 'real foo')
      }
    }

    const Component = {
      render() {
        return h('div', h(Foo))
      }
    }

    beforeEach(() => {
      config.global.stubs = {
        Foo: {
          name: 'Foo',
          render() {
            return h('div', 'config foo stub')
          }
        }
      }
    })

    it('sets a stub globally', () => {
      const wrapper = mount(Component)

      // once on root, once in the mounted component
      expect(wrapper.html()).toContain('config foo stub')
    })

    it('overrides config stub with locally defined stub', () => {
      const wrapper = mount(Component, {
        global: {
          stubs: {
            Foo: {
              render() {
                return h('div', 'local foo stub')
              }
            }
          }
        }
      })

      expect(wrapper.html()).toContain('local foo stub')
    })
  })
})

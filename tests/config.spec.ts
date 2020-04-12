import { config, mount } from '../src'
import Hello from './components/Hello.vue'

describe('config', () => {
  beforeEach(() => {
    config.global = {
      components: undefined,
      directives: undefined,
      mixins: undefined,
      plugins: undefined,
      globalProperties: undefined,
      mocks: undefined,
      provide: undefined
    }
  })
  describe('components', () => {
    const Component = {
      template: '<div>{{ msg }} <hello/></div>',
      props: ['msg']
    }

    it('allows setting components globally', () => {
      config.global.components = { Hello }
      const wrapper1 = mount(Component, { props: { msg: 'Wrapper1' } })
      const wrapper2 = mount(Component, { props: { msg: 'Wrapper2' } })
      expect(wrapper1.text()).toEqual('Wrapper1 Hello world')
      expect(wrapper2.text()).toEqual('Wrapper2 Hello world')
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
})

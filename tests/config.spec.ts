import { config, mount } from '../src'
import Hello from './components/Hello.vue'

describe('config', () => {
  beforeEach(() => {
    config.global = {
      components: undefined,
      directives: undefined,
      mixins: undefined,
      plugins: undefined,
      mocks: undefined,
      provide: undefined
    }
  })

  describe.skip('components', () => {
    const Component = {
      components: { Hello },
      template: '<div>{{ msg }} <Hello /></div>',
      props: ['msg']
    }

    it('allows setting components globally', () => {
      const HelloLocal = {
        props: ['msg'],
        template: '<div>{{ msg }}</div>'
      }
      config.global.components = { Hello: HelloLocal }
      const wrapper1 = mount(Component, {
        props: { msg: 'Wrapper1 Overwritten' }
      })
      const wrapper2 = mount(Component, {
        props: { msg: 'Wrapper2 Overwritten' }
      })
      expect(wrapper1.text()).toEqual('Wrapper1 Overwritten')
      expect(wrapper2.text()).toEqual('Wrapper2 Overwritten')
    })

    it('allows overwriting globally set component config on a per mount instance', () => {
      console.log('TODO: Fix this')
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
})

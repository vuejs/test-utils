import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import * as Vue from 'vue'
import {
  type App,
  type Plugin,
  Suspense,
  defineComponent,
  h,
  inject,
  ref
} from 'vue'
import {
  config,
  enableAutoUnmount,
  flushPromises,
  mount,
  shallowMount
} from '../../src'
import Async from './Async.vue'
import Counter from './Counter.vue'
import ExposedCounter from './ExposedCounter.vue'
import GlobalDefaults from './GlobalDefaults.vue'
import Greeting from './Greeting.vue'
import Unexposed from './Unexposed.vue'

// Keep Vue 3.5 type checks working without importing a 3.6-only export by name.
const interop = (Vue as unknown as { vaporInteropPlugin: Plugin })
  .vaporInteropPlugin

describe('Vapor interop', () => {
  enableAutoUnmount(afterEach)
  afterEach(() => vi.restoreAllMocks())

  describe('interop plugin', () => {
    test('does not render a VDOM child in a Vapor root without interop', () => {
      const GlobalChild = { setup: () => () => h('b', 'VDOM') }
      const wrapper = mount(GlobalDefaults, {
        experimentalVapor: true,
        global: { components: { GlobalChild } }
      })

      // Registering the child by name does not enable the VDOM renderer.
      expect(wrapper.find('b').exists()).toBe(false)
    })

    test.each([
      { form: 'directly', plugin: interop },
      { form: 'as a tuple', plugin: [interop] as [Plugin] }
    ])(
      'renders a VDOM child when interop is registered $form',
      ({ plugin }) => {
        const warn = vi.spyOn(console, 'warn')
        const GlobalChild = { setup: () => () => h('b', 'VDOM') }
        const wrapper = mount(GlobalDefaults, {
          experimentalVapor: true,
          global: { components: { GlobalChild }, plugins: [plugin] }
        })

        // Both supported plugin forms should render the child without warnings.
        expect(wrapper.get('b').text()).toBe('VDOM')
        expect(warn).not.toHaveBeenCalled()
      }
    )
  })

  describe('Vapor children of VDOM parents', () => {
    test('renders async Vapor setup inside VDOM Suspense', async () => {
      const Parent = {
        render: () => h(Suspense, null, { default: () => h(Async) })
      }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // The child has no rendered text until Suspense resolves its setup promise.
      expect(wrapper.text()).toBe('')
      await flushPromises()
      expect(wrapper.html()).toBe('<p>async</p>')
    })

    test('uses the single Vapor root as the VDOM wrapper element', () => {
      const Parent = { render: () => h(Greeting, { name: 'Ada' }) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // Parent adds no DOM of its own; the paragraph is its root too.
      expect(wrapper.element).toBe(wrapper.get('p').element)
    })

    test('updates a Vapor child when its VDOM parent receives new props', async () => {
      const Parent = defineComponent({
        props: { label: { type: String, required: true } },
        setup: props => () => h(Counter, { label: props.label })
      })
      const wrapper = mount(Parent, {
        props: { label: 'Before' },
        global: { plugins: [interop] }
      })

      // The updated label comes from the parent; the count belongs to the child.
      await wrapper.get('button').trigger('click')
      await wrapper.setProps({ label: 'After' })
      expect(wrapper.html()).toContain('<button>After:1</button>')
    })

    test('records a click from a Vapor child on the VDOM wrapper', async () => {
      const Parent = { render: () => h(Counter, { label: 'Count' }) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // Click the nested button rather than dispatching the event on Parent.
      await wrapper.get('button').trigger('click')
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    test('reads text from all Vapor roots through the VDOM wrapper', () => {
      const Parent = { render: () => h(Unexposed) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // The two words come from separate sibling roots.
      expect(wrapper.text()).toBe('firstsecond')
    })

    test('uses the shared container as the VDOM wrapper element for multiple Vapor roots', () => {
      const Parent = { render: () => h(Unexposed) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // Neither sibling alone represents the whole component.
      expect(wrapper.element).toBe(wrapper.get('p').element.parentElement)
    })
  })

  describe('component discovery', () => {
    test('returns an empty wrapper for a missing component name in a mixed tree', () => {
      const Parent = { render: () => h(Unexposed) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // Searching past a Vapor child for another name is still an ordinary miss.
      expect(wrapper.findComponent({ name: 'Missing' }).exists()).toBe(false)
    })

    test('finds the VDOM parent when its root is a Vapor child', async () => {
      const Parent = defineComponent({
        props: { label: String },
        render: () => h(Unexposed)
      })
      const wrapper = mount(Parent, {
        props: { label: 'Before' },
        global: { plugins: [interop] }
      })

      // Only the parent declares label, so this distinguishes it from its child.
      await wrapper.setProps({ label: 'After' })
      expect(wrapper.findComponent(Parent).props('label')).toBe('After')
    })

    test('rejects finding a Vapor child by its component definition', () => {
      const Parent = { render: () => h(Greeting, { name: 'Ada' }) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // An explicitly requested Vapor component is unsupported, not missing.
      expect(() => wrapper.findComponent(Greeting)).toThrow(
        'Component discovery is not supported for Vapor'
      )
    })
  })

  describe('template refs', () => {
    test('returns an empty wrapper for an unknown component ref', () => {
      const Parent = { render: () => h(Unexposed, { ref: 'child' }) }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // A different ref names the Vapor child; the requested ref is absent.
      expect(wrapper.findComponent({ ref: 'missing' }).exists()).toBe(false)
    })

    test('resolves an element ref as DOM rather than as a component', () => {
      const Parent = {
        render: () => h('div', [h(Unexposed), h('input', { ref: 'field' })])
      }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // Both selectors address the same ref, but only the DOM query should match.
      expect(wrapper.find({ ref: 'field' }).element).toBe(
        wrapper.get('input').element
      )
      expect(wrapper.findComponent({ ref: 'field' }).exists()).toBe(false)
    })

    test.each([
      { kind: 'exposed', Child: ExposedCounter, inList: false },
      { kind: 'unexposed', Child: Unexposed, inList: false },
      { kind: 'exposed', Child: ExposedCounter, inList: true },
      { kind: 'unexposed', Child: Unexposed, inList: true }
    ])(
      'rejects refs to an $kind Vapor child (v-for: $inList)',
      ({ Child, inList }) => {
        const Parent = {
          components: { Child },
          template: inList
            ? '<Child v-for="n in 2" :key="n" ref="child" />'
            : '<Child ref="child" />'
        }
        const wrapper = mount(Parent, { global: { plugins: [interop] } })

        // Neither exposing bindings nor collecting refs in a list makes a Vapor child a VDOM instance.
        const error = 'Component discovery is not supported for Vapor'
        expect(() => wrapper.findComponent({ ref: 'child' })).toThrow(error)
        expect(() => wrapper.getComponent({ ref: 'child' })).toThrow(error)
      }
    )

    test('finds VDOM component refs alongside a Vapor sibling', () => {
      const Child = defineComponent({
        props: { value: { type: Number, required: true } },
        setup(props, { expose }) {
          expose({ count: ref(props.value) })
          return () => h('span')
        }
      })
      const Parent = {
        components: { Child, Unexposed },
        template: `<Unexposed /><Child ref="single" :value="3" />
      <Child v-for="n in [7, 9]" :key="n" ref="list" :value="n" />`
      }
      const wrapper = mount(Parent, { global: { plugins: [interop] } })

      // A single ref resolves directly; a v-for ref resolves to its first child.
      expect(wrapper.findComponent({ ref: 'single' }).vm.count).toBe(3)
      expect(wrapper.findComponent({ ref: 'list' }).vm.count).toBe(7)
    })
  })

  describe('shallow mounting', () => {
    test('keeps an existing VDOM shallow mount stubbed across a Vapor mount', async () => {
      const Child = {
        props: ['label'],
        template: '<strong>{{ label }}</strong>'
      }
      const Parent = {
        components: { Child },
        props: ['label'],
        template: '<Child :label="label" />'
      }
      const vdom = shallowMount(Parent, { props: { label: 'Before' } })
      const vapor = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      // Force a VDOM update after the native mount: the child should still be a stub.
      await vdom.setProps({ label: 'After' })
      expect(vdom.get('child-stub').attributes('label')).toBe('After')
      expect(vdom.find('strong').exists()).toBe(false)
      expect(vapor.text()).toBe('Hello, Ada!')
    })
  })

  describe('inherited mount defaults', () => {
    beforeEach(() => {
      const original = config.global
      config.global = { ...original }
      return () => {
        config.global = original
      }
    })

    test('ignores inherited mocks on Vapor mounts but keeps them for VDOM mounts', () => {
      config.global.mocks = { $t: () => 'translated' }
      const GlobalChild = defineComponent({
        render() {
          return h(
            'p',
            typeof this.$t === 'function' ? this.$t('child') : 'untranslated'
          )
        }
      })

      // Use the same VDOM component under both apps so only the mount mode changes.
      const vapor = mount(GlobalDefaults, {
        experimentalVapor: true,
        global: { components: { GlobalChild }, plugins: [interop] }
      })
      expect(vapor.text()).toBe('untranslated')
      expect(mount(GlobalChild).text()).toBe('translated')
    })

    test('ignores inherited mixins on Vapor mounts but keeps them for VDOM mounts', () => {
      config.global.mixins = [{ provide: { message: 'from mixin' } }]
      const GlobalChild = {
        setup: () => {
          const message = inject('message', 'no mixin')
          return () => h('p', message)
        }
      }

      // Only an ancestor with the inherited mixin can supply this message.
      const vapor = mount(GlobalDefaults, {
        experimentalVapor: true,
        global: { components: { GlobalChild }, plugins: [interop] }
      })
      expect(vapor.text()).toBe('no mixin')
      expect(mount(GlobalChild).text()).toBe('from mixin')
    })

    test.each(['provide', 'plugins'] as const)(
      'inherits global.%s on both Vapor and VDOM mounts',
      option => {
        if (option === 'provide')
          config.global.provide = { message: 'provided' }
        else
          config.global.plugins = [
            (app: App) => app.provide('message', 'provided')
          ]
        const GlobalChild = {
          setup: () => {
            const message = inject('message', 'missing')
            return () => h('p', message)
          }
        }

        // The explicit interop plugin must not displace the inherited defaults.
        const vapor = mount(GlobalDefaults, {
          experimentalVapor: true,
          global: { components: { GlobalChild }, plugins: [interop] }
        })
        expect(vapor.text()).toBe('provided')
        expect(mount(GlobalChild).text()).toBe('provided')
      }
    )

    test('ignores inherited stubs on Vapor mounts but preserves them and their slots for VDOM', () => {
      const GlobalChild = { template: '<strong>real child</strong>' }
      config.global.components = { GlobalChild }
      config.global.stubs = { GlobalChild: true }
      config.global.renderStubDefaultSlot = true

      const vapor = mount(GlobalDefaults, {
        experimentalVapor: true,
        global: { plugins: [interop] }
      })
      expect(vapor.get('strong').text()).toBe('real child')

      // Without resetting config, a VDOM parent should get the stub with its slot.
      const vdom = mount({
        template: '<GlobalChild>slot content</GlobalChild>'
      })
      expect(vdom.get('global-child-stub').text()).toBe('slot content')
    })
  })
})

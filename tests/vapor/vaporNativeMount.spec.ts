import { afterEach, describe, expect, expectTypeOf, test, vi } from 'vitest'
import { type App, nextTick, ref, watchEffect } from 'vue'
import {
  enableAutoUnmount,
  mount,
  renderToString,
  shallowMount
} from '../../src'
import Async from './Async.vue'
import ConditionalRoot from './ConditionalRoot.vue'
import Counter from './Counter.vue'
import Directed from './Directed.vue'
import ExposedCounter from './ExposedCounter.vue'
import Greeting from './Greeting.vue'
import InjectedMessage from './InjectedMessage.vue'
import Teleported from './Teleported.vue'
import Unexposed from './Unexposed.vue'

describe('Vapor native mount', () => {
  enableAutoUnmount(afterEach)

  describe('mounting and plugins', () => {
    test('requires explicit opt-in to mount a compiled Vapor root', () => {
      // Without the flag, mount should reject the root rather than try VDOM rendering.
      expect(() => mount(Counter, { props: { label: 'Count' } })).toThrow(
        'experimentalVapor: true'
      )
    })

    test('rejects an async Vapor root mounted without Suspense', () => {
      // The native mount has no parent Suspense boundary to await setup.
      expect(() => mount(Async, { experimentalVapor: true })).toThrow(
        'inside <Suspense>'
      )
    })

    test('renders the initial prop of a compiled Vapor component', () => {
      // A pure Vapor root needs no interop plugin.
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      expect(wrapper.text()).toBe('Hello, Ada!')
    })

    test('installs caller plugins on the native Vapor app', () => {
      const install = vi.fn<(app: App) => void>()
      mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' },
        global: { plugins: [{ install }] }
      })

      // A VDOM host could render the same greeting; the plugin must receive the Vapor app.
      expect(install).toHaveBeenCalledWith(
        expect.objectContaining({ vapor: true })
      )
    })

    test('makes a plugin-provided value available during Vapor setup', () => {
      // The component injects the message during setup, so the plugin must run first.
      const wrapper = mount(InjectedMessage, {
        experimentalVapor: true,
        global: {
          plugins: [(app: App) => app.provide('message', 'From the plugin')]
        }
      })

      expect(wrapper.text()).toBe('From the plugin')
    })
  })

  describe('exposed instance', () => {
    test('infers the vm type from defineExpose', () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })

      // count is an unwrapped number; the private label is not part of the type.
      expectTypeOf(wrapper.vm).toEqualTypeOf<{ count: number }>()
    })

    test('returns an empty vm when the component does not call defineExpose', () => {
      // Greeting uses the name prop in its template but exposes nothing to callers.
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      expect(wrapper.vm).toEqual({})
    })

    test('reads an exposed ref through vm as a live, unwrapped value', async () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })
      const vm = wrapper.vm

      // The same vm should read the current count, not a snapshot taken at mount.
      expect(vm.count).toBe(0)
      await wrapper.get('button').trigger('click')
      expect(vm.count).toBe(1)
    })

    test('keeps private setup state and Vue instance properties off vm', () => {
      const { vm } = mount(ExposedCounter, { experimentalVapor: true })

      // The template reads label, but defineExpose only publishes count.
      expect(vm).not.toHaveProperty('label')
      expect(vm).not.toHaveProperty('$')
      expect(vm).not.toHaveProperty('$el')
    })
  })

  describe('props, attrs and listeners', () => {
    test('passes mount attrs to the rendered Vapor root', () => {
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' },
        attrs: { id: 'greeting' }
      })

      // The id belongs on the rendered paragraph, not its mount container.
      expect(wrapper.get('p').attributes('id')).toBe('greeting')
    })

    test('passes the emitted change payload to the mount listener', async () => {
      const onChange = vi.fn<(value: number) => void>()
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count', onChange }
      })

      // A DOM click makes Counter emit a component event with the new count.
      await wrapper.get('button').trigger('click')
      expect(onChange).toHaveBeenCalledExactlyOnceWith(1)
    })

    test('preserves component state when setProps changes a prop', async () => {
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Before' }
      })

      // A remount would update the label but reset the count to zero.
      await wrapper.get('button').trigger('click')
      await wrapper.setProps({ label: 'After' })
      expect(wrapper.text()).toBe('After:1')
    })

    test('preserves a ref passed through setProps', async () => {
      const observe = vi.fn<(value: number) => void>()
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count', observe }
      })

      // Counter's effect reads signal.value, so later writes must reach it too.
      const signal = ref(4)
      await wrapper.setProps({ signal })
      signal.value = 7
      await nextTick()
      expect(observe.mock.calls).toEqual([[0], [4], [7]])
    })
  })

  describe('DOM queries', () => {
    test('includes the component root in findAll results', () => {
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      // Greeting's only <p> is its root; a descendants-only search would miss it.
      expect(wrapper.findAll('p')).toHaveLength(1)
    })

    test('returns an empty wrapper when find has no match', () => {
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      // Unlike get(), find() lets callers check for a missing element without throwing.
      expect(wrapper.find('button').exists()).toBe(false)
    })

    test('reads the current attribute from the component root', async () => {
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'First counter' }
      })

      // Counter binds its label prop to aria-label on the root <section>.
      expect(wrapper.attributes('aria-label')).toBe('First counter')
      await wrapper.setProps({ label: 'Renamed counter' })
      expect(wrapper.attributes('aria-label')).toBe('Renamed counter')
    })

    test('reads classes from the component root', () => {
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count' }
      })

      // The counter class belongs to the root <section>, not the mount container.
      expect(wrapper.classes()).toEqual(['counter'])
    })

    test('returns the rendered root markup from html()', () => {
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      // Include the component's <p>, but not its mount container.
      expect(wrapper.html()).toBe('<p>Hello, Ada!</p>')
    })

    test('reads the updated text after a click', async () => {
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count' }
      })

      // Awaiting trigger() should be enough to see the rendered update.
      expect(wrapper.text()).toBe('Count:0')
      await wrapper.get('button').trigger('click')
      expect(wrapper.text()).toBe('Count:1')
    })
  })

  describe('directives', () => {
    test('passes the template binding to a global Vapor directive', () => {
      const wrapper = mount(Directed, {
        experimentalVapor: true,
        props: { label: 'Hello' },
        global: {
          directives: {
            label(el, value, arg, modifiers) {
              // The template uses v-label:prefix.strong on its paragraph.
              if (modifiers?.strong) el.textContent = `${arg?.()}: ${value?.()}`
            }
          }
        }
      })

      expect(wrapper.get('p').text()).toBe('prefix: Hello')
    })

    test('updates a directive effect when its bound prop changes', async () => {
      const observe = vi.fn()
      const wrapper = mount(Directed, {
        experimentalVapor: true,
        props: { label: 'Before' },
        global: {
          directives: {
            label(el, value) {
              // Reading the getter inside the effect tracks the bound prop.
              watchEffect(() => {
                el.textContent = value?.()
                observe(el.textContent)
              })
            }
          }
        }
      })

      await wrapper.setProps({ label: 'After' })
      expect(observe.mock.calls).toEqual([['Before'], ['After']])
      expect(wrapper.text()).toBe('After')
    })

    test('calls the cleanup returned by a directive on unmount', () => {
      const cleanup = vi.fn()
      const wrapper = mount(Directed, {
        experimentalVapor: true,
        props: { label: 'Hello' },
        global: { directives: { label: () => cleanup } }
      })

      // The returned function is for disposal, not part of mounting.
      expect(cleanup).not.toHaveBeenCalled()
      wrapper.unmount()
      expect(cleanup).toHaveBeenCalledOnce()
    })

    test('stops directive effects on unmount', async () => {
      const signal = ref(0)
      const observe = vi.fn()
      const wrapper = mount(Directed, {
        experimentalVapor: true,
        props: { label: 'Hello' },
        global: {
          directives: {
            label() {
              watchEffect(() => observe(signal.value))
            }
          }
        }
      })

      // The same external ref changes on both sides of unmount; only the first write is observed.
      signal.value = 1
      await nextTick()
      wrapper.unmount()
      signal.value = 2
      await nextTick()
      expect(observe.mock.calls).toEqual([[0], [1]])
    })
  })

  describe('multiple roots', () => {
    test('returns matches across multiple roots in DOM order', () => {
      const wrapper = mount(Unexposed, { experimentalVapor: true })

      // The first <b> is nested inside a <p>; the second <b> is itself a root.
      expect(wrapper.findAll('b').map(node => node.text())).toEqual([
        'first',
        'second'
      ])
    })

    test('find returns the first match across multiple roots', () => {
      const wrapper = mount(Unexposed, { experimentalVapor: true })

      // The nested <b> comes before the root-level <b> in the document.
      expect(wrapper.find('b').text()).toBe('first')
    })

    test('reads text from all component roots in order', () => {
      const wrapper = mount(Unexposed, { experimentalVapor: true })

      // Reading just the first root would omit the second sibling's text.
      expect(wrapper.text()).toBe('firstsecond')
    })
  })

  describe('Teleport', () => {
    test('finds Teleport content only inside the mount container', async () => {
      const wrapper = mount(Teleported, { experimentalVapor: true })

      // The paragraph exists in the body, outside this wrapper's container.
      expect(document.body.querySelector('.teleported')?.textContent).toBe(
        'teleported'
      )
      expect(wrapper.find('.teleported').exists()).toBe(false)
      await wrapper.setProps({ disabled: true })
      expect(wrapper.get('.teleported').text()).toBe('teleported')
    })

    test('reads Teleport text only while it is rendered in place', async () => {
      const wrapper = mount(Teleported, { experimentalVapor: true })

      // Disabling the Teleport moves the same text back into the container.
      expect(wrapper.text()).toBe('')
      await wrapper.setProps({ disabled: true })
      expect(wrapper.text()).toBe('teleported')
    })

    test('includes Teleport markup only while it is rendered in place', async () => {
      const wrapper = mount(Teleported, { experimentalVapor: true })

      // Check the paragraph, not the anchor comments Vue leaves in the container.
      const paragraph = '<p class="teleported">teleported</p>'
      expect(wrapper.html()).not.toContain('<p')
      await wrapper.setProps({ disabled: true })
      expect(wrapper.html()).toContain(paragraph)
    })

    test('removes content from the Teleport target on unmount', async () => {
      const wrapper = mount(Teleported, { experimentalVapor: true })
      await wrapper.setProps({ disabled: true })
      await wrapper.setProps({ disabled: false })

      // The paragraph is back in the body, so removing the mount container alone is not enough.
      expect(document.body.querySelector('.teleported')).not.toBeNull()
      wrapper.unmount()
      expect(document.body.querySelector('.teleported')).toBeNull()
    })
  })

  describe('conditional roots', () => {
    test('reports visibility as the conditional root appears', async () => {
      const wrapper = mount(ConditionalRoot, {
        experimentalVapor: true,
        props: { show: false }
      })

      // An anchor alone is not visible; the rendered button is.
      expect(wrapper.isVisible()).toBe(false)
      await wrapper.setProps({ show: true })
      expect(wrapper.isVisible()).toBe(true)
    })

    test('includes the inactive conditional root anchor in html()', () => {
      const wrapper = mount(ConditionalRoot, {
        experimentalVapor: true,
        props: { show: false }
      })

      // Vue leaves a comment where the button will be inserted.
      expect(wrapper.html()).toContain('<!--if-->')
    })

    test('uses the newly rendered button as the wrapper element', async () => {
      const wrapper = mount(ConditionalRoot, {
        experimentalVapor: true,
        props: { show: false }
      })

      expect(wrapper.find('button').exists()).toBe(false)
      await wrapper.setProps({ show: true })
      // The button, not its sibling anchor or their container, is the current root.
      expect(wrapper.element).toBe(wrapper.get('button').element)
    })

    test('triggers a click on the conditional root button', async () => {
      const onSelect = vi.fn()
      const wrapper = mount(ConditionalRoot, {
        experimentalVapor: true,
        props: { show: false, onSelect }
      })
      await wrapper.setProps({ show: true })

      // Trigger on the wrapper itself; only the button emits select on click.
      await wrapper.trigger('click')
      expect(onSelect).toHaveBeenCalledOnce()
    })
  })

  describe('unmount', () => {
    test('reports that the wrapper no longer exists after unmount', () => {
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' }
      })

      // Unmount here so the test can observe the transition before auto-unmount.
      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
      expect(wrapper.exists()).toBe(false)
    })

    test('removes the mount container from attachTo on manual unmount', () => {
      const host = document.createElement('div')
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        attachTo: host,
        props: { name: 'Ada' }
      })

      // Emptying the component without removing its container would leave a child.
      expect(host.textContent).toBe('Hello, Ada!')
      wrapper.unmount()
      expect(host.childElementCount).toBe(0)
    })

    test('stops component effects on unmount', async () => {
      const signal = ref(0)
      const observe = vi.fn()
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count', signal, observe }
      })

      // Only writes made while the component is mounted reach its effect.
      signal.value = 3
      await nextTick()
      wrapper.unmount()
      signal.value = 7
      await nextTick()
      expect(observe.mock.calls).toEqual([[0], [3]])
    })

    test('does not repeat manual cleanup during auto-unmount', ({
      onTestFinished
    }) => {
      const cleanup = vi.fn()
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count', cleanup }
      })

      wrapper.unmount()
      expect(cleanup).toHaveBeenCalledOnce()
      // The suite's auto-unmount runs in afterEach, before onTestFinished.
      onTestFinished(() => {
        expect(cleanup).toHaveBeenCalledOnce()
      })
    })

    test('automatically unmounts an attached Vapor root', ({
      onTestFinished
    }) => {
      const host = document.createElement('div')
      const wrapper = mount(Unexposed, {
        experimentalVapor: true,
        attachTo: host
      })

      expect(host.textContent).toBe('firstsecond')
      // Leave the wrapper mounted so only the suite's auto-unmount can remove it.
      onTestFinished(() => {
        expect(wrapper.exists()).toBe(false)
        expect(host.childElementCount).toBe(0)
      })
    })

    test('still auto-unmounts a VDOM root after manual Vapor unmount', ({
      onTestFinished
    }) => {
      const vapor = mount(ExposedCounter, { experimentalVapor: true })
      const vdom = mount({ template: '<p>VDOM</p>' })

      // Unmounting one wrapper must not unregister the other from auto-unmount.
      vapor.unmount()
      expect(vdom.exists()).toBe(true)
      onTestFinished(() => {
        expect(vdom.exists()).toBe(false)
      })
    })
  })

  describe('unsupported options', () => {
    test('treats undefined slots as omitted', () => {
      const wrapper = mount(Greeting, {
        experimentalVapor: true,
        props: { name: 'Ada' },
        slots: undefined
      })

      // The presence of the slots key alone should not prevent rendering.
      expect(wrapper.text()).toBe('Hello, Ada!')
    })

    test('rejects supplied slot content on a Vapor mount', () => {
      const options = {
        experimentalVapor: true,
        slots: { default: 'Hello' }
      } as const

      // @ts-expect-error JavaScript callers should get a slots-specific error too.
      expect(() => mount(ExposedCounter, options)).toThrow(
        'does not support: slots'
      )
    })

    test('rejects shallow mounting a Vapor root', () => {
      expect(() =>
        // @ts-expect-error Opting in to Vapor does not enable shallow mounting.
        shallowMount(ExposedCounter, { experimentalVapor: true })
      ).toThrow('does not support: shallow')
    })

    test('rejects rendering a Vapor root to a string', () => {
      expect(() =>
        // @ts-expect-error The Vapor opt-in is for DOM mounting, not SSR.
        renderToString(ExposedCounter, { experimentalVapor: true })
      ).toThrow(
        'renderToString is not supported for experimental Vapor mounting'
      )
    })

    test('rejects a data override at mount time', () => {
      expect(() =>
        // @ts-expect-error Vapor roots do not accept Options API data overrides.
        mount(ExposedCounter, {
          experimentalVapor: true,
          data: () => ({ count: 5 })
        })
      ).toThrow('does not support: data')
    })

    test.each([
      { option: 'stubs', global: { stubs: { Child: true } } },
      { option: 'mocks', global: { mocks: { $t: () => 'translated' } } },
      { option: 'mixins', global: { mixins: [{}] } },
      {
        option: 'renderStubDefaultSlot',
        global: { renderStubDefaultSlot: true }
      },
      // Function directives are supported; object directives are not.
      {
        option: 'directives',
        global: { directives: { Focus: { mounted() {} } } }
      }
    ])(
      'rejects explicit VDOM-only global.$option on a Vapor mount',
      ({ option, global }) => {
        expect(() =>
          // @ts-expect-error Exercise the runtime error a JavaScript caller would see.
          mount(ExposedCounter, { experimentalVapor: true, global })
        ).toThrow(`Vapor mounting does not support: global.${option}`)
      }
    )
  })

  describe('unsupported wrapper methods', () => {
    test('rejects findComponent on a native Vapor wrapper', () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })

      // Even the mounted component itself cannot be looked up by definition.
      expect(() => wrapper.findComponent(ExposedCounter)).toThrow(
        'Component discovery is not supported for Vapor'
      )
    })

    test('rejects findAllComponents on a native Vapor wrapper', () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })

      // Returning an empty list would imply that the search ran and found nothing.
      expect(() => wrapper.findAllComponents(ExposedCounter)).toThrow(
        'Component discovery is not supported for Vapor'
      )
    })

    test('rejects getComponent on a native Vapor wrapper', () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })

      // Report unsupported discovery rather than a missing component.
      expect(() => wrapper.getComponent(ExposedCounter)).toThrow(
        'Component discovery is not supported for Vapor'
      )
    })

    test('rejects DOM ref selectors on a native Vapor wrapper', () => {
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count' }
      })

      // The button has this template ref; the selector is unsupported, not missing.
      expect(() => wrapper.find({ ref: 'button' })).toThrow(
        'Ref selectors are not supported for Vapor; use CSS selectors'
      )
    })

    test('rejects emitted() even after a Vapor component emits an event', async () => {
      const wrapper = mount(Counter, {
        experimentalVapor: true,
        props: { label: 'Count' }
      })

      // The click emits change, but the native wrapper does not expose event history.
      await wrapper.get('button').trigger('click')
      expect(() => wrapper.emitted('change')).toThrow(
        'emitted is not supported'
      )
    })

    test('rejects setData on a mounted Vapor component', () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })

      // Exposing count on vm does not make it Options API data.
      expect(() => wrapper.setData({ count: 5 })).toThrow(
        'setData is not supported for Vapor'
      )
    })

    test('directs setValue callers to a DOM wrapper', () => {
      const wrapper = mount(ExposedCounter, { experimentalVapor: true })

      // The component wrapper itself is not a form control.
      expect(() => wrapper.setValue('new')).toThrow(
        'Use a DOM wrapper to setValue'
      )
    })
  })

  describe('failed mount cleanup', () => {
    test('removes the attached container when setup reports an error', () => {
      const host = document.createElement('div')
      // Counter calls observe from its first setup effect.
      const observe = () => {
        throw new Error('setup failed')
      }

      expect(() =>
        mount(Counter, {
          experimentalVapor: true,
          attachTo: host,
          props: { label: 'Count', observe }
        })
      ).toThrow('setup failed')
      expect(host.childElementCount).toBe(0)
    })

    test('preserves existing host children when the Vapor renderer throws', () => {
      const host = document.createElement('div')
      const sibling = host.appendChild(document.createElement('p'))
      const component = {
        __vapor: true,
        // A non-async setup returning a Promise reaches the renderer rather than the async setup guard.
        setup: () => Promise.resolve(document.createElement('span'))
      }

      expect(() =>
        mount(component, { experimentalVapor: true, attachTo: host })
      ).toThrow(Error)
      expect(host.childElementCount).toBe(1)
      expect(host.firstElementChild).toBe(sibling)
    })
  })
})

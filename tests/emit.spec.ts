import {
  defineComponent,
  FunctionalComponent,
  getCurrentInstance,
  h,
  SetupContext
} from 'vue'
import { Vue } from 'vue-class-component'
import EmitsEventSFC from './components/EmitsEventSFC.vue'
import EmitsEventScriptSetup from './components/EmitsEventScriptSetup.vue'

import { mount } from '../src'

describe('emitted', () => {
  let consoleWarnSave = console.info

  beforeEach(() => {
    consoleWarnSave = console.warn
    console.warn = jest.fn()
  })

  afterEach(() => {
    console.warn = consoleWarnSave
  })

  it('captures events emitted via this.$emit', async () => {
    const Component = defineComponent({
      render() {
        return h('div', [
          h('button', { onClick: () => this.$emit('hello', 'foo', 'bar') })
        ])
      }
    })
    const wrapper = mount(Component)
    expect(wrapper.emitted()).toEqual({})
    expect(wrapper.emitted().hello).toEqual(undefined)

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[1]).toEqual(['foo', 'bar'])
  })

  it('captures events emitted via ctx.emit', () => {
    const Component = defineComponent({
      name: 'ContextEmit',

      setup(props, ctx) {
        return () =>
          h('div', [
            h('button', { onClick: () => ctx.emit('hello', 'foo', 'bar') })
          ])
      }
    })
    const wrapper = mount(Component)
    expect(wrapper.emitted()).toEqual({})
    expect(wrapper.emitted().hello).toEqual(undefined)

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[1]).toEqual(['foo', 'bar'])
  })

  it('captures events emitted via destructured emit', () => {
    const Component = defineComponent({
      name: 'ContextEmit',

      setup(props, { emit }) {
        return () =>
          h('div', [
            h('button', { onClick: () => emit('hello', 'foo', 'bar') })
          ])
      }
    })
    const wrapper = mount(Component)
    expect(wrapper.emitted()).toEqual({})
    expect(wrapper.emitted().hello).toEqual(undefined)

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[1]).toEqual(['foo', 'bar'])
  })

  it('should propagate child native events', async () => {
    const Child = defineComponent({
      name: 'Button',
      setup(props) {
        return () => h('div', [h('input')])
      }
    })

    const Parent = defineComponent({
      name: 'Parent',
      setup() {
        return () =>
          h('div', [
            h(Child, {
              onClick: (event: Event) => event.stopPropagation()
            })
          ])
      }
    })

    const GrandParent: FunctionalComponent<{ level: number }> = (
      props,
      ctx
    ) => {
      return h(`h${props.level}`, [h(Parent)])
    }

    const wrapper = mount(GrandParent)
    const parentWrapper = wrapper.findComponent(Parent)
    const childWrapper = wrapper.findComponent(Child)
    const input = wrapper.find('input')

    expect(wrapper.emitted()).toEqual({})
    expect(parentWrapper.emitted()).toEqual({})
    expect(childWrapper.emitted()).toEqual({})

    await input.trigger('click')

    // Propagation should stop at Parent
    expect(childWrapper.emitted().click).toHaveLength(1)
    expect(parentWrapper.emitted().click).toEqual(undefined)
    expect(wrapper.emitted().click).toEqual(undefined)

    input.setValue('hey')

    expect(childWrapper.emitted().input).toHaveLength(1)
    expect(parentWrapper.emitted().input).toHaveLength(1)
    expect(wrapper.emitted().input).toHaveLength(1)
  })

  it('should not propagate child custom events', () => {
    const Child = defineComponent({
      name: 'Child',
      emits: {
        hi: (foo: 'foo', bar: 'bar') => true
      },
      setup(props, { emit }) {
        return () =>
          h('div', [h('button', { onClick: () => emit('hi', 'foo', 'bar') })])
      }
    })

    const Parent = defineComponent({
      name: 'Parent',
      emits: ['hello'],
      setup(props, { emit }) {
        return () =>
          h(Child, {
            onHi: (...events: unknown[]) => emit('hello', ...events)
          })
      }
    })
    const wrapper = mount(Parent)
    const childWrapper = wrapper.findComponent(Child)

    expect(wrapper.emitted()).toEqual({})
    expect(childWrapper.emitted()).toEqual({})

    wrapper.find('button').trigger('click')

    // Parent should emit custom event 'hello' but not 'hi'
    expect(wrapper.emitted().hello[0]).toEqual(['foo', 'bar'])
    expect(wrapper.emitted().hi).toEqual(undefined)
    // Child should emit custom event 'hi'
    expect(childWrapper.emitted().hi[0]).toEqual(['foo', 'bar'])

    // Additional events should accumulate in the same format
    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().hello[1]).toEqual(['foo', 'bar'])
    expect(wrapper.emitted().hi).toEqual(undefined)
    expect(childWrapper.emitted().hi[1]).toEqual(['foo', 'bar'])
  })

  it('should not propagate native events defined in emits', () => {
    const HiButton = defineComponent({
      name: 'HiButton',
      emits: ['hi', 'click'],
      setup(props, { emit }) {
        return () =>
          h('div', [h('button', { onClick: () => emit('hi', 'foo', 'bar') })])
      }
    })

    const wrapper = mount(HiButton)

    expect(wrapper.emitted()).toEqual({})

    wrapper.find('button').trigger('click')

    expect(wrapper.emitted().hi[0]).toEqual(['foo', 'bar'])
    expect(wrapper.emitted().click).toEqual(undefined)
  })

  it('should allow passing the name of an event', () => {
    const Component = defineComponent({
      name: 'ContextEmit',

      setup(props, ctx) {
        return () =>
          h('div', [
            h('button', { onClick: () => ctx.emit('hello', 'foo', 'bar') })
          ])
      }
    })
    const wrapper = mount(Component)

    // test what happens if you pass a none existent event
    expect(wrapper.emitted('hello')).toEqual(undefined)

    wrapper.find('button').trigger('click')
    expect((wrapper.emitted('hello') as unknown[])[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect((wrapper.emitted('hello') as unknown[])[1]).toEqual(['foo', 'bar'])

    expect(wrapper.emitted('hello')).toHaveLength(2)
  })

  it('captures events emitted by functional components', () => {
    const Component: FunctionalComponent<
      { bar: string; level: number },
      { hello: (foo: string, bar: string) => void }
    > = (props, ctx) => {
      return h(`h${props.level}`, {
        onClick: () => ctx.emit('hello', 'foo', props.bar)
      })
    }

    const wrapper = mount(Component, {
      props: {
        bar: 'bar',
        level: 1
      }
    })

    wrapper.find('h1').trigger('click')
    expect(wrapper.emitted('hello')).toHaveLength(1)
    expect((wrapper.emitted('hello') as unknown[])[0]).toEqual(['foo', 'bar'])
  })

  it('captures events emitted by class-style components', () => {
    // Define the component in class-style
    class Component extends Vue {
      bar = 'bar'
      render() {
        return h(`h1`, {
          onClick: () => this.$emit('hello', 'foo', this.bar)
        })
      }
    }

    const wrapper = mount(Component, {})

    wrapper.find('h1').trigger('click')
    expect(wrapper.emitted('hello')).toHaveLength(1)
    expect((wrapper.emitted('hello') as unknown[])[0]).toEqual(['foo', 'bar'])
  })

  it('captures an event emitted in setup', () => {
    const Comp = {
      setup(_: Record<string, any>, { emit }: { emit: SetupContext['emit'] }) {
        emit('foo')
      }
    }
    const wrapper = mount(Comp)
    expect(wrapper.emitted().foo).toBeTruthy()
  })

  it('captures composition event', async () => {
    const useCommonBindings = () => {
      const onCompositionStart = (evt: CompositionEvent) => {
        const instance = getCurrentInstance()!
        instance.emit('compositionStart', evt)
      }
      return { onCompositionStart }
    }
    const IxInput = defineComponent({
      setup() {
        return useCommonBindings()
      },
      template: `<input @compositionstart="(evt) => $emit('compositionStart', evt)" />`
    })

    const wrapper = mount({
      components: { IxInput },
      template: `<ix-input />`
    })

    await wrapper.find('input').trigger('compositionstart')

    expect(wrapper.emitted().compositionstart).not.toBe(undefined)
  })

  it('https://github.com/vuejs/test-utils/issues/436', async () => {
    const Foo = defineComponent({
      name: 'Foo',
      emits: ['foo'],
      setup(_, ctx) {
        return () =>
          h(
            'div',
            {
              onClick: () => {
                ctx.emit('foo', 'bar')
              }
            },
            'hello world'
          )
      }
    })

    const wrapper = mount(Foo)
    await wrapper.trigger('click')
    expect(wrapper.emitted('foo')).toHaveLength(1)
  })

  it('does not capture native events on component which render non-element root', async () => {
    const Foo = defineComponent({ template: 'plain-string' })
    const wrapper = mount(Foo)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('does not capture native events on component with multiple root element nodes', async () => {
    const Foo = defineComponent({ template: '<div>1</div><div>2</div>' })
    const wrapper = mount(Foo)
    await wrapper.find('div').trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('capture native events on components which render multiple root nodes with only single element', async () => {
    const Foo = defineComponent({
      template: '<div>1</div><!-- comment node -->'
    })
    const wrapper = mount(Foo)
    await wrapper.find('div').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('captures emitted events in SFC', async () => {
    const wrapper = mount(EmitsEventSFC)
    await wrapper.trigger('click')

    expect(wrapper.emitted().click).toHaveLength(1)
    expect(wrapper.emitted().bar).toHaveLength(2)
    expect(wrapper.emitted().bar[0]).toEqual(['mounted'])
    expect(wrapper.emitted().bar[1]).toEqual(['click'])
  })

  it('captures emitted events in script setup', async () => {
    const wrapper = mount(EmitsEventScriptSetup)
    await wrapper.trigger('click')

    expect(wrapper.emitted().click).toHaveLength(1)
    expect(wrapper.emitted().bar).toHaveLength(2)
    expect(wrapper.emitted().bar[0]).toEqual(['mounted'])
    expect(wrapper.emitted().bar[1]).toEqual(['click'])
  })

  it('captures pass through events', async () => {
    const BaseInput = defineComponent({
      props: {
        modelValue: String
      },
      emits: ['update:modelValue'],
      template: `<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`
    })

    const CustomInput = defineComponent({
      components: { BaseInput },
      template: `<BaseInput v-bind="{ ...$attrs }"/>`
    })

    const wrapper = mount(CustomInput, {
      props: {
        modelValue: 'Text'
      }
    })

    const input = wrapper.get('input')
    await input.setValue('New Text')

    const baseInput = wrapper.findComponent(BaseInput)
    expect(baseInput.emitted('update:modelValue')).toEqual([['New Text']])

    expect(wrapper.emitted('update:modelValue')).toEqual([['New Text']])
  })

  it('does not clear all emitted event history on mount/unmount', async () => {
    const Foo = defineComponent({
      name: 'Foo',
      emits: ['foo'],
      setup(_, ctx) {
        return () =>
          h(
            'div',
            {
              onClick: () => {
                ctx.emit('foo', 'bar')
              }
            },
            'hello world'
          )
      }
    })

    const wrapper1 = mount(Foo)
    await wrapper1.trigger('click')
    expect(wrapper1.emitted('foo')).toHaveLength(1)

    const wrapper2 = mount(Foo)
    await wrapper2.trigger('click')
    expect(wrapper2.emitted('foo')).toHaveLength(1)
    expect(wrapper1.emitted('foo')).toHaveLength(1) // ensuring that subsequent mount does not clear event history for other wrappers

    wrapper1.unmount()
    wrapper2.unmount()
  })
})

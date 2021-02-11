import { defineComponent, FunctionalComponent, h, SetupContext } from 'vue'
import { Vue } from 'vue-class-component'

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

  it('captures events emitted via this.$emit', () => {
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

    wrapper.find('button').trigger('click')
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

  it('should not propagate child events', () => {
    const Child = defineComponent({
      name: 'Child',
      setup(props, { emit }) {
        return () =>
          h('div', [
            h('button', { onClick: () => emit('hello', 'foo', 'bar') })
          ])
      }
    })

    const Parent = defineComponent({
      name: 'Parent',
      setup(props, { emit }) {
        return () =>
          h(Child, { onHello: (...events: any[]) => emit('parent', ...events) })
      }
    })
    const wrapper = mount(Parent)
    const childWrapper = wrapper.findComponent(Child)

    expect(wrapper.emitted()).toEqual({})
    expect(childWrapper.emitted()).toEqual({})

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().parent[0]).toEqual(['foo', 'bar'])
    expect(wrapper.emitted().hello).toEqual(undefined)
    expect(childWrapper.emitted().hello[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().parent[1]).toEqual(['foo', 'bar'])
    expect(wrapper.emitted().hello).toEqual(undefined)
    expect(childWrapper.emitted().hello[1]).toEqual(['foo', 'bar'])
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
})

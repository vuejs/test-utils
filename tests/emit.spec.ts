import { defineComponent, FunctionalComponent, h, SetupContext } from 'vue'

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

  it('should propagate the original event', () => {
    const Component = defineComponent({
      name: 'ContextEmit',

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
          h(Component, { onHello: (...events) => emit('parent', ...events) })
      }
    })
    const wrapper = mount(Parent)
    expect(wrapper.emitted()).toEqual({})
    expect(wrapper.emitted().hello).toEqual(undefined)

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().parent[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted().parent[1]).toEqual(['foo', 'bar'])
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
    expect(wrapper.emitted('hello')[0]).toEqual(['foo', 'bar'])

    wrapper.find('button').trigger('click')
    expect(wrapper.emitted('hello')[1]).toEqual(['foo', 'bar'])

    expect(wrapper.emitted('hello')).toHaveLength(2)
  })

  it('gives a useful warning for functional components', () => {
    const Component: FunctionalComponent<{ bar: string; level: number }> = (
      props,
      ctx
    ) => {
      return h(`h${props.level}`, {
        onClick: () => ctx.emit('hello', 'foo', props.bar)
      })
    }

    // @ts-ignore - need to improve `mount` to support `FunctionalComponent`
    const wrapper = mount(Component, {
      props: {
        bar: 'bar',
        level: 1
      }
    })

    wrapper.find('h1').trigger('click')
    expect(wrapper.emitted('hello')).toHaveLength(1)
    expect(wrapper.emitted('hello')[0]).toEqual(['foo', 'bar'])
  })
})

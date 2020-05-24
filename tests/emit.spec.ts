import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('emitted', () => {
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
})

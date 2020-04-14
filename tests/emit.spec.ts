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

  it.skip('captures events emitted via destructured emit', () => {
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
})

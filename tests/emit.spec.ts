import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('emitted', () => {
  it('captures events emitted via this.$emit', () => {
    const Component = defineComponent({
      render() {
        return h(
          'div', [
          h('button', { onClick: () => this.$emit('hello', 'foo', 'bar') })
        ]
        )
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

  // NOTE: This will fail until alpha 5.
  // For now I am testing this by hacking node_modules/vue/dist/vue.esm.js with the following fix:
  // https://github.com/vuejs/vue-next/commit/e308ad99e9f5bdfb0910a2d6959e746f558714c5
  it('captures events emitted via ctx.emit', () => {
    const Component = defineComponent({
      name: 'ContextEmit',

      setup(props, ctx) {
        return () => 
          h(
            'div', [
            h('button', { onClick: () => ctx.emit('hello', 'foo', 'bar') })
          ]
        )
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
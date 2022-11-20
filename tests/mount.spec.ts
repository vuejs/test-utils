import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '../src'
import HelloFromVitestPlayground from './components/HelloFromVitestPlayground.vue'

describe('mount: general tests', () => {
  it('correctly handles component, throwing on mount', () => {
    // See https://github.com/vuejs/core/issues/7020
    const ThrowingComponent = defineComponent({
      props: ['blowup'],
      mounted() {
        if (this.blowup) {
          throw new Error('Boom!')
        }
      },
      template: '<div>hello</div>'
    })

    expect(() =>
      mount(ThrowingComponent, { props: { blowup: true } })
    ).toThrow()

    const wrapper = mount(ThrowingComponent, { props: { blowup: false } })

    expect(wrapper.html()).toBe('<div>hello</div>')
  })

  it('should not warn on readonly hasOwnProperty when mounting a component', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(HelloFromVitestPlayground, { props: { count: 2 } })

    expect(spy).not.toHaveBeenCalled()
  })
})

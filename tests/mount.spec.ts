import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '../src'

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
})

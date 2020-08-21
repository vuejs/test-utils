import { defineComponent } from 'vue'

import { mount } from '../src'

describe('Unmount', () => {
  it('works on single root component', () => {
    const errorHandler = jest.fn()
    const Component = {
      template: `
        <div></div>
      `
    }
    const wrapper = mount(Component, {
      props: {},
      global: {
        config: {
          errorHandler
        }
      }
    } as any) // The type checking keeps complaning about unmatched type which might be a bug
    wrapper.unmount()
    expect(errorHandler).not.toHaveBeenCalled()
  })

  it('works on multi-root component', () => {
    const errorHandler = jest.fn()
    const Component = defineComponent({
      template: `
        <div></div>
        <div></div>
      `
    })
    const wrapper = mount(Component, {
      props: {},
      global: {
        config: {
          errorHandler
        }
      }
    } as any)
    wrapper.unmount()
    expect(errorHandler).not.toHaveBeenCalled()
  })
})

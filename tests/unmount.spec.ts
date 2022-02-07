import { defineComponent } from 'vue'
import LastUpdated from './components/LastUpdated.vue'

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

  it("The LastUpdated component renders the 'when' property", async () => {
    const wrapper = mount(LastUpdated, { props: { when: 'today' } })

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('<span>today</span>')
    wrapper.unmount()
  })

  it("The LastUpdated component doesn't render when 'when' is undefined", async () => {
    const wrapper = mount(LastUpdated, { props: { when: undefined } })

    await wrapper.vm.$nextTick()
    expect(wrapper.html()).not.toContain('<span>today</span>')
    wrapper.unmount()
  })
})

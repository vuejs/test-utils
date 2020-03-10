import { defineComponent, h, ref } from 'vue'

import { mount } from '../src'

describe('trigger', () => {
  it('works on the root element', async () => {
    const Component = defineComponent({
      setup() {
        return {
          count: ref(0)
        }
      },

      render() {
        return h('div', { onClick: () => this.count++ }, `Count: ${this.count}`)
      }
    })

    const wrapper = mount(Component)
    await wrapper.trigger('click')

    expect(wrapper.text()).toBe('Count: 1')
  })

  it('works on a nested element', async () => {
    const Component = defineComponent({
      setup() {
        return {
          count: ref(0)
        }
      },

      render() {
        return h('div', {}, [
          h('p', {}, `Count: ${this.count}`),
          h('button', { onClick: () => this.count++ })
        ])
      }
    })

    const wrapper = mount(Component)
    await wrapper.find('button').trigger('click')

    expect(wrapper.find('p').text()).toBe('Count: 1')
  })
})
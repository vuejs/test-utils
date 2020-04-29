import { defineComponent, h } from 'vue'
import WithProps from '../components/WithProps.vue'
import { mount } from '../../src'

describe('mountingOptions.props', () => {
  test('passes props', () => {
    const Component = defineComponent({
      props: {
        message: {
          type: String,
          required: true
        }
      },

      render() {
        return h('div', {}, `Message is ${this.message}`)
      }
    })

    const wrapper = mount(Component, {
      props: {
        message: 'Hello'
      }
    })
    expect(wrapper.text()).toBe('Message is Hello')
  })

  test('assigns extra attributes on components', () => {
    const wrapper = mount(WithProps, {
      props: {
        class: 'HelloFromTheOtherSide',
        id: 'hello',
        disabled: true,
        msg: 'Hello World'
      }
    })

    expect(wrapper.attributes()).toEqual({
      class: 'HelloFromTheOtherSide',
      disabled: 'true',
      id: 'hello'
    })

    expect(wrapper.props()).toEqual({
      msg: 'Hello World'
    })
  })

  test('assigns event listeners', async () => {
    const Component = {
      template: '<button @click="$emit(\'customEvent\', true)">Click</button>'
    }
    const onCustomEvent = jest.fn()
    const wrapper = mount(Component, { props: { onCustomEvent } })
    const button = wrapper.find('button')
    await button.trigger('click')
    await button.trigger('click')
    await button.trigger('click')

    expect(onCustomEvent).toHaveBeenCalledTimes(3)
  })
})

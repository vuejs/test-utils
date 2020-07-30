import { defineComponent, h } from 'vue'
import { mount } from '../../src'

describe('mountingOptions.props', () => {
  const Component = defineComponent({
    props: {
      message: {
        type: String,
        required: true
      },
      otherMessage: {
        type: String
      }
    },

    render() {
      return h('div', {}, `Message is ${this.message}`)
    }
  })
  test('passes props', () => {
    const wrapper = mount(Component, {
      props: {
        message: 'Hello'
      }
    })
    expect(wrapper.text()).toBe('Message is Hello')
  })

  test('assigns extra properties as attributes on components', () => {
    const wrapper = mount(Component, {
      props: {
        message: 'Hello World'
      },
      attrs: {
        class: 'HelloFromTheOtherSide',
        id: 'hello',
        disabled: true
      }
    })

    expect(wrapper.props()).toEqual({
      message: 'Hello World'
    })

    expect(wrapper.attributes()).toEqual({
      class: 'HelloFromTheOtherSide',
      disabled: 'true',
      id: 'hello'
    })
  })

  test('assigns event listeners', async () => {
    const Component = {
      template: '<button @click="$emit(\'customEvent\', true)">Click</button>'
    }
    const onCustomEvent = jest.fn()
    // Note that, as the component does not have any props declared, we need to cast the mounting props
    const wrapper = mount(Component, { props: { onCustomEvent } as never })
    const button = wrapper.find('button')
    await button.trigger('click')
    await button.trigger('click')
    await button.trigger('click')

    expect(onCustomEvent).toHaveBeenCalledTimes(3)
  })
})

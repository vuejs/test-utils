import { defineComponent, h } from 'vue'
import { mount } from '../../src'

describe('mountingOptions.attrs', () => {
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

  test('assigns extra attributes on components', () => {
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

    expect(wrapper.attributes()).toEqual({
      class: 'HelloFromTheOtherSide',
      disabled: 'true',
      id: 'hello'
    })

    expect(wrapper.props()).toEqual({
      message: 'Hello World'
    })
  })

  test('assigns event listeners', async () => {
    const Component = {
      template: '<button @click="$emit(\'customEvent\', true)">Click</button>'
    }
    const onCustomEvent = jest.fn()
    const wrapper = mount(Component, { attrs: { onCustomEvent } })
    const button = wrapper.find('button')
    await button.trigger('click')
    await button.trigger('click')
    await button.trigger('click')

    expect(onCustomEvent).toHaveBeenCalledTimes(3)
  })
})

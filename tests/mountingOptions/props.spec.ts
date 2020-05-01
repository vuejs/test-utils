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
    // the recommended way is to use `attrs` though
    // and ideally it should not even compile, but props is too loosely typed
    // for components defined with `defineComponent`
    const wrapper = mount(Component, {
      props: {
        message: 'Hello World',
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
})

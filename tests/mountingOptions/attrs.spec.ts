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

  test('is overridden by a prop with the same name', () => {
    const wrapper = mount(Component, {
      props: {
        message: 'Hello World'
      },
      attrs: {
        message: 'HelloFromTheOtherSide'
      }
    })

    expect(wrapper.props()).toEqual({
      message: 'Hello World'
    })

    expect(wrapper.attributes()).toEqual({})
  })
})

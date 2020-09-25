import { mount } from '../src'

describe('isVisible', () => {
  const Comp = {
    template: `<div><span v-show="show" /></div>`,
    props: {
      show: {
        type: Boolean
      }
    }
  }

  it('returns false when element hidden via v-show', () => {
    const wrapper = mount(Comp, {
      props: {
        show: false
      }
    })

    expect(wrapper.find('span').isVisible()).toBe(false)
  })

  it('returns true when element is visible via v-show', () => {
    const wrapper = mount(Comp, {
      props: {
        show: true
      }
    })

    expect(wrapper.find('span').isVisible()).toBe(true)
  })

  it('element becomes hidden reactively', async () => {
    const Comp = {
      template: `<button @click="show = false" /><span v-show="show" />`,
      data() {
        return {
          show: true
        }
      }
    }
    const wrapper = mount(Comp)

    expect(wrapper.find('span').isVisible()).toBe(true)
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('span').isVisible()).toBe(false)
  })
})

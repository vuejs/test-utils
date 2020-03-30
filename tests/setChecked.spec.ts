import { defineComponent, h } from 'vue'

import { mount } from '../src'
import ComponentWithInput from './components/ComponentWithInput.vue'

describe('setChecked', () => {
  it.skip('works on the root element', async () => {
    const Comp = defineComponent({
      render() {
        return h('input', { type: 'checkbox' })
      }
    })
    const wrapper = mount(Comp)
    await wrapper.setChecked()

    expect(wrapper.componentVM.$el.checked).toBe(true)
  })

  it('sets element checked true with no option passed', async () => {
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')
    await input.setChecked()

    expect(input.element.checked).toBe(true)
  })

  it('sets element checked equal to param passed', async () => {
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')

    await input.setChecked(true)
    expect(input.element.checked).toBe(true)

    await input.setChecked(false)
    expect(input.element.checked).toBe(false)
  })

  it('updates dom with checkbox v-model', async () => {
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')

    await input.setChecked()
    expect(wrapper.text()).toContain('checkbox checked')

    await input.setChecked(false)
    expect(wrapper.text()).not.toContain('checkbox checked')
  })

  it('changes state the right amount of times with checkbox v-model', async () => {
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')

    await input.setChecked()
    await input.setChecked(false)
    await input.setChecked(false)
    await input.setChecked(true)
    await input.setChecked(false)
    await input.setChecked(false)

    expect(wrapper.find<HTMLInputElement>('.counter').text()).toBe('4')
  })

  it('does not trigger a change event if the checkbox is already checked', async () => {
    const listener = jest.fn()
    const Comp = defineComponent({
      setup() {
        return () =>
          h('input', {
            onChange: listener,
            type: 'checkbox',
            checked: true
          })
      }
    })

    await mount(Comp).find('input').setChecked()

    expect(listener).not.toHaveBeenCalled()
  })

  it('updates dom with radio v-model', async () => {
    const wrapper = mount(ComponentWithInput)

    await wrapper.find<HTMLInputElement>('#radioBar').setChecked()
    expect(wrapper.text()).toContain('radioBarResult')

    await wrapper.find<HTMLInputElement>('#radioFoo').setChecked()
    expect(wrapper.text()).toContain('radioFooResult')
  })

  it('changes state the right amount of times with radio v-model', async () => {
    const wrapper = mount(ComponentWithInput)
    const radioBar = wrapper.find<HTMLInputElement>('#radioBar')
    const radioFoo = wrapper.find<HTMLInputElement>('#radioFoo')

    await radioBar.setChecked()
    await radioBar.setChecked()
    await radioFoo.setChecked()
    await radioBar.setChecked()
    await radioBar.setChecked()
    await radioFoo.setChecked()
    await radioFoo.setChecked()
    expect(wrapper.find<HTMLInputElement>('.counter').text()).toBe('4')
  })
})

import { defineComponent, ref } from 'vue'
import { mount } from '../src'

describe('vm', () => {
  it('returns the component vm', () => {
    const Component = defineComponent({
      name: 'VTUComponent',
      template: '<div>{{ msg }}</div>',
      setup() {
        const msg = 'hello'
        const isEnabled = ref(true)
        const toggle = () => (isEnabled.value = !isEnabled.value)
        return { msg, isEnabled, toggle }
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.vm.msg).toBe('hello')
    expect(wrapper.vm.isEnabled).toBe(true)

    wrapper.vm.toggle()

    expect(wrapper.vm.isEnabled).toBe(false)
  })

  it('allows spying on vm', async () => {
    const Component = defineComponent({
      name: 'VTUComponent',
      template: '<div @click="toggle()">{{ msg }}</div>',
      setup() {
        const msg = 'hello'
        const isEnabled = ref(true)
        const toggle = () => (isEnabled.value = !isEnabled.value)
        return { msg, isEnabled, toggle }
      }
    })

    const wrapper = mount(Component)

    jest.spyOn(wrapper.vm, 'toggle')

    await wrapper.get('div').trigger('click')

    expect(wrapper.vm.toggle).toHaveBeenCalled()
  })
})

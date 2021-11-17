import { defineComponent } from 'vue'
import { mount } from '../../src'

describe('mounting options: other', () => {
  it('passes other options as $options to component', () => {
    const TestComponent = defineComponent({ template: '<div>test</div>' })
    const optionContent = {}
    const wrapper = mount(TestComponent, {
      someUnknownOption: optionContent
    })
    expect(wrapper.vm.$options.someUnknownOption).toBe(optionContent)
  })
})

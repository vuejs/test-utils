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

  it('warns on deprecated `method` option and methods are preserved', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementationOnce(() => {})

    const TestComponent = defineComponent({
      template: '<div>{{ sayHi() }}</div>',
      methods: {
        sayHi() {
          return 'hi'
        }
      }
    })

    const wrapper = mount(TestComponent, { methods: {} })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(wrapper.html()).toBe('<div>hi</div>')

    spy.mockRestore()
  })
})

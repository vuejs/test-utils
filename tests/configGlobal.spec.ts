import { defineComponent } from 'vue'
import { mount } from '../src'

describe('global plugin via test runner setup script', () => {
  it('uses a component defined globally by a test runner setup script', () => {
    const Comp = defineComponent({
      template: `<foo-bar-plugin-component />`
    })

    const wrapper = mount(Comp)

    expect(wrapper.html()).toContain('Foo Bar')
  })
})

import { defineComponent } from 'vue'
import { mount } from '../src'
import { VueWrapper } from '../src/vue-wrapper'

const compA = defineComponent({
  template: `<div class="A"></div>`
})

describe('getComponent', () => {
  it('should delegate to findComponent', () => {
    const wrapper = mount(compA)
    jest.spyOn(wrapper, 'findComponent').mockReturnThis()
    wrapper.getComponent('.domElement')
    expect(wrapper.findComponent).toHaveBeenCalledWith('.domElement')
  })

  it('should throw if not found', () => {
    const wrapper = mount(compA)
    expect(() => wrapper.getComponent('.domElement')).toThrowError(
      'Unable to find component with selector .domElement within: <div class="A"></div>'
    )
  })
})

import { mount } from '../src'
import ComponentWithChildren from './components/ComponentWithChildren.vue'

describe('shallowMount', () => {
  it('stubs all components automatically', () => {
    const wrapper = mount(ComponentWithChildren, { shallow: true })
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">' +
        '<hello-stub></hello-stub>' +
        '<component-with-input-stub></component-with-input-stub>' +
        '<anonymous-stub></anonymous-stub>' +
        '<with-props-stub></with-props-stub>' +
        '</div>'
    )
  })
})

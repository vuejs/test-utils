import { mount, shallowMount } from '../src'
import ComponentWithChildren from './components/ComponentWithChildren.vue'

describe('shallowMount', () => {
  it('stubs all components automatically using { shallow: true }', () => {
    const wrapper = mount(ComponentWithChildren, { shallow: true })
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">' +
        '<hello-stub></hello-stub>' +
        '<component-with-input-stub></component-with-input-stub>' +
        '<component-without-name-stub></component-without-name-stub>' +
        '<with-props-stub></with-props-stub>' +
        '</div>'
    )
  })

  it('stubs all components automatically using shallowMount', () => {
    const wrapper = shallowMount(ComponentWithChildren)
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">' +
        '<hello-stub></hello-stub>' +
        '<component-with-input-stub></component-with-input-stub>' +
        '<component-without-name-stub></component-without-name-stub>' +
        '<with-props-stub></with-props-stub>' +
        '</div>'
    )
  })

  it('stubs all components, but allows providing custom stub', () => {
    const wrapper = mount(ComponentWithChildren, {
      shallow: true,
      global: {
        stubs: {
          Hello: { template: '<div>Override</div>' }
        }
      }
    })
    expect(wrapper.html()).toEqual(
      '<div class="ComponentWithChildren">' +
        '<div>Override</div>' +
        '<component-with-input-stub></component-with-input-stub>' +
        '<component-without-name-stub></component-without-name-stub>' +
        '<with-props-stub></with-props-stub>' +
        '</div>'
    )
  })
})

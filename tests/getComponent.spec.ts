import { defineComponent } from 'vue'
import { mount, RouterLinkStub, shallowMount } from '../src'
import Issue425 from './components/Issue425.vue'

const compA = defineComponent({
  template: `<div class="A"></div>`
})

const compB = defineComponent({
  name: 'CompB',
  template: `<div class="A"></div>`
})

describe('getComponent', () => {
  it('should delegate to findComponent', () => {
    const wrapper = mount(compA)
    jest.spyOn(wrapper, 'findComponent').mockReturnThis()
    wrapper.getComponent('.domElement')
    expect(wrapper.findComponent).toHaveBeenCalledWith('.domElement')
  })

  it('should throw if not found with a string selector', () => {
    const wrapper = mount(compA)
    expect(() => wrapper.getComponent('.domElement')).toThrowError(
      'Unable to get component with selector .domElement within: <div class="A"></div>'
    )
  })

  it('should throw if not found with a name selector', () => {
    const wrapper = mount(compA)
    expect(() => wrapper.getComponent({ name: 'CompB' })).toThrowError(
      'Unable to get component with name CompB within: <div class="A"></div>'
    )
  })

  it('should throw if not found with a component selector that has a name', () => {
    const wrapper = mount(compA)
    expect(() => wrapper.getComponent(compB)).toThrowError(
      'Unable to get component with name CompB within: <div class="A"></div>'
    )
  })

  it('should throw if not found with a ref selector', () => {
    const wrapper = mount(compA)
    expect(() => wrapper.getComponent({ ref: 'CompB' })).toThrowError(
      'Unable to get component with ref CompB within: <div class="A"></div>'
    )
  })

  it('should throw if not found with a component selector that has no name', () => {
    const wrapper = mount(compB)
    expect(() => wrapper.getComponent(compA)).toThrowError(
      'Unable to get specified component within: <div class="A"></div>'
    )
  })

  const name = 'some-route'
  const options = {
    props: {
      name
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub
      }
    }
  }

  // https://github.com/vuejs/vue-test-utils-next/issues/425
  it('works with router-link and mount', () => {
    const wrapper = mount(Issue425, options)
    expect(wrapper.getComponent('.link').props('to')).toEqual({ name })
  })

  // https://github.com/vuejs/vue-test-utils-next/issues/425
  it('works with router-link and shallowMount', () => {
    const wrapper = shallowMount(Issue425, options)
    expect(wrapper.getComponent('.link').props('to')).toEqual({ name })
  })
})

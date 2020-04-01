import { mount } from '../../src'

describe('global.components', () => {
  it('registers a component to all components', () => {
    const GlobalComponent = {
      template: '<div>Global</div>'
    }
    const Component = {
      template: '<div><global-component/></div>'
    }
    const wrapper = mount(Component, {
      global: {
        components: {
          GlobalComponent
        }
      }
    })

    expect(wrapper.text()).toBe('Global')
  })
})

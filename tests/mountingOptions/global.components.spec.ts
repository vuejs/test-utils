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

  it('allows global stubs to take precedence without warning', () => {
    const GlobalComponent = {
      template: '<div>Global</div>'
    }
    const spy = jest.spyOn(console, 'warn')
    const wrapper = mount(
      {
        template: '<div><global-component/></div>'
      },
      {
        global: {
          components: {
            GlobalComponent
          },
          stubs: { GlobalComponent: true }
        }
      }
    )

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    expect(wrapper.html()).toBe(
      `<div><global-component-stub></global-component-stub></div>`
    )
  })

  it('allows global stubs to be deactivated without warning', () => {
    const GlobalComponent = {
      template: '<div>Global</div>'
    }
    const spy = jest.spyOn(console, 'warn')
    const wrapper = mount(
      {
        template: '<div><global-component/></div>'
      },
      {
        global: {
          components: {
            GlobalComponent
          },
          stubs: { GlobalComponent: false }
        }
      }
    )

    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    expect(wrapper.text()).toBe('Global')
  })
})

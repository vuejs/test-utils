import { mount } from '../../src'
import { defineComponent } from 'vue'

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
    const spy = vi.spyOn(console, 'warn')
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
      '<div>\n' +
        '  <global-component-stub></global-component-stub>\n' +
        '</div>'
    )
  })

  it('allows global stubs to be deactivated without warning', () => {
    const GlobalComponent = {
      template: '<div>Global</div>'
    }
    const spy = vi.spyOn(console, 'warn')
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
  it('render children with shallow and renderStubDefaultSlot', () => {
    const Child = defineComponent({
      template: '<div><p>child</p><slot /></div>'
    })
    const Component = defineComponent({
      template: '<div><Child><div>hello</div></Child></div>',
      components: {
        Child
      }
    })
    const wrapper = mount(Component, {
      shallow: true,
      global: {
        renderStubDefaultSlot: true
      }
    })

    expect(wrapper.html()).toEqual(
      '<div>\n' +
        '  <child-stub>\n' +
        '    <div>hello</div>\n' +
        '  </child-stub>\n' +
        '</div>'
    )
  })
})

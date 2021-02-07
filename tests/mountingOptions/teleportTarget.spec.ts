import { mount } from '../../src'
import ComponentWithTeleport from '../components/ComponentWithTeleport.vue'

describe('mountingOptions.teleportTarget', () => {
  it('should find the html after teleporting element', async () => {
    const wrapper = mount(ComponentWithTeleport, {
      slots: {
        default: '<div id="slot-content">slot content</div>'
      },
      teleportTarget: document.body
    })

    // expect(wrapper.html()).not.toContain('slot content')
    // @ts-expect-error
    await wrapper.vm.toggleVisibility()
    expect(wrapper.html()).toContain('slot content')
  })

  it('should find the html when using multiple teleports', () => {})
})

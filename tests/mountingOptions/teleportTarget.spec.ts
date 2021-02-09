import { mount } from '../../src'
import ComponentWithTeleport from '../components/ComponentWithTeleport.vue'

describe('mountingOptions.teleportTarget', () => {
  const nestedTeleportTarget = document.createElement('div')
  nestedTeleportTarget.id = 'teleport-target'
  document.body.appendChild(nestedTeleportTarget)

  it('should find the html after teleporting element', async () => {
    const wrapper = mount(ComponentWithTeleport, {
      slots: {
        default: '<div>default slot content</div>',
        ['nested-teleported-slot']: '<div>nested teleport-content</div>'
      }
    })

    expect(wrapper.html()).not.toContain('slot content')
    // @ts-expect-error
    await wrapper.vm.toggleVisibility()
    expect(wrapper.html()).toContain('slot content')
    console.log(wrapper.html()) // input the value into https://www.freeformatter.com/html-formatter.html and compare with the ComponentWithTeleport
    // the html node order is reversed, I'll look into it why.
    // not entirely sure what's up with that residual `<!--teleport start--><!--teleport end-->` from the nested teleport
  })
})

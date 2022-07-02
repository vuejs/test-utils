import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '../src'
import { RouterLinkStub } from '../src/components/RouterLinkStub'

describe('RouterLinkStub', () => {
  it('renders an <a> element', () => {
    const component = defineComponent({
      template: '<RouterLink :to="{}">link text</RouterLink>'
    })
    const wrapper = mount(component, {
      props: {},
      global: { stubs: { RouterLink: RouterLinkStub } }
    })

    expect(wrapper.get('a').text()).toEqual('link text')
  })

  it('binds slot props', () => {
    const SlotReceiver = defineComponent({
      render: () => h('span'),
      props: ['route', 'href', 'isActive', 'isExactActive', 'navigate']
    })
    const component = defineComponent({
      components: { SlotReceiver },
      template:
        '<RouterLink :to="{}" v-slot="slotProps"><SlotReceiver v-bind="slotProps" /></RouterLink>'
    })
    const wrapper = mount(component, {
      props: {},
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    const slotVM = wrapper.findComponent(SlotReceiver).vm

    expect(slotVM.route.value).toBeInstanceOf(Object)
    expect(typeof slotVM.href.value).toBe('string')
    expect(typeof slotVM.isActive.value).toBe('boolean')
    expect(typeof slotVM.isExactActive.value).toBe('boolean')
    expect(slotVM.navigate).toBeInstanceOf(Function)
  })
})

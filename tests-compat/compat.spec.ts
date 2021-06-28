import * as Vue from '@vue/compat'
import { mount } from '../src'

const { configureCompat, extend, defineComponent } = Vue as any

describe('@vue/compat build', () => {
  it.each([true, false])(
    'correctly renders transition when RENDER_FUNCTION compat is %p',
    (RENDER_FUNCTION) => {
      configureCompat({ MODE: 3, RENDER_FUNCTION })

      const Component = defineComponent({
        template: '<transition><div class="hello"></div></transition>'
      })
      const wrapper = mount(Component)

      expect(wrapper.find('.hello').exists()).toBe(true)
    }
  )

  it('finds components declared with legacy Vue.extend', () => {
    configureCompat({ MODE: 3, GLOBAL_EXTEND: true })

    const LegacyComponent = extend({
      template: '<div>LEGACY</div>'
    })

    const Component = defineComponent({
      components: {
        LegacyComponent
      },
      template: '<div><legacy-component /></div>'
    })
    const wrapper = mount(Component)

    expect(wrapper.findComponent(LegacyComponent).exists()).toBe(true)
  })
})

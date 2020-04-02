import { Directive } from 'vue'
import { mount } from '../../src'

const MyDirective: Directive = {
  beforeMount(el: Element) {
    el.classList.add('DirectiveAdded')
  }
}

describe('global.directives', () => {
  it('registers a directive to all components', () => {
    const Component = {
      template: '<div v-my-directive>text</div>'
    }
    const wrapper = mount(Component, {
      global: {
        directives: {
          MyDirective
        }
      }
    })

    expect(wrapper.classes()).toContain('DirectiveAdded')
  })
})

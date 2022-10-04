import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '../src'

const compB = defineComponent({
  name: 'ComponentB',
  template: '<div class="B">C - {{title}}</div>',
  props: ['title']
})

const compA = defineComponent({
  name: 'A',
  template: `
    <div class="A">
    <comp-b title="save" />
    <comp-b title="delete" />
    </div>`,
  components: { compB }
})

describe('findComponentByProps', () => {
  it('finds component', () => {
    const wrapper = mount(compA)
    const saveComponent = wrapper.findComponentByProps(compB, { title: 'save' })
    expect(saveComponent.html()).toBe('<div class="B">C - save</div>')
  })

  it('throws wrapper error if component does not exist', () => {
    const wrapper = mount(compA)
    const emptyWrapper = wrapper.findComponentByProps(compB, {
      title: 'doesNotExist'
    })

    expect(emptyWrapper.exists()).toBe(false)
    expect(() => emptyWrapper.element).toThrowError(
      'Cannot call element on an empty VueWrapper'
    )
  })
})

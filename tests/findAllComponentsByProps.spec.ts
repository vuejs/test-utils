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
    <comp-b title="save" />
    <comp-b title="delete" />
    </div>`,
  components: { compB }
})

describe('findAllComponentsByProps', () => {
  it('finds all components', () => {
    const wrapper = mount(compA)
    expect(
      wrapper.findAllComponentsByProps(compB, { title: 'save' })
    ).toHaveLength(2)

    expect(
      wrapper.findAllComponentsByProps(compB, { title: 'delete' })
    ).toHaveLength(1)

    expect(
      wrapper.findAllComponentsByProps(compB, { title: 'doesNotExist' })
    ).toHaveLength(0)
  })
})

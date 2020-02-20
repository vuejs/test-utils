import { defineComponent, h } from 'vue'

import { mount } from '../src'

test('find', () => {
  const Component = defineComponent({
    render() {
      return h('div', {}, [h('span', { id: 'my-span' })])
    }
  })

  const wrapper = mount(Component)
  expect(wrapper.find('#my-span')).toBeTruthy()
})

test('findAll', () => {
  const Component = defineComponent({
    render() {
      return h('div', {}, [
        h('span', { className: 'span' }),
        h('span', { className: 'span' })
      ])
    }
  })

  const wrapper = mount(Component)
  expect(wrapper.findAll('.span')).toHaveLength(2)
})
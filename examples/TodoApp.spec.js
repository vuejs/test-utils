/**
 * This is the example app used in the documentation.
 * If you want to run it, you will need to build the final bundle with
 * yarn build. Then you can run this with `yarn test examples`
 */
import { mount } from '../dist/vue-test-utils.cjs.js'
import { test, expect } from 'vitest'

import TodoApp from './TodoApp.vue'

test('renders a todo', () => {
  const wrapper = mount(TodoApp)

  expect(wrapper.find('[data-test="todo"]').text()).toBe('Learn Vue.js 3')
})

test('creates a todo', async () => {
  const wrapper = mount(TodoApp)

  wrapper.find('[data-test="new-todo"]').element.value = 'New todo'
  await wrapper.find('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})

test('completes a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.find('[data-test="todo-checkbox"]').setChecked()

  expect(wrapper.find('[data-test="todo"]').classes()).toContain('completed')
})

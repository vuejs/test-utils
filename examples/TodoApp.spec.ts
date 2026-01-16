/**
 * This is the example app used in the documentation.
 * If you want to run it, you will need to build the final bundle with
 * pnpm build. Then you can run this with `pnpm test examples`
 */
import { mount } from '../dist/vue-test-utils.cjs.js'
import { describe, expect, it } from 'vitest'

import TodoApp from './TodoApp.vue'

describe('Todo App', () => {
  it('renders a todo', () => {
    const wrapper = mount(TodoApp)

    expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="todo"]').text()).toBe('Learn Vue.js 3')
  })

  it('creates a todo', async () => {
    const wrapper = mount(TodoApp)

    await wrapper.find('[data-test="new-todo"]').setValue('New todo')
    await wrapper.find('[data-test="form"]').trigger('submit')
    expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
  })

  it('completes a todo', async () => {
    const wrapper = mount(TodoApp)

    expect(wrapper.find('[data-test="todo"]').classes()).not.toContain(
      'completed'
    )

    await wrapper.find('[data-test="todo-checkbox"]').setChecked()

    expect(wrapper.find('[data-test="todo"]').classes()).toContain('completed')
  })
})

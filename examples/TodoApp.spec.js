import { mount } from '../dist/vue-test-utils.cjs.js'

import TodoApp from './TodoApp.vue'

test('renders a todo', () => {
  const wrapper = mount(TodoApp)

  expect(wrapper.find('[data-test="todo"]').text()).toBe('Learn Vue.js 3')
})


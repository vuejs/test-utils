# A Crash Course

Let's jump right into it! Let's learn Vue Test Utils (VTU) by building a simple Todo app and writing tests as we go. This
guide will cover how to:

- Mount components
- Find elements
- Fill out forms
- Trigger events

## Getting Started

We will start off with a simple `TodoApp` component with a single todo:

```vue
<template>
  <div></div>
</template>

<script>
export default {
  name: 'TodoApp',

  data() {
    return {
      todos: [
        {
          id: 1,
          text: 'Learn Vue.js 3',
          completed: false
        }
      ]
    }
  }
}
</script>
```

## The first test - a todo is rendered

The first test we will write verifies a todo is rendered. Let's see the test first, then discuss each part:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('renders a todo', () => {
  const wrapper = mount(TodoApp)

  const todo = wrapper.get('[data-test="todo"]')

  expect(todo.text()).toBe('Learn Vue.js 3')
})
```

We start off by importing `mount` - this is the main way to render a component in VTU. You declare a test by using the `test` function with a short description of the test. The `test` and `expect` functions are globally available in most test runners (this example uses [Jest](https://jestjs.io/en/)). If `test` and `expect` look confusing, the Jest documentation has a [more simple example](https://jestjs.io/docs/en/getting-started) of how to use them and how they work.

Next, we call `mount` and pass the component as the first argument - this is something almost every test you write will do. By convention, we assign the result to a variable called `wrapper`, since `mount` provides a simple "wrapper" around the app with some convenient methods for testing.

Finally, we use another global function common to many tests runner - Jest included - `expect`. The idea is we are asserting, or _expecting_, the actual output to match what we think it should be. In this case, we are finding an element with the selector `data-test="todo"` - in the DOM, this will look like `<div data-test="todo">...</div>`. We then call the `text` method to get the content, which we expect to be `'Learn Vue.js 3'`.

> Using `data-test` selectors is not required, but it can make your tests less brittle. classes and ids tend to change or move around as an application grows - by using `data-test`, it's clear to other developers which elements are used in tests, and should not be changed.

## Making the test pass

If we run this test now, it fails with the following error message: `Unable to get [data-test="todo"]`. That's because we aren't rendering any todo item, so the `get()` call is failing to return a wrapper (remember, VTU wraps all components, and DOM elements, in a "wrapper" with some convenient methods). Let's update `<template>` in `TodoApp.vue` to render the `todos` array:

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>
  </div>
</template>
```

With this change, the test is passing. Congratulations! You wrote your first component test.

## Adding a new todo

The next feature we will be adding is for the user to be able to create a new todo. To do so, we need a form with an input for the user to type some text. When the user submits the form, we expect the new todo to be rendered. Let's take a look at the test:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('creates a todo', () => {
  const wrapper = mount(TodoApp)
  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1)

  wrapper.get('[data-test="new-todo"]').setValue('New todo')
  wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

As usual, we start of by using `mount` to render the element. We are also asserting that only 1 todo is rendered - this makes it clear that we are adding an additional todo, as the final line of the test suggests.

To update the `<input>`, we use `setValue` - this allows us to set the input's value.

After updating the `<input>`, we use the `trigger` method to simulate the user submitting the form. Finally, we assert the number of todo items has increased from 1 to 2.

If we run this test, it will obviously fail. Let's update `TodoApp.vue` to have the `<form>` and `<input>` elements and make the test pass:

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>

<script>
export default {
  name: 'TodoApp',

  data() {
    return {
      newTodo: '',
      todos: [
        {
          id: 1,
          text: 'Learn Vue.js 3',
          completed: false
        }
      ]
    }
  },

  methods: {
    createTodo() {
      this.todos.push({
        id: 2,
        text: this.newTodo,
        completed: false
      })
    }
  }
}
</script>
```

We are using `v-model` to bind to the `<input>` and `@submit` to listen for the form submission. When the form is submitted, `createTodo` is called and inserts a new todo into the `todos` array.

While this looks good, running the test shows an error:

```
expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 1
    Received array:  [{"element": <div data-test="todo">Learn Vue.js 3</div>}]
```

The number of todos has not increased. The problem is that Jest executes tests in a synchronous manner, ending the test as soon as the final function is called. Vue, however, updates the DOM asynchronously. We need to mark the test `async`, and call `await` on any methods that might cause the DOM to change. `trigger` is one such methods, and so is `setValue` - we can simply prepend `await` and the test should work as expected:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('creates a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="new-todo"]').setValue('New todo')
  await wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

Now the test is finally passing!

## Completing a todo

Now that we can create todos, let's give the user the ability to mark a todo item as completed/uncompleted with a checkbox. As previously, let's start with the failing test:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('completes a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="todo-checkbox"]').setValue(true)

  expect(wrapper.get('[data-test="todo"]').classes()).toContain('completed')
})
```

This test is similar to the previous two; we find an element and interact with it in same way (we use `setValue` again, since we are interacting with a `<input>`).

Lastly, we make an assertion. We will be applying a `completed` class to completed todos - we can then use this to add some styling to visually indicate the status of a todo.

We can get this test to pass by updating the `<template>` to include the `<input type="checkbox">` and a class binding on the todo element:

```vue
<template>
  <div>
    <div
      v-for="todo in todos"
      :key="todo.id"
      data-test="todo"
      :class="[todo.completed ? 'completed' : '']"
    >
      {{ todo.text }}
      <input
        type="checkbox"
        v-model="todo.completed"
        data-test="todo-checkbox"
      />
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>
```

Congratulations! You wrote your first component tests.

## Arrange, Act, Assert

You may have noticed some new lines between the code in each of the tests. Let's look at the second test again, in detail:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('creates a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="new-todo"]').setValue('New todo')
  await wrapper.get('[data-test="form"]').trigger('submit')

  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2)
})
```

The test is split into three distinct stages, separated by new lines. The three stages represent the three phases of a test: **arrange**, **act** and **assert**.

In the _arrange_ phase, we are setting up the scenario for the test. A more complex example may require creating a Vuex store, or populating a database.

In the _act_ phase, we act out the scenario, simulating how a user would interact with the component or application.

In the _assert_ phase, we make assertions about how we expect the current state of the component to be.

Almost all test will follow these three phases. You don't need to separate them with new lines like this guide does, but it is good to keep these three phases in mind as you write your tests.

## Conclusion

- Use `mount()` to render a component.
- Use `get()` and `findAll()` to query the DOM.
- `trigger()` and `setValue()` are helpers to simulate user input.
- Updating the DOM is an async operation, so make sure to use `async` and `await`.
- Testing usually consists of 3 phases; act, arrange and assert.

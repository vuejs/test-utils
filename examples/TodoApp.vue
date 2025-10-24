<template>
  <div>
    <div
      v-for="todo in todos"
      :key="todo.id"
      data-test="todo"
      :class="{ completed: todo.completed }"
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

<script setup lang="ts">
import { ref } from 'vue'

interface TODO {
  id: number
  text: string
  completed: boolean
}

const newTodo = ref<string>('')
const todos = ref<TODO[]>([
  {
    id: 1,
    text: 'Learn Vue.js 3',
    completed: false
  }
])

const createTodo = () => {
  todos.value.push({
    id: 2,
    text: newTodo.value,
    completed: false
  })
}
</script>

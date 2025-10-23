<template>
<div>
  <div
    v-for="todo in todos"
    :key="todo.id"
    data-test="todo"
    :class="getClass(todo.completed)"
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

type TODO = {
  id: number;
  text: string;
  completed: boolean;
};

const newTodo = ref<string>('');
const todos = ref<TODO[]>([
  {
    id: 1,
    text: 'Learn Vue.js 3',
    completed: false
  }
]);

const createTodo = () =>{
  const listLength = todos.value.length;
  const lastItem = todos.value[listLength - 1];// get last todo item
  const todoExist = todos.value.find(res => res.text.toLowerCase() === newTodo.value.toLowerCase());//check is todo already exists

  if(newTodo.value && !todoExist) {
    const id = lastItem.id + 1;//increment the last item id by 1
    todos.value.push({
      id,
      text: newTodo.value,
      completed: false
    });
  }
};

const getClass = (completed: boolean) => [completed ? 'completed' : ''];
</script>

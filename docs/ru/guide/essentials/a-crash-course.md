# Ускоренный курс

Давайте уже начнем! Давайте изучим Vue Test Utils (VTU), создав простое Todo приложение и напишем тесты по ходу дела. Это руководство покажет, как:

- Добавлять компоненты
- Находить элементы
- Заполнять формы
- Вызвать события

## Приступая к изучению

Мы начнем с простого `TodoApp` компонента с единственной задачей:

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

## Первый тест - задача отрисована

Первый тест, который мы напишем будет проверка отрисовки задачи. Давайте посмотрим первый тест, далее обсудим каждую часть:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('renders a todo', () => {
  const wrapper = mount(TodoApp)

  const todo = wrapper.get('[data-test="todo"]')

  expect(todo.text()).toBe('Learn Vue.js 3')
})
```

Мы начнем с импортирования `mount` - это главный способ отрисовать компонент. Вы объявляете тест при помощи `test` функции, с коротким описанием теста. `test` и `expect` глобально доступны в большинстве программ тестирования (в этом примере используем [Jest](https://jestjs.io/en/)). Если `test` и `expect` выглядит непонятно, Jest документация имеет [больше простых примеров](https://jestjs.io/docs/en/getting-started) как использовать и работать с ними.

Далее мы вызываем `mount` и передаем компонент в качестве первого аргумента - это то, что вам придется делать почти в каждом тесте. По соглашению, мы присваиваем результат переменной с названием `wrapper`, поскольку `mount` предоставляет простой "wrapper" вокруг приложения с некоторыми удобными методами для тестирования.

Наконец, мы используем другой глобальный метод, общий для многих программ тестирования, в том числе и Jest, - `expect`. Идея в том, что мы утверждаем или _ожидаем_, что реальное значение будет таким, каким мы его себе представляем. В данном случае, мы ищем html-элемент с селектором `data-test="todo"` в DOM (Document Object Model), это будет выглядеть примерно так: `<div data-test="todo">...</div>`. После, мы вызываем `text` метод для получения содержимого, которое мы ожидаем: `'Learn Vue.js 3'`.

> Использование `data-test` селекторов не обязательно, но это может сделать твои тесты более гибкими. Классы и идентификаторы меняются по мере роста приложения, но при использовании `data-test` другими разработчиками будет более понятно, что эти элементы нужны для тестов и не должны изменяться.

## Делаем тест успешным

Если мы запустим этот тест, то он выполниться с такой ошибкой: `Unable to get [data-test="todo"]` (`Не удалось получить [data-test="todo"]`). Так как мы мы не отрисовываем никаких задач, то вызов `get()` возвращается с ошибкой и не возвращает "wrapper" (помните, что VTU оборачивает все компоненты и DOM элементы в "wrapper" с некоторыми удобными методами). Давайте обновим `<template>` в `TodoApp.vue` для отрисовки `todos` массива:

```vue
<template>
  <div>
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>
  </div>
</template>
```

С этим изменением, тест пройден. Поздравляю! Вы написали свой первый тест для компонента.

## Добавление новой задачи

Следующий сценарий, который мы добавим для пользователя, будет создание новой задачи. Чтобы так сделать, нам нужна форма с полями ввода для пользователя, чтобы ввести какой-то текст. Когда пользователь подтвердит отправку формы, мы ожидаем новую отрисованную задачу. Давай взглянем на этот тест:

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

Как обычно, мы начинаем с использования `mount` для отрисовки компонента. Мы также проверяем, что отрисована одна задача - это дает понять, что мы добавим далее еще одну, как видно из последней строки.

Чтобы обновить `<input>`, мы используем `setValue` - он позволяет нам установить значение поля.

После обновления `<input>` мы используем `trigger` метод для имитирования подтверждения формы пользователем. И,наконец, мы проверяем, что число отрисованных задач увеличилось с 1 до 2.

Если мы запустим этот тест, то очивидно будет ошибка. Давайте обновим `TodoApp.vue` для создания `<form>`, `<input>` элементов и пройти тест успешно:

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

Мы используем `v-model` для привязки к `<input>` и `@submit` для прослушивания события отправки формы. Когда форма отправлена, `createTodo` вызывается и вставляет новую задачу в `todos` массив.

Пока это выглядит хорошо, запускаем тести и видим ошибку:

```
expect(received).toHaveLength(expected)

    Expected length: 2
    Received length: 1
    Received array:  [{"element": <div data-test="todo">Learn Vue.js 3</div>}]
```

Количество задач не увеличилось. Проблема в том, что Jest выполняет тесты в синхронном порядке, заканчивая тест, так только последняя функция вызвана. Vue, однако, обновляет DOM асинхронно. Мы должны отметить тест `async`, и вызвать `await` на любом методе, который может привести к изменению DOM. `trigger` один из таких методов, как и `setValue` - мы можем просто добавить `await`, и наш тест будет работать как ожидается:

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

Сейчас тест наконец-то пройден!

## Завершить задачу

Теперь, когда мы можем добавлять задачи, давайте добавим возможность пользователю отметить задачу как выполненную/невыполненную при помощи checkbox. Как ранее, давайте начнем с теста, который не выполниться:

```js
import { mount } from '@vue/test-utils'
import TodoApp from './TodoApp.vue'

test('completes a todo', async () => {
  const wrapper = mount(TodoApp)

  await wrapper.get('[data-test="todo-checkbox"]').setValue(true)

  expect(wrapper.get('[data-test="todo"]').classes()).toContain('completed')
})
```

Этот тест похож на предыдущие два; мы находим элемент и взаимодействуем с ним тем же способом (мы используем `setValue` снова, поскольку взаимодействуем с `<input>`).

Наконец, мы создаем проверку. Мы добавляем `completed` класс к завершенным задачам - далее мы можем использовать его, чтобы добавить стили для визуального указания статуса задачи.

Мы можем завершить этот тест, обновив `<template>`, включив в него `<input type="checkbox">` и привязанный класс к элементу задачи:

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

Поздравляю! Ты написал свои первые тесты для компонентов.

## Подготовка, действие, проверка

Вы возможно удивлены некоторыми новыми строчками между кодом в каждом из тестов. Давайте взглянем на второй тест снова, в деталях:

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
Тест делиться на 3 разных этапа, разделенных пустой строкой. Три этапа представляют собой три фазы теста: **подготовка**, **действие** и **проверка**.

На этапе _подготовки_, мы устанавливаем сценарий для теста. Более сложные примеры могут потребовать создание Vuex хранилища или заполнить базы данных.

На этапе _действия_, мы выполняем сценарий, имитирующий как бы пользователь мог взаимодействовать с компонентом или приложением.

На этапе _проверки_, мы создаем проверку о том, какое должно быть текущее состояние компонента.

Почти все тесты попадают под эти три фазы. Вам не обязательно разделять их, как это сделано в руководстве, но хорошо, если вы будете держать эти три фазы у себя в голове, когда вы пишите ваши тесты.

## Заключение

- Используйте `mount()` для отображения компонента.
- Используйте `get()` и `findAll()` для получения DOM элементов.
- `trigger()` и `setValue()` - помощники для имитации пользовательского ввода.
- Изменение DOM это асинхронная операция, поэтому убедитесь, что используете `async` и `await`.
- Тестирование обычно состоит из трех фаз: подготовка, действие, проверка.

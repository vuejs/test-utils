# Выполнение HTTP запросов

Современные программы тестирования уже предоставляют множество замечательных возможностей, когда они тестируют HTTP запросы. Таким образом, Vue Test Utils не содержит какие-либо уникальные инструменты для такого тестирования.

Однако это важная функция для тестирования, и существуют несколько подводных камней, на которые мы хотим обратить внимание.

В этом разделе мы исследуем несколько подходов для выполнения, имитации и проверки HTTP запросов.

## Список записей в блоге

Давайте начнем с простого примера. Следующий `PostList` компонент отрисовывает список записей блога, полученных от внешнего API. Для получения этих постов компонент содержит `button` элемент, который вызывает запрос:

```vue
<template>
  <button @click="getPosts">Get posts</button>
  <ul>
    <li v-for="post in posts" :key="post.id" data-test="post">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      posts: null
    }
  },
  methods: {
    async getPosts() {
      this.posts = await axios.get('/api/posts')
    }
  }
}
</script>
```

Есть несколько вещей, которые мы должны сделать, чтобы протестировать этот компонент правильно.

Наша первая цель - это протестировать этот компонент **без фактического обращения к API**. Это создало бы хрупкий и потенциально медленный тест.

Во вторых, нам нужно удостовериться, что компонент выполнил верный вызов с соответствующими параметрами. Мы не будем получать результаты от этого API, нам все еще нужно убедиться, что мы запросили нужные данные.

Также нам нужно убедиться в том, что DOM обновился и отображает данные. Мы сделаем так, используя `flushPromises()` функцию из `@vue/test-utils`.

```js
import { mount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import PostList from './PostList.vue'

const mockPostList = [
  { id: 1, title: 'title1' },
  { id: 2, title: 'title2' }
]

// Следующие строки говорят Jest имитировать любой вызов к `axios.get`
// и вместо этого вернуть `mockPostList`
jest.spyOn(axios, 'get').mockResolvedValue(mockPostList)

test('loads posts on button click', async () => {
  const wrapper = mount(PostList)

  await wrapper.get('button').trigger('click')

  // Давайте убедимся, что мы вызвали axios.get правильное количество раз и 
  // с правильными параметрами.
  expect(axios.get).toHaveBeenCalledTimes(1)
  expect(axios.get).toHaveBeenCalledWith('/api/posts')

  // Ждем пока DOM обновится.
  await flushPromises()

  // И наконец, мы должны убедиться, что мы отрисовали содержимое от API.
  const posts = wrapper.findAll('[data-test="post"]')

  expect(posts).toHaveLength(2)
  expect(posts[0].text()).toContain('title1')
  expect(posts[1].text()).toContain('title2')
})
```

Обратите внимание, что мы добавили префикс `mock` к переменной `mockPostList`. В противном случае мы получим ошибку: "The module factory of jest.mock() is not allowed to reference any out-of-scope variables.". Это специфика Jest, и вы можете прочитать про такое поведение более подробно [в их документации](https://jestjs.io/docs/es6-class-mocks#calling-jestmock-with-the-module-factory-parameter).

Также обратите внимание, как мы ожидали `flushPromises` и после взаимодействовали с компонентом. Мы делаем так, чтобы убедиться в том, что DOM обновился до того, как тест продолжится.

:::tip Альтернативы jest.mock()
Есть несколько путей настройки имитации в Jest. Тот, который используется в примере выше, является самым простым. Для более мощных альтернатив вам может понадобиться [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter) или [msw](https://github.com/mswjs/msw), среди прочих.
:::

### Проверка состояния загрузки

Теперь этот `PostList` компонент довольно полезный, но ему недостает некоторых других замечательных возможностей. Давайте расширим его, чтобы компонент отобразил сообщение, пока идет загрузка ваших постов!

А также давайте отключим `<button>` элемент во время загрузки. Мы не хотим, чтобы пользователи продолжали отправлять запросы во время получения ответа!

```vue {2,4,19,24,28}
<template>
  <button :disabled="loading" @click="getPosts">Get posts</button>

  <p v-if="loading" role="alert">Loading your posts…</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id" data-test="post">
      {{ post.title }}
    </li>
  </ul>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      posts: null,
      loading: null
    }
  },
  methods: {
    async getPosts() {
      this.loading = true

      this.posts = await axios.get('/api/posts')

      this.loading = null
    }
  }
}
</script>
```

Давайте напишем тест для проверки того, что все элементы, связанные с загрузкой, отрисовываются вовремя.

```js
test('displays loading state on button click', async () => {
  const wrapper = mount(PostList)

  // Обратите внимание, что мы запускаем следующие проверки до того, 
  // как нажали на кнопку.
  // Здесь компонент должен быть не в состоянии загрузки.
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('button').attributes()).not.toHaveProperty('disabled')

  // Теперь давайте вызовем нажатие как обычно.
  await wrapper.get('button').trigger('click')

  // Мы проверяем состояние загрузки до того, как сбросили все промисы.
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  expect(wrapper.get('button').attributes()).toHaveProperty('disabled')

  // Как мы делали раньше, ждем, пока DOM не обновится.
  await flushPromises()

  // После этого мы возвращаемся в состояния без загрузки.
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('button').attributes()).not.toHaveProperty('disabled')
})
```

## HTTP запросы от Vuex

Типичный сценарий для более сложных приложений - это вызвать Vuex действие, которое выполнит HTTP запрос.

Это не отличается от примера, описанного выше. Вы можете хотеть загрузить хранилище как есть и имитировать сервисы, такие как `axios`. В данном случае мы имитируем наши границы системы, тем самым достигая более высокого уровня достоверности в наших тестах.

Вы можете ознакомиться с [Тестирование Vuex](/ru/guide/advanced/vuex.md) разделом для большей информации о тестировании Vuex с помощью Vue Test Utils.

## Заключение

- Vue Test Utils не требует специальных инструментов для тестирования HTTP запросов. Единственное, что нужно учитывать, это то, что мы тестируем асинхронное поведение.
- Тесты не должны зависеть от внешних сервисов. Используйте инструменты имитации, такие как `jest.mock`, чтобы избежать этого.
- `flushPromises()` - это полезный инструмент, чтобы убедиться в том, что DOM обновляется после асинхронной операции.
- Непосредственный вызов HTTP запросов при помощи взаимодействия с компонентом делает ваш тест более устойчивым.

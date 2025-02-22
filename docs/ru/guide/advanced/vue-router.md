# Тестирование Vue Router

В этой статье будут представлены два пути для тестирования приложения, использующего Vue Router:

1. Используя настоящий Vue Router, который максимально приближен к реальности, но также может добавить сложности при тестировании больших приложений.
2. Использование имитированного роутера позволяет более точно управлять средой тестирования.

Обратите внимание, что Vue Test Utils не предоставляет какие-либо специальные функции для помощи в тестировании компонентов, которые полагаются на Vue Router.

## Использование имитированного роутера

Вы можете использовать имитированный роутер, чтобы не заботиться о деталях реализации Vue Router в ваших юнит тестах.

Вместо использования настоящего Vue Router экземпляра, мы можем создать имитированную версию, которая будет реализовывать только те возможности, которые нам нужны. Мы можем сделать это, используя комбинацию `jest.mock` (если вы используете Jest) и `global.components`.

Когда мы имитируем зависимости, обычно так происходит, потому что **мы не заинтересованы в тестировании их поведения**. Мы не хотим тестировать нажатие на `<router-link>`, который отправляет на нужную страницу, конечно, это произойдет. Однако, мы можем быть заинтересованными в том, чтобы убедиться, что `<a>` имеет верный `to` атрибут.

Давайте посмотрим на более реалистичный пример! Этот компонент показывает кнопку, которая перенаправит авторизованного пользователя на страницу редактирования поста (основанного на текущих параметрах роута). Неавторизованный пользователь должен быть перенаправлен на `/404` роут.

```js
const Component = {
  template: `<button @click="redirect">Click to Edit</button>`,
  props: ['isAuthenticated'],
  methods: {
    redirect() {
      if (this.isAuthenticated) {
        this.$router.push(`/posts/${this.$route.params.id}/edit`)
      } else {
        this.$router.push('/404')
      }
    }
  }
}
```

Мы могли бы использовать настоящий роутер, после отправить на правильный роут для этого компонента, далее после нажатия на кнопку проверить, что нужная страница была отрисована... однако, это большое количество настроек для относительно простого теста. По своей сути тест, который мы хотим написать, должен быть "если авторизован, перенаправить на X, иначе перенаправить на Y". Давайте посмотрим, как мы могли бы достичь этого при помощи имитации роутера, используя `global.mocks` свойство:

```js
import { mount } from '@vue/test-utils';

test('allows authenticated user to edit a post', async () => {
  const mockRoute = {
    params: {
      id: 1
    }
  }
  const mockRouter = {
    push: jest.fn()
  }

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      mocks: {
        $route: mockRoute,
        $router: mockRouter
      }
    }
  })

  await wrapper.find('button').trigger('click')

  expect(mockRouter.push).toHaveBeenCalledTimes(1)
  expect(mockRouter.push).toHaveBeenCalledWith('/posts/1/edit')
})

test('redirect an unauthenticated user to 404', async () => {
  const mockRoute = {
    params: {
      id: 1
    }
  }
  const mockRouter = {
    push: jest.fn()
  }

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: false
    },
    global: {
      mocks: {
        $route: mockRoute,
        $router: mockRouter
      }
    }
  })

  await wrapper.find('button').trigger('click')

  expect(mockRouter.push).toHaveBeenCalledTimes(1)
  expect(mockRouter.push).toHaveBeenCalledWith('/404')
})
```

Мы использовали `global.mocks`, чтобы предоставить необходимые зависимости (`this.$route` и `this.$router`) для установки нужного состояния для каждого теста.

Затем мы смогли использовать `jest.fn()` для отслеживания, сколько раз и с какими аргументами вызывался `this.$router.push`. Самое приятное, нам не нужно было иметь дело с сложностью и особенностями Vue Router в наших тестах! Мы занимались только тестированием логики приложения.

:::tip
Вы можете захотеть протестировать всю систему в подходе end-to-end. Вы можете рассмотреть, фреймворк такой как [Cypress](https://www.cypress.io/) для полных системных тестов, использующих реальный браузер.
:::

## Использование настоящего роутера

Сейчас мы увидели, как использовать имитированный роутер, давайте посмотрим на использование настоящего Vue Router.

Давайте создадим простое приложение для постов, который использует Vue Router. Посты перечислены на `/posts` роуте:

```js
const App = {
  template: `
    <router-link to="/posts">Go to posts</router-link>
    <router-view />
  `
}

const Posts = {
  template: `
    <h1>Posts</h1>
    <ul>
      <li v-for="post in posts" :key="post.id">
        {{ post.name }}
      </li>
    </ul>
  `,
  data() {
    return {
      posts: [{ id: 1, name: 'Testing Vue Router' }]
    }
  }
}
```

Корень приложения отображает `<router-link>`, ведущий на `/posts`, где мы перечисляем посты.

Настоящий роутер выглядит примерно так. Обратите внимание, что мы экспортируем роуты отдельно от роутера, чтобы позднее мы могли добавить новый роутер для каждого теста.

```js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: {
      template: 'Welcome to the blogging app'
    }
  },
  {
    path: '/posts',
    component: Posts
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

export { routes };

export default router;
```

Лучший способ проиллюстрировать, как протестировать приложение, используя Vue Router, - это позволить предупреждениям направить нас. Следующего минимального теста достаточно, чтобы заставить нас идти дальше:

```js
import { mount } from '@vue/test-utils'

test('routing', () => {
  const wrapper = mount(App)
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

Тест провален. Он также печатает два предупреждения:

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-link

console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-view
```

`<router-link>` и `<router-view>` компоненты не найдены. Нам нужно установить Vue Router! Поскольку Vue Router - это плагин, мы установим его, используя `global.plugins` опцию монтирования:

```js {12,13,14}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "@/router" // Этот импорт должен ссылаться на ваш файл роутов, описанных выше

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

test('routing', () => {
  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

Те два предупреждения теперь исчезли, но теперь мы имеет другие предупреждения:

```js
console.warn node_modules/vue-router/dist/vue-router.cjs.js:225
  [Vue Router warn]: Unexpected error when starting the router: TypeError: Cannot read property '_history' of null
```

Хотя не совсем понятны предупреждения, это как-то связано с тем фактом, что **Vue Router 4 работает с роутами асинхронно**.

Vue Router предоставляет `isReady` функцию, которая говорит нам, когда роутер готов. Затем мы можем использовать `await`, чтобы убедиться в том, что начальная навигация произошла.

```js {13,14}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "@/router"

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

test('routing', async () => {
  router.push('/')

  // После этой строчки роутер готов
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

Тест пройден! Это потребовало немало усилий, но теперь мы убедились, что приложение правильно переходит с первоначальному роуту.

Давайте перейдем в `/posts` и убедимся, что маршрутизация работает, как ожидается:

```js {21,22}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "@/router"

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

test('routing', async () => {
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')

  await wrapper.find('a').trigger('click')
  expect(wrapper.html()).toContain('Testing Vue Router')
})
```

Снова, еще одна загадочная ошибка:

```js
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Unhandled error during execution of native event handler
    at <RouterLink to="/posts" >

console.error node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:211
  TypeError: Cannot read property '_history' of null
```

Снова благодаря асинхронному поведению в Vue Router 4 нам нужно подождать завершение маршрутизации до продолжения теста.

В данном случае, однако, нет _hasNavigated_ хука, который мы могли бы ожидать. Одна из альтернатив - это использование `flushPromises` функции, предоставляемая Vue Test Utils:

```js {1,22}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "@/router"

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

test('routing', async () => {
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')

  await wrapper.find('a').trigger('click')
  await flushPromises()
  expect(wrapper.html()).toContain('Testing Vue Router')
})
```

Тест _наконец-то_ проходит. Великолепно! Однако все это делается вручную для крошечного небольшого приложения. Вот в чем причина использования имитированного роутера - это распространенный подход при тестировании Vue компонентов, используя Vue Test Utils. В этом случае, если ты предпочитаешь использовать настоящий роутер, держите в уме, что каждый тест должен использовать свой собственный экземпляр роутера следующим образом:

```js {1,19}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "@/router"

let router;
beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  })
});

test('routing', async () => {
  router.push('/')
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')

  await wrapper.find('a').trigger('click')
  await flushPromises()
  expect(wrapper.html()).toContain('Testing Vue Router')
})
```

## Использование имитированного роутера с Composition API

Vue router 4 позволяет работать с роутером и роутами внутри `setup` функции вместе с composition API.

Рассмотрим тот же демо компонент, переписанный, используя composition API.

```js
import { useRouter, useRoute } from 'vue-router'

const Component = {
  template: `<button @click="redirect">Click to Edit</button>`,
  props: ['isAuthenticated'],
  setup (props) {
    const router = useRouter()
    const route = useRoute()

    const redirect = () => {
      if (props.isAuthenticated) {
        router.push(`/posts/${route.params.id}/edit`)
      } else {
        router.push('/404')
      }
    }

    return {
      redirect
    }
  }
}
```

В этот раз для того, чтобы протестировать компонент, мы будем использовать jest функцию для имитирования импортированных ресурсов (`vue-router`) и имитировать роутер и роуты напрямую.

```js
import { useRouter, useRoute } from 'vue-router'

jest.mock('vue-router', () => ({
  useRoute: jest.fn(),
  useRouter: jest.fn(() => ({
    push: () => {}
  }))
}))

test('allows authenticated user to edit a post', () => {
  useRoute.mockImplementationOnce(() => ({
    params: {
      id: 1
    }
  }))

  const push = jest.fn()
  useRouter.mockImplementationOnce(() => ({
    push
  }))

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      stubs: ["router-link", "router-view"], // Заглушки для router-link и router-view в случае, если они будут отрисованы в вашем шаблоне
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/posts/1/edit')
})

test('redirect an unauthenticated user to 404', () => {
  useRoute.mockImplementationOnce(() => ({
    params: {
      id: 1
    }
  }))

  const push = jest.fn()
  useRouter.mockImplementationOnce(() => ({
    push
  }))

  const wrapper = mount(Component, {
    props: {
      isAuthenticated: false
    }
    global: {
      stubs: ["router-link", "router-view"], // Заглушки для router-link и router-view в случае, если они будут отрисованы в вашем шаблоне
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/404')
})
```

## Использование настоящего роутера с Composition API

Использование настоящего роутера с Composition API работает точно так же, как настоящий роутер с Options API. Держите в голове, что, также как в случае с Options API, 
считается хорошей практикой создавать новый экземпляр объекта роутера для каждого теста вместо импортирования роутера напрямую из вашего приложения.

```js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from "@/router"

let router;

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes,
  })

  router.push('/')
  await router.isReady()
});

test('allows authenticated user to edit a post', async () => {
  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      plugins: [router],
    }
  })

  const push = jest.spyOn(router, 'push')
  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/posts/1/edit')
})
```

Для тех, кто предпочитает автоматический подход, библиотека [vue-router-mock](https://github.com/posva/vue-router-mock), созданная Posva, также доступна как альтернатива.

## Заключение

- Вы можете использовать настоящий экземпляр роутера в ваших тестах.
- Хотя есть некоторые особенности: Vue Router 4 является асинхронным, и нам нужно принять это во внимание при написании тестов.
- Для более сложных приложений рассмотрите имитацию зависимостей роутера и сфокусируйтесь на тестировании внутренней логики.
- Используйте возможность имитации и заглушки вашей программы тестирования, где это возможно.
- Используйте `global.mocks` для имитации глобальных зависимостей, таких как `this.$route` и `this.$router`.

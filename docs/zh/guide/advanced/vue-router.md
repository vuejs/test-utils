# 测试 Vue Router

本文将介绍两种测试带有 Vue Router 的应用的方法：

1. 使用真实的 Vue Router，这种方法更接近生产环境，但测试较大应用时会引入复杂度。
2. 使用模拟的路由器，允许对测试环境进行更细粒度的控制。

请注意，Vue Test Utils 并未提供任何特殊函数来辅助测试依赖于 Vue Router 的组件。

## 使用模拟路由器

使用模拟路由器可以避免在单元测试中关注 Vue Router 的实现细节。

我们可以创建一个模拟的 Vue Router 实例，仅实现我们感兴趣的功能，而不是使用真实的实例。这可以通过 `jest.mock` (如果你使用 Jest) 和 `global.components` 的组合来实现。

在我们模拟一个依赖时，通常是因为**我们不测试它的行为**。我们不想测试点击 `<router-link>` 是否会导航到正确的页面，它显然是会的。我们可能更关心的是确保 `<a>` 拥有正确的 `to` 属性。

让我们来看一个更实际的例子！这个组件展示了一个按钮，当用户通过身份验证时，会将其重定向到编辑帖子的页面 (基于当前路由参数)。未经过身份验证的用户则会被重定向到 `/404` 路由。

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

我们可以使用真实的路由器，然后导航到该组件的正确路由，然后点击按钮后断言正确的页面被渲染……然而，对于相对简单的测试来说，这需要很多设置。我们想要编写的测试核心是 “如果经过身份验证，则重定向到 X，否则重定向到 Y”。下面是如何使用 `global.mocks` 属性模拟路由的示例：

```js
import { mount } from '@vue/test-utils'

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

我们使用 `global.mocks` 提供了必要的依赖 (`this.$route` 和 `this.$router`)，为每个测试设置了理想的状态。

然后，我们能够使用 `jest.fn()` 监控 `this.$router.push` 被调用的次数和参数。最重要的是，我们不必在测试中处理 Vue Router 的复杂性或注意事项！我们只关注测试应用逻辑。

:::tip
你可能想以端到端 (end-to-end) 的方式测试整个系统。可以考虑使用 [Cypress](https://www.cypress.io/) 通过真实浏览器进行完整的系统测试。
:::

## 使用真实路由器

我们已经看到了如何使用模拟路由器，现在让我们看看如何使用真实的 Vue Router。

我们来创建一个基本的使用 Vue Router 的博客应用程序。帖子会在 `/posts` 路由上列出：

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

应用程序根页面会显示一个 `<router-link>` 指向列出帖子的路由 `/posts`。

真实路由器如下所示。请注意，我们将路由单独导出，以便可以为每个单独的测试实例化一个新的路由器。

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
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export { routes }

export default router
```

使用 Vue Router 测试一个应用的最佳展示方法是通过警告引导我们。以下最小化的测试足以让我们起步：

```js
import { mount } from '@vue/test-utils'

test('routing', () => {
  const wrapper = mount(App)
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

这个测试失败了，且它还打印了两个警告：

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-link

console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-view
```

`<router-link>` 和 `<router-view>` 组件未找到。我们需要安装 Vue Router！由于 Vue Router 是一个插件，我们通过 `global.plugins` 挂载选项来安装它：

```js {12,13,14}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router' // 此导入应指向你上面声明的路由文件

const router = createRouter({
  history: createWebHistory(),
  routes: routes
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

这两个警告现在消失了，但现在我们又有了另一个警告：

```js
console.warn node_modules/vue-router/dist/vue-router.cjs.js:225
  [Vue Router warn]: Unexpected error when starting the router: TypeError: Cannot read property '_history' of null
```

虽然警告的内容并不完全明确，但它与 **Vue Router 4 异步处理路由**的事实有关。

Vue Router 提供了一个 `isReady` 函数，告诉我们路由器何时准备就绪。然后我们可以 `await` 它，以确保初始导航已生效。

```js {13,14}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

test('routing', async () => {
  router.push('/')

  // 这行之后，路由已准备就绪
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

测试现在通过了！这确实需要一些工作，但现在我们确保了应用程序正确导航到初始路由。

现在让我们导航到 `/posts` 并确保路由如预期工作：

```js {21,22}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
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

又一个有些隐晦的错误：

```js
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Unhandled error during execution of native event handler
    at <RouterLink to="/posts" >

console.error node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:211
  TypeError: Cannot read property '_history' of null
```

同样，由于 Vue Router 4 新的异步特性，我们需要在进行任何断言之前 `await` 路由完成。

然而，在这种情况下，我们没有可以 await 的 *hasNavigated* 钩子。一种替代方法是使用从 Vue Test Utils 导出的 `flushPromises` 函数：

```js {1,22}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createWebHistory(),
  routes: routes
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

它*终于*通过了。太好了！然而，这一切都非常手动，而且这是针对一个微小且无关紧要的应用程序。这就是在为什么使用 Vue Test Utils 测试 Vue 组件时，使用模拟路由器是一种常见方法。如果你倾向于继续使用真实的路由器，请记住每个测试都应该使用自己实例化的路由器，如下所示：

```js {1,19}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

let router
beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes
  })
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

## 在模拟路由器中使用组合式 API

Vue Router 4 允许在组合式 API 的 `setup` 函数中使用路由器和路由。

设想通过组合式 API 重写一个相同的 demo 组件。

```js
import { useRouter, useRoute } from 'vue-router'

const Component = {
  template: `<button @click="redirect">Click to Edit</button>`,
  props: ['isAuthenticated'],
  setup(props) {
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

这次为了测试该组件，我们将使用 Jest 模拟导入的资源 `vue-router`，并直接模拟路由器和路由。

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
      stubs: ["router-link", "router-view"], // 为可能在模板中渲染的 router-link 和 router-view 提供测试替身
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
      stubs: ["router-link", "router-view"], // 为可能在模板中渲染的 router-link 和 router-view 提供测试替身
    }
  })

  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/404')
})
```

## 在真实路由器中使用组合式 API

使用真实路由器与组合式 API 的方式与使用选项式 API 时相同。请记住，和选项式 API 一样，我们建议为每个测试实例化一个新的路由器对象，而不是直接从应用程序中导入路由器。

```js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

let router

beforeEach(async () => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes
  })

  router.push('/')
  await router.isReady()
})

test('allows authenticated user to edit a post', async () => {
  const wrapper = mount(Component, {
    props: {
      isAuthenticated: true
    },
    global: {
      plugins: [router]
    }
  })

  const push = jest.spyOn(router, 'push')
  await wrapper.find('button').trigger('click')

  expect(push).toHaveBeenCalledTimes(1)
  expect(push).toHaveBeenCalledWith('/posts/1/edit')
})
```

对于那些喜欢非手动方法的人，Posva 创建的库 [vue-router-mock](https://github.com/posva/vue-router-mock) 也可以作为替代方案。

## 结论

- 你可以在测试中使用真实的路由器实例。
- 但是有一些注意事项：Vue Router 4 是异步的，我们需要在编写测试时考虑这一点。
- 对于更复杂的应用程序，请考虑模拟路由器的依赖项，且专注于测试底层逻辑。
- 尽可能利用测试运行器的测试替身来模拟功能。
- 使用 `global.mocks` 来模拟全局依赖项，例如 `this.$route` 和 `this.$router`。

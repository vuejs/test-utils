# Testing Vue Router

This article will present two ways to test an application using Vue Router:

1. Using the real Vue Router, which is more production like but also may lead to complexity when testing larger applications
2. Using a mocked router, allowing for more fine grained control of the testing environment.

Notice that Vue Test Utils does not provide any special functions to assist with testing components that rely on Vue Router.

## Using a Mocked Router

You can use a mocked router to avoid caring about the implementation details of Vue Router in your unit tests.

Instead of using a real Vue Router instance, we can create a mock version which only implements the features we are interested in. We can do this using a combination of `jest.mock` (if you are using Jest), and `global.components`.

When we mock out a dependency, it's usually because **we are not interested in testing its behavior**. We don't want to test clicking `<router-link>` navigates to the correct page - of course it does! We might be interested in ensuring that the `<a>` has the correct `to` attribute, though.

Let's see a more realistic example! This component shows a button that will redirect an authenticated user to the edit post page (based on the current route parameters). An unauthenticated user should be redirected to a `/404` route.

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

We could use a real router, then navigate to the correct route for this component, then after clicking the button assert that the correct page is rendered... however, this is a lot of setup for a relatively simple test. At it's core, the test we want to write is "if authenticated, redirect to X, otherwise redirect to Y". Let's see how we might accomplish this by mocking the routing using the `global.mocks` property:

```js
test('allows authenticated user to edit a post', () => {
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

test('redirect an unauthenticated user to 404', () => {
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

We used `global.mocks` to provide the necessary dependencies (`this.$route` and `this.$router`) to set an ideal state for each test.

We were then able to use `jest.fn()` to monitor how many times, and with which arguments, `this.$router.push` was called with. Best of all, we don't have to deal with the complexity or caveats of Vue Router in our test! We were only concerned with testing the app logic.

:::tip
You might want to test the entire system in an end-to-end manner. You could consider a framework like [Cypress](https://www.cypress.io/) for full system tests using a real browser.
:::

## Using a Real Router

Now we have seen how to use a mocked router, let's take a look at using the real Vue Router.

Let's create a basic blogging application that uses Vue Router. The posts are listed on the `/posts` route:

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
      <li v-for="posts in posts" :key="post.id">
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

The root of the app displays a `<router-link>` leading to `/posts`, where we list the posts.

The real router looks like this:

```js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
})
```

The best way to illustrate how to test an app using Vue Router is to let the warnings guide us. The following minimal test is enough to get us going:

```js
import { mount } from '@vue/test-utils'

test('routing', () => {
  const wrapper = mount(App)
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

The test fails. It also prints two warnings:

```bash
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-link

console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-view
```

The `<router-link>` and `<router-view>` component are not found. We need to install Vue Router! Since Vue Router is a plugin, we install it using the `global.plugins` mounting option:

```js {10,11,12}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // omitted for brevity
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

Those two warnings are now gone - but now we have another warning:

```js
console.warn node_modules/vue-router/dist/vue-router.cjs.js:225
  [Vue Router warn]: Unexpected error when starting the router: TypeError: Cannot read property '_history' of null
```

Although it's not entirely clear from the warning, it's related to the fact that **Vue Router 4 handles routing asynchronously**.

Vue Router provides an `isReady` function that tell us when router is ready. We can then `await` it to ensure the initial navigation has happened.

```js {11,12}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // omitted for brevity
})

test('routing', async () => {
  router.push('/')

  // After this line, router is ready
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

The test is now passing! It was quite a bit of work, but now we make sure the application is properly navigating to the initial route.

Now let's navigate to `/posts` and make sure the routing is working as expected:

```js {19,20}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // omitted for brevity
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

Again, another somewhat cryptic error:

```js
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Unhandled error during execution of native event handler
    at <RouterLink to="/posts" >

console.error node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:211
  TypeError: Cannot read property '_history' of null
```

Again, due to Vue Router 4's new asynchronous nature, we need to `await` the routing to complete before making any assertions.

In this case, however, there is no _hasNavigated_ hook we can await on. One alternative is to use the `flushPromises` function exported from Vue Test Utils:

```js {1,20}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // omitted for brevity
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

It _finally_ passes. Great! This is all very manual, however - and this is for a tiny, trivial app. This is the reason using a mocked router is a common approach when testing Vue components using Vue Test Utils.

## Conclusion

- You can use a real router instance in your tests.
- There are some caveats, though: Vue Router 4 is asynchronous, and we need to take it into account when writing tests.
- For more complex applications, consider mocking the router dependency and focus on testing the underlying logic.
- Make use of your test runner's stubbing/mocking functionality where possible.
- Use `global.mocks` to mock global dependencies, such as `this.$route` and `this.$router`.

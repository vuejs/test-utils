## Testing with Vue Router

Vue Test Utils does not provide any special functions to assist with testing components that rely on Vue Router. This article will present two ways to test an application using Vue Router - using the real Vue Router, which is more production like but also may lead to complexity when testing larger applications, and by using a mocked router, allowing for more fine grained control of the testing environment.

Let's look at how you can test with a mocked router, since that is generally the simplest way to test components depending on Vue Router. Then we will take a look at what is involved if you'd like to use are real router.

## Using a Mocked Router

You can use a mocked router to avoid caring about the implementation details of Vue Router in your unit tests. Instead of using a real Vue Router instance, We can create our own minimal mock version which only implements the features we are interested in. We can do this using a combination of `jest.mock` (if you are using Jest), and `global.components`.

When we mock out a dependency, it's usually because we are not interested in testing that dependencies behavior. In this case, we do not want to test clicking `<router-link>` (which is really just an `<a>` tag) navigates to the correct page - of course it does! In this example, we might be interested in ensuring that the `<a>` has the correct `to` attribute, though. This may seem trivial, but in a larger application with much more complex routing, it can be worth ensuring links are correct (especially if they are highly dynamic).

To illustrate this, let's see a different example, where mocking the router becomes much more attractive.

```js
const Component = {
  template: `
    <button @click="redirect">Click to Edit</button>
  `,
  props: ['authenticated'],
  methods: {
    redirect() {
      if (this.authenticated) {
        this.$router.push(`/posts/${this.$route.params.id}/edit`)
      } else {
        this.$router.push('/404')
      }
    }
  }
}
```

This component shows a button that will redirect an authenticated user to the edit post page (based on the current route parameters). An unauthenticated user should be redirected to a `/404` route. We could use a real router, then navigate to the correct route for this component, then after clicking the button assert that the correct page is rendered... however, this is a lot of setup for a relatively simple test. At it's core, the test we want to write is "if authenticated, redirect to X, otherwise redirect to Y". Let's see how we might accomplish this by mocking the routing using the `global.mocks` property:

```js
describe('component handles routing correctly', () => {
  it('allows authenticated user to edit a post', () => {
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
        authenticated: true
      },
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/posts/1/edit')
  })

  it('redirect an unauthenticated user to 404', () => {
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
        authenticated: false
      },
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/404')
  })
})
```

By combining `global.mocks` to provide the necessary dependencies (`this.$route` and `this.$router`) we were able to set the test environment in an ideal state for this particular test. We were then able to use `jest.fn()` to monitor how many times, and with which arguments, `this.$router.push` was called with. Best of all, we don't have to deal with the complexity or caveats of Vue Router in our test, when really what we are concerned with testing is the logic behind the routing, not the routing itself.

Of course, you still need to test the entire system in an end-to-end manner with a real router at some point. You could consider a framework like [Cypress](https://www.cypress.io/) for full system tests using a real browser.

## With a Real Router

Now we have seen how to use a mocked router, let's take a look at what is involved when using the real Vue Router. We will look at a test for a blogging application that uses Vue Router. The posts are listed on the `/posts` route. The components are as follows:

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

The root of the app displays a `<router-link>` leading to `/posts`, where we list the posts in an unordered list.

The router looks like this:

```js
import { mount } from '@vue/test-utils'
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
import { createRouter, createWebHistory } from 'vue-router'

test('routing', () => {
  const wrapper = mount(App)
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

The test fails. It also prints two warnings:

```sh
console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-link
    at <Anonymous ref="VTU_COMPONENT" >
    at <VTUROOT>

console.warn node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:39
  [Vue warn]: Failed to resolve component: router-view
    at <Anonymous ref="VTU_COMPONENT" >
    at <VTUROOT>
```

The `<router-link>` and `<router-view>` component are not found. We need to install Vue Router! Since Vue Router is a plugin, we install it using the `global.plugins` mounting option:

```js {6,7,8}
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

Although it's not entirely clear from the warning, it's related to the fact that Vue Router 4 handles routing asynchronously, and before anything is rendered, the router must be in a "ready" state. For this reason Vue Router provides an `isReady` function, which we can `await` to ensure the router is ready and the initial navigation has finished before rendering anything.

In web mode (which we are using, since we passed the `history: createWebHistory()` option when creating the router), the router will use the initial location to trigger an initial navigation automatically. For this reason, why we need to `await router.isReady()` - to ensure the initial navigation has completed before the test continues.

```js {5,6}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

test('routing', () => {
  router.push('/')
  await router.isReady()
  const wrapper = mount(App, {
    global: {
      plugins: [router]
    }
  })
  expect(wrapper.html()).toContain('Welcome to the blogging app')
})
```

The test is now passing! It was quite a bit of work - this is one of the reasons it might make more sense to use a mocked router for your tests.

Now the initial setup has been handled, let's navigate to `/posts` and make an assertion to ensure the routing is working as expected:

```js {14,15}
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

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
    at <Anonymous ref="VTU_COMPONENT" >
    at <VTUROOT>

console.error node_modules/@vue/runtime-core/dist/runtime-core.cjs.js:211
  TypeError: Cannot read property '_history' of null
```

Again, due to Vue Router 4's new asynchronous nature, we need to `await` the routing to complete before making any assertions. In this case, however, there is not `router.hasNavigated` hook we can await on. One alternative is to use the `flushPromises` function exported from Vue Test Utils:

```js {2,15}
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

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

- Vue Router 4 is asynchronous. This must be considered when testing in a jsdom environment.
- You can use Vue Router in your tests. There are some caveats, but there is no technical reason why you cannot use a real router.
- For more complex applications, consider mocking the router dependency and focus on testing the underlying logic.
- Make use of your test runner's stubbing/mocking functionality where possible.
- Use `global.mocks` to mock global dependencies, such as `this.$route` and `this.$router`.

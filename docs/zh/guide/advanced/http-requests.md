# 发起 HTTP 请求

现代测试运行器在测试 HTTP 请求方面已经提供了许多优秀的功能。因此，Vue Test Utils 并没有提供任何独特的工具来处理这一点。

然而，测试 HTTP 请求是一个重要的功能，我们希望强调一些注意事项。

在本节中，我们将探讨一些模式，以执行、模拟和断言 HTTP 请求。

## 博客文章列表

让我们从一个基本的用例开始。以下的 `PostList` 组件渲染了从外部 API 获取的博客文章列表。为了获取这些文章，组件包含一个触发请求的 `button` 元素：

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

为了正确测试这个组件，我们需要做几件事。

我们的第一个目标是测试这个组件**而不实际访问 API**。这样会导致测试变得不稳定且可能执行缓慢。

其次，我们需要断言组件是否以正确的参数进行了正确的调用。虽然我们不会从 API 获取结果，但仍需确保请求了正确的资源。

此外，我们还需要确保 DOM 已相应更新并显示数据。我们可以使用 `@vue/test-utils` 中的 `flushPromises()` 函数来实现。

```js
import { mount, flushPromises } from '@vue/test-utils'
import axios from 'axios'
import PostList from './PostList.vue'

const mockPostList = [
  { id: 1, title: 'title1' },
  { id: 2, title: 'title2' }
]

// 以下行代码告诉 Jest 模拟任何对 `axios.get` 的调用并返回 `mockPostList`
jest.spyOn(axios, 'get').mockResolvedValue(mockPostList)

test('loads posts on button click', async () => {
  const wrapper = mount(PostList)

  await wrapper.get('button').trigger('click')

  // 断言我们已正确调用 axios.get 的次数和参数。
  expect(axios.get).toHaveBeenCalledTimes(1)
  expect(axios.get).toHaveBeenCalledWith('/api/posts')

  // 等待 DOM 更新。
  await flushPromises()

  // 最后，确保我们已渲染 API 的内容。
  const posts = wrapper.findAll('[data-test="post"]')

  expect(posts).toHaveLength(2)
  expect(posts[0].text()).toContain('title1')
  expect(posts[1].text()).toContain('title2')
})
```

请注意，我们在变量 `mockPostList` 前添加了前缀 `mock`。如果不这样做，我们将收到错误：“The module factory of jest.mock() is not allowed to reference any out-of-scope variables。” 这是 Jest 特有的，你可以在他们的[文档](https://jestjs.io/docs/es6-class-mocks#calling-jestmock-with-the-module-factory-parameter)中了解更多关于这种行为的信息。

还要注意，我们在与组件交互之前等待了 `flushPromises`。这样可以确保在运行断言之前，DOM 已更新。

:::tip jest.mock() 的替代方案
在 Jest 中设置模拟有多种方法。上面示例中使用的方式是最简单的。对于更强大的替代方案，你可能想查看 [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter) 或 [msw](https://github.com/mswjs/msw) 等。
:::

### 断言加载状态

现在，这个 `PostList` 组件非常实用，但缺少一些其他很棒的功能。让我们扩展它，使其在加载文章时显示一个漂亮的消息！

同时，让我们在加载时禁用 `<button>` 元素。我们不希望用户在获取数据时继续发送请求！

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

让我们编写一个测试，以断言所有与加载相关的元素都能及时渲染。

```js
test('displays loading state on button click', async () => {
  const wrapper = mount(PostList)

  // 注意，我们在点击按钮之前运行以下断言
  // 此时组件应该处于“未加载”状态。
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('button').attributes()).not.toHaveProperty('disabled')

  // 现在像往常一样触发它。
  await wrapper.get('button').trigger('click')

  // 我们在等待所有承诺完成之前，断言“加载状态”。
  expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  expect(wrapper.get('button').attributes()).toHaveProperty('disabled')

  // 和之前一样，等待 DOM 更新。
  await flushPromises()

  // 之后，我们回到“未加载”状态。
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  expect(wrapper.get('button').attributes()).not.toHaveProperty('disabled')
})
```

## 从 Vuex 发起 HTTP 请求

对于更复杂的应用程序，一个典型的场景是触发执行 HTTP 请求的 Vuex 动作。

这与上面概述的示例没有什么不同。我们可能想要像往常一样加载存储并模拟像 `axios` 这样的服务。通过这种方式，我们可以模拟系统的边界，从而在测试中获得更高的信心。

你可以查看 [Testing Vuex](vuex.md) 文档，以获取有关使用 Vue Test Utils 测试 Vuex 的更多信息。

## 结论

- Vue Test Utils 不需要特殊工具来测试 HTTP 请求。唯一需要考虑的是测试异步行为。
- 测试不应依赖于外部服务。使用模拟工具如 `jest.mock` 来避免这种情况。
- `flushPromises()` 是一个有用的工具，可以确保在异步操作后 DOM 更新。
- 通过与组件进行交互来直接触发 HTTP 请求，可以让你的测试更加稳健。

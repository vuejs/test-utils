# 条件渲染

Vue Test Utils 提供了一系列功能，用于渲染组件并对其状态进行断言，以验证其是否正常工作。本文将探讨如何渲染组件，以及验证它们是否正确渲染内容。

本文也可以作为[短视频](https://www.youtube.com/watch?v=T3CHtGgEFTs&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=15)观看。

## 查找元素

Vue 的基本特性之一是能够动态插入和移除元素，使用 `v-if` 指令。让我们看看如何测试一个使用 `v-if` 的组件。

```js
const Nav = {
  template: `
    <nav>
      <a id="profile" href="/profile">My Profile</a>
      <a v-if="admin" id="admin" href="/admin">Admin</a>
    </nav>
  `,
  data() {
    return {
      admin: false
    }
  }
}
```

在 `<Nav>` 组件中，显示用户个人资料的链接。此外，如果 `admin` 的值为 `true`，则会显示指向管理员部分的链接。我们需要验证的三个场景是：

1. 应该显示 `/profile` 链接。
2. 当用户是管理员时，应该显示 `/admin` 链接。
3. 当用户不是管理员时，应该不显示 `/admin` 链接。

## 使用 `get()`

`wrapper` 有一个 `get()` 方法，用于查找现有元素。它使用 [`querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) 语法。

我们可以使用 `get()` 来断言 `/profile` 链接的内容：

```js
test('renders a profile link', () => {
  const wrapper = mount(Nav)

  // 在这里，我们隐含地断言元素 #profile 存在。
  const profileLink = wrapper.get('#profile')

  expect(profileLink.text()).toEqual('My Profile')
})
```

如果 `get()` 不返回与选择器匹配的元素，它将引发错误，测试将失败。如果找到元素，`get()` 返回一个 `DOMWrapper`。`DOMWrapper` 是对 DOM 元素的一个薄包装，支持 [Wrapper API](../../api/#Wrapper-methods) - 这就是我们能够使用 `profileLink.text()` 访问文本的原因。您可以使用 `element` 属性访问原始元素。

还有另一种类型的包装器 - `VueWrapper` - 它是从 [`getComponent`](../../api/#getComponent) 返回的，工作方式相同。

## 使用 `find()` 和 `exists()`

`get()` 假设元素存在，并在不存在时抛出错误。因此，不建议使用它来断言元素的存在。

为此，我们使用 `find()` 和 `exists()`。下一个测试断言如果 `admin` 为 `false` (默认值)，则管理员链接不存在：

```js
test('does not render an admin link', () => {
  const wrapper = mount(Nav)

  // 使用 `wrapper.get` 会抛出错误并使测试失败。
  expect(wrapper.find('#admin').exists()).toBe(false)
})
```

请注意，我们在 `.find()` 返回的值上调用 `exists()`。`find()` 和 `mount()` 一样，也返回一个 `wrapper`。`mount()` 有一些额外的方法，因为它包装的是 Vue 组件，而 `find()` 仅返回常规 DOM 节点，但两者之间共享许多方法。其他方法包括 `classes()`，用于获取 DOM 节点的类，以及 `trigger()`，用于模拟用户交互。您可以在[这里](../../api/#Wrapper-methods)找到支持的方法列表。

## 使用 `data`

最后一个测试是断言当 `admin` 为 `true` 时，管理员链接被渲染。它默认是 `false`，但我们可以使用 `mount()` 的第二个参数，即[挂载选项](../../api/#mount)来覆盖它。

对于 `data`，我们使用命名恰当的 `data` 选项：

```js
test('renders an admin link', () => {
  const wrapper = mount(Nav, {
    data() {
      return {
        admin: true
      }
    }
  })

  // 通过使用 `get()` 我们隐含地断言元素存在。
  expect(wrapper.get('#admin').text()).toEqual('Admin')
})
```

如果您在 `data` 中有其他属性，不用担心 - Vue Test Utils 会将两者合并。挂载选项中的 `data` 将优先于任何默认值。

要了解其他挂载选项，请参见[传递数据](../essentials/passing-data.md)或[挂载选项](../../api/#mount)。

## 检查元素可见性

有时您只想隐藏/显示一个元素，同时将其保留在 DOM 中。Vue 提供了 `v-show` 以应对这种情况。(您可以在[这里](https://v3.vuejs.org/guide/conditional.html#v-if-vs-v-show)查阅 `v-if` 和 `v-show` 之间的区别。)

使用 `v-show` 的组件如下所示：

```js
const Nav = {
  template: `
    <nav>
      <a id="user" href="/profile">My Profile</a>
      <ul v-show="shouldShowDropdown" id="user-dropdown">
        <!-- dropdown content -->
      </ul>
    </nav>
  `,
  data() {
    return {
      shouldShowDropdown: false
    }
  }
}
```

在这种情况下，元素不可见但始终被渲染。`get()` 或 `find()` 将始终返回一个 `Wrapper` - `find()` 的 `.exists()` 始终返回 `true` - 因为**元素仍然在 DOM 中**。

## 使用 `isVisible()`

`isVisible()` 可以检查隐藏元素。特别是 `isVisible()` 将检查：

- 元素或其祖先是否具有 `display: none`、`visibility: hidden` 或 `opacity: 0` 样式
- 元素或其祖先是否位于折叠的 `<details>` 标签内
- an element or its ancestors have the `hidden` attribute

在这些情况下，`isVisible()` 将返回 `false`。

使用 `v-show` 进行测试的场景如下：

```js
test('does not show the user dropdown', () => {
  const wrapper = mount(Nav)

  expect(wrapper.get('#user-dropdown').isVisible()).toBe(false)
})
```

## 结论

- 使用 `find()` 结合 `exists()` 验证元素是否在 DOM 中。
- 如果您确认元素应该在 DOM 中，请使用 `get()`。
- 可以使用 `data` 挂载选项设置组件的默认值。
- 使用 `get()` 和 `isVisible()` 验证在 DOM 中的元素的可见性。

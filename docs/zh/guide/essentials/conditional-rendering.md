# 条件渲染

Vue Test Utils 提供了一系列功能，用于渲染组件并对其状态进行断言，以验证其是否正常工作。本文将探讨如何渲染组件，以及如何验证组件是否正确渲染内容。

这篇文章也提供了[短视频](https://www.youtube.com/watch?v=T3CHtGgEFTs&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=15)版本。

## 查找元素

Vue 最基础的特性之一是能够使用 `v-if` 动态地插入和移除元素。让我们看看如何测试一个使用了 `v-if` 的组件。

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

在 `<Nav>` 组件中，默认显示指向个人资料的链接。此外，如果 `admin` 的值为 `true`，则还会显示指向管理中心的链接。我们需要验证以下三个场景：

1. 应该始终显示 `/profile` 链接。
2. 当用户是管理员时，显示 `/admin` 链接。
3. 当用户不是管理员时，不显示 `/admin` 链接。

## 使用 `get()`

`wrapper` 有一个 `get()` 方法，用于查找存在的元素。它使用 [`querySelector`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/querySelector) 语法。

我们可以使用 `get()` 来断言 `#profile` 锚元素的内容：

```js
test('renders a profile link', () => {
  const wrapper = mount(Nav)

  // 这里我们隐式断言 #profile 元素存在。
  const profileLink = wrapper.get('#profile')

  expect(profileLink.text()).toEqual('My Profile')
})
```

如果 `get()` 没有找到匹配选择器的元素，它会抛出错误，测试将会失败。如果找到了元素，`get()` 返回一个 `DOMWrapper`。`DOMWrapper` 是一个轻量级的 DOM 元素封装，它实现了 [Wrapper API](../../api/#Wrapper-methods)，这就是为什么我们能够使用 `profileLink.text()` 来访问文本内容。你可以通过 `element` 属性访问原始元素。

还有另一种封装类型 — `VueWrapper`，它由 [`getComponent`](../../api/#getComponent) 返回，工作方式相同。

## 使用 `find()` 和 `exists()`

`get()` 基于元素存在的假设来工作，当元素不存在时会抛出错误。因此，不推荐使用它来断言元素是否存在。

为此，我们使用 `find()` 和 `exists()`。下面的测试用例断言：如果 `admin` 为 `false`（默认值），`#admin` 锚元素不会出现：

```js
test('does not render an admin link', () => {
  const wrapper = mount(Nav)

  // 使用 `wrapper.get` 会抛出错误并导致测试失败。
  expect(wrapper.find('#admin').exists()).toBe(false)
})
```

请注意，我们在 `.find()` 返回的值上调用了 `exists()`。`find()` 和 `mount()` 一样，也会返回一个 `wrapper`。`mount()` 有一些额外的方法，因为它封装的是 Vue 组件，而 `find()` 只返回普通的 DOM 节点，但它们之间有许多共享的方法。其他方法还包括 `classes()`，用于获取 DOM 节点的 class 属性，以及用于模拟用户交互的 `trigger()`。你可以在[这里](../../api/#Wrapper-methods)找到支持的方法列表。

## 使用 `data`

最后一个测试是断言当 `admin` 为 `true` 时，会渲染 `#admin` 锚元素。`admin` 默认是 `false`，但我们可以使用 `mount()` 的第二个参数，即[挂载选项](../../api/#mount)来覆盖它。

对于 `data`，我们使用恰如其名的 `data` 选项：

```js
test('renders an admin link', () => {
  const wrapper = mount(Nav, {
    data() {
      return {
        admin: true
      }
    }
  })

  // 同样，使用 `get()` 时我们隐式地断言了元素存在。
  expect(wrapper.get('#admin').text()).toEqual('Admin')
})
```

如果你在 `data` 中还有其他属性，不用担心 — Vue Test Utils 会将两者合并。挂载选项中的 `data` 会优先于任何默认值。

要了解其他挂载选项，请参见[传递数据](../essentials/passing-data.md)或[挂载选项](../../api/#mount)。

## 检查元素可见性

有时你可能只想在 DOM 中隐藏/显示一个元素，而不是将其移除。Vue 为这种场景提供了 v-show 指令。(你可以在[这里](https://cn.vuejs.org/guide/essentials/conditional)查阅 `v-if` 和 `v-show` 的区别。)

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

在这种场景下，元素虽然不可见但始终被渲染。`get()` 或 `find()` 将始终返回一个 `Wrapper` — `find()` 的 `.exists()` 也将始终返回 `true` — 因为**该元素仍然存在于 DOM 中**。

## 使用 `isVisible()`

`isVisible()` 提供了检查隐藏元素的能力。具体来说，`isVisible()` 会检查：

- 元素或其祖先元素是否具有 `display: none`、`visibility: hidden` 或 `opacity: 0` 样式
- 元素或其祖先是否位于折叠的 `<details>` 标签内
- 元素本身或其祖先元素是否有 hidden 属性

在以上任一情况下，`isVisible()` 都会返回 false。

使用 `v-show` 进行测试的场景如下：

```js
test('does not show the user dropdown', () => {
  const wrapper = mount(Nav)

  expect(wrapper.get('#user-dropdown').isVisible()).toBe(false)
})
```

## 总结

- 使用 `find()` 结合 `exists()` 验证元素是否在于 DOM 中。
- 如果你确认元素存在于 DOM 中，就使用 `get()`。
- 可以使用 `data` 挂载选项设置组件的默认值。
- 使用 `get()` 和 `isVisible()` 验证在 DOM 中元素的可见性。

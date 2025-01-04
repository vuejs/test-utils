# 常见问题

[[toc]]

## 使用 Vitest 模拟日期和计时器

Vue 的调度器依赖于系统时间。请务必在调用 `vi.setSystemTime` 后再挂载组件，因为 Vue 依赖于其副作用。在调用 `vi.setSystemTime` 之前挂载组件可能会破坏其响应性。

请查看 [vuejs/test-utils#2074](https://github.com/vuejs/test-utils/issues/2074)。

## Vue warn: Failed setting prop

```
[Vue warn]: Failed setting prop "prefix" on <component-stub>: value foo is invalid.
TypeError: Cannot set property prefix of #<Element> which has only a getter
```

当您使用 `shallowMount` 或具有与 [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element) 共享的属性名称的 `stubs` 时，会显示此警告。

与 `Element` 共享的常见属性名称：
* `attributes`
* `children`
* `prefix`

请参阅：https://developer.mozilla.org/zh-CN/docs/Web/API/Element

**可能的解决方案**

1. 使用 `mount` 而不是 `shallowMount` 进行不带存根的渲染
2. 通过模拟 `console.warn` 来忽略警告
3. 重命名 prop，以避免与 `Element` 属性冲突

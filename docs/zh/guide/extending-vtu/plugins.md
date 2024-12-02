# 插件

插件为 Vue Test Utils 的 API 添加了全局功能。这是扩展 Vue Test Utils API 的官方方式，可以添加自定义逻辑、方法或功能。

插件的使用场景：

1. 为现有的公共方法创建别名
2. 将匹配器附加到 Wrapper 实例
3. 将功能附加到 Wrapper

## Wrapper 插件

### 使用插件

通过调用 `config.plugins.VueWrapper.install()` 方法来安装插件。这必须在调用 `mount` 之前完成。

`install()` 方法将接收一个 `WrapperAPI` 实例，该实例包含该实例的公共和私有属性。

```js
// setup.js file
import { config } from '@vue/test-utils'

// 本地定义的插件，见“编写插件”
import MyPlugin from './myPlugin'

// 将插件安装到 VueWrapper
config.plugins.VueWrapper.install(MyPlugin)
```

你可以选择性地传入一些选项：

```js
config.plugins.VueWrapper.install(MyPlugin, { someOption: true })
```

你的插件应该只安装一次。如果你使用 Jest，这应该在你的 Jest 配置的 `setupFiles` 或 `setupFilesAfterEnv` 文件中。

某些插件在导入时会自动调用 `config.plugins.VueWrapper.install()`。如果它们同时扩展多个接口，这是常见的情况。请遵循你正在安装的插件的说明。

查看 [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) 或 [awesome-vue](https://github.com/vuejs/awesome-vue#test) 获取社区贡献的插件和库的集合。

### 编写插件

Vue Test Utils 插件只是一个函数，该函数接收挂载的 `VueWrapper` 或 `DOMWrapper` 实例，并可以对其进行修改。

#### 基本插件

以下是一个简单的插件，用于为 `wrapper.element` 创建一个方便的别名 `wrapper.$el`。

```js
// setup.js
import { config } from '@vue/test-utils'

const myAliasPlugin = (wrapper) => {
  return {
    $el: wrapper.element // 简单别名
  }
}

// 在你要扩展的类型上调用 install
// 你可以为 config.plugins 中的任何值编写插件
config.plugins.VueWrapper.install(myAliasPlugin)
```

在你的测试中，你将能够在 `mount` 之后使用你的插件。

// component.spec.js

```js
// component.spec.js
const wrapper = mount({ template: `<h1>🔌 Plugin</h1>` })
console.log(wrapper.$el.innerHTML) // 🔌 Plugin
```

#### 数据测试 ID 插件

下面的插件为 `VueWrapper` 实例添加了一个 `findByTestId` 方法。这鼓励使用依赖于 Vue 组件上的测试专用属性的选择器策略。

用法：

`MyComponent.vue`:

```vue
<template>
  <MyForm class="form-container" data-testid="form">
    <MyInput data-testid="name-input" v-model="name" />
  </MyForm>
</template>
```

`MyComponent.spec.js`:

```js
const wrapper = mount(MyComponent)
wrapper.findByTestId('name-input') // returns a VueWrapper or DOMWrapper
```

插件的实现：

```js
import { config, DOMWrapper } from '@vue/test-utils'

const DataTestIdPlugin = (wrapper) => {
  function findByTestId(selector) {
    const dataSelector = `[data-testid='${selector}']`
    const element = wrapper.element.querySelector(dataSelector)
    return new DOMWrapper(element)
  }

  return {
    findByTestId
  }
}

config.plugins.VueWrapper.install(DataTestIdPlugin)
```

## Stubs 插件

`config.plugins.createStubs` 允许覆盖 VTU 提供的默认桩创建。

一些使用场景包括：

- 你想在桩中添加更多逻辑 (例如命名插槽)
- 你想为多个组件使用不同的桩 (例如从库中桩化组件)

### 用法

```typescript
config.plugins.createStubs = ({ name, component }) => {
  return defineComponent({
    render: () => h(`custom-${name}-stub`)
  })
}
```

每当 VTU 生成一个桩时，这个函数都会被调用，无论是通过以下方式：

```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: true
    }
  }
})
```

还是

```typescript
const wrapper = shallowMount(Component)
```

但当你显式设置桩时，它将不会被调用：

```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: { template: '<child-stub/>' }
    }
  }
})
```

## 使用 TypeScript 的插件

要使用自定义的 Wrapper 插件与 [TypeScript](https://www.typescriptlang.org/) 一起使用，你必须声明你的自定义 wrapper 函数。因此，添加一个名为 `vue-test-utils.d.ts` 的文件，内容如下：

```typescript
import { DOMWrapper } from '@vue/test-utils'

declare module '@vue/test-utils' {
  interface VueWrapper {
    findByTestId(testId: string): DOMWrapper[]
  }
}
```

## 推广你的插件

如果你缺少某些功能，可以考虑编写插件来扩展 Vue Test Utils，并提交以在 [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) 或 [awesome-vue](https://github.com/vuejs/awesome-vue#test) 中推广。

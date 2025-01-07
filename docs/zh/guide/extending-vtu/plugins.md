# 插件

插件为 Vue Test Utils 的 API 添加全局功能。这是为 Vue Test Utils 的 API 扩展自定义逻辑、方法或功能的官方方式。

插件的使用场景：

1. 为现有的公共方法创建别名
2. 为 Wrapper 实例添加匹配器
3. 为 Wrapper 添加功能

## Wrapper 插件

### 使用插件

通过调用 `config.plugins.VueWrapper.install()` 方法来安装插件。这必须在调用 `mount` 之前完成。

该 `install()` 方法将接收一个 `WrapperAPI` 实例及其公共和私有属性。

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

你的插件应该只安装一次。如果你使用 Jest，它应该在你的 Jest 配置的 `setupFiles` 或 `setupFilesAfterEnv` 文件中。

某些插件会在导入时自动调用 `config.plugins.VueWrapper.install()`。如果它们同时扩展多个接口，这是常见的情况。请遵循你正在安装的插件的说明。

查阅 [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) 或 [awesome-vue](https://github.com/vuejs/awesome-vue#test) 获取社区贡献的插件和库。

### 编写插件

Vue Test Utils 插件只是一个单纯的函数，该函数接收挂载的 `VueWrapper` 或 `DOMWrapper` 实例，并可以对其进行修改。

#### 基本插件

以下是一个简单的插件，用于为 `wrapper.element` 创建一个方便的别名 `wrapper.$el`。

```js
// setup.js
import { config } from '@vue/test-utils'

const myAliasPlugin = (wrapper) => {
  return {
    $el: wrapper.element // 简单的别名
  }
}

// 在你要扩展的类型上调用 install
// 你可以为 config.plugins 中的任何值编写插件
config.plugins.VueWrapper.install(myAliasPlugin)
```

在测试中，你可以在 `mount` 之后使用该插件。

```js
// component.spec.js
const wrapper = mount({ template: `<h1>🔌 Plugin</h1>` })
console.log(wrapper.$el.innerHTML) // 🔌 Plugin
```

#### 数据测试 ID 插件

下面的插件为 `VueWrapper` 实例添加了一个 `findByTestId` 方法。它鼓励你在 Vue 组件上选择测试转用的 attribute 作为你的选择器策略。

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
wrapper.findByTestId('name-input') // 返回一个 VueWrapper 或 DOMWrapper
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

## Stub 插件

`config.plugins.createStubs` 允许覆盖 VTU 默认创建并提供的测试替身。

一些使用场景包括：

* 你想在测试替身中添加更多逻辑 (例如具名插槽)
* 你想为多个组件使用不同的测试替身 (例如一个库中的测试替身组件)

### 用法

```typescript
config.plugins.createStubs = ({ name, component }) => {
  return defineComponent({
    render: () => h(`custom-${name}-stub`)
  })
}
```

不论通过以下哪种方式，每当 VTU 生成一个测试替身时，这个函数都会被调用：

```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: true
    }
  }
})
```

或

```typescript
const wrapper = shallowMount(Component)
```

但当你显式设置测试替身时，它将不会被调用：

```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: { template: '<child-stub/>' }
    }
  }
})
```

## 配合 TypeScript 使用插件

要结合 [TypeScript](https://www.typescriptlang.org/) 使用自定义的包装器插件，你必须声明你的自定义包装器函数。即基于几下内容添加一个名为 `vue-test-utils.d.ts` 的文件：

```typescript
import { DOMWrapper } from '@vue/test-utils'

declare module '@vue/test-utils' {
  interface VueWrapper {
    findByTestId(testId: string): DOMWrapper[]
  }
}
```

## 推广你的插件

如果你需要某些功能，可以考虑编写插件来扩展 Vue Test Utils，并提交以在 [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) 或 [awesome-vue](https://github.com/vuejs/awesome-vue#test) 中推广。

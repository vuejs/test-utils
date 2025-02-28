# 从 Vue Test Utils v1 迁移

这是一篇对 VTU v1 到 VTU v2 变更的回顾，并提供一些代码片段以展示所需的修改。如果你遇到了未在此处记录的错误或行为差异，请[创建 issue](https://github.com/vuejs/test-utils/issues/new)。

## 变更

### `propsData` 现已改为 `props`

在 VTU v1 中，你可以通过挂载选项 `propsData` 传递 props。这令人困惑，因为你在 Vue 组件中声明 props 时使用的是 `props`。现在你可以通过挂载选项 `props` 传递 `props` 了。同时为了向后兼容，`propsData` 仍然是支持的。

**之前**：

```js
const App = {
  props: ['foo']
}

const wrapper = mount(App, {
  propsData: {
    foo: 'bar'
  }
}
```

**之后**：

```js
const App = {
  props: ['foo']
}

const wrapper = mount(App, {
  props: {
    foo: 'bar'
  }
}
```

### 不再需要 `createLocalVue`

在 Vue 2 中，插件通常会修改全局 Vue 实例并将各种方法附加到其原型上。从 Vue 3 开始，这种情况不再存在，我们通过 `createApp` 创建新的 Vue 应用，而不是 `new Vue`，并使用 `createApp(App).use(/* ... */)` 安装插件。

在 Vue Test Utils v1 中，为了避免污染全局 Vue 实例的情况，我们提供了 `createLocalVue` 函数和 `localVue` 挂载选项。这使你可以为每个测试提供一个独立的 Vue 实例，避免不同测试之间污染。在 Vue 3 中，这不再是问题，因为插件、mixin 等不会修改全局 Vue 实例。

在大多数情况下，你之前使用 `createLocalVue` 和 `localVue` 挂载选项来安装插件、mixin 或指令，现在可以使用 [`global` 挂载选项](/api/#global)。以下是一个之前使用 `localVue` 的组件和测试示例，以及它现在的样子 (利用了 `global.plugins`，因为 Vuex 是一个插件)：

**之前**：

```js
import Vuex from 'vuex'
import { createLocalVue, mount } from '@vue/test-utils'

const App = {
  computed: {
    count() {
      return this.$state.count
    }
  }
}

const localVue = createLocalVue()
localVue.use(Vuex)
const store = new Vuex.Store({
  state: {
    return { count: 1 }
  }
})

const wrapper = mount(App, {
  store
  localVue
})
```

**之后**：

```js
import { createStore } from 'vuex'
import { mount } from '@vue/test-utils'

const App = {
  computed: {
    count() {
      return this.$state.count
    }
  }
}

const store = createStore({
  state() {
    return { count: 1 }
  }
})

const wrapper = mount(App, {
  global: {
    plugins: [store]
  }
})
```

### `mocks` 和 `stubs` 现在在 `global` 中

`mocks` 和 `stubs` 应用于所有组件，而不仅仅是你传递给 `mount` 的组件。为了反映这一点，`mocks` 和 `stubs` 现在在新的 `global` 挂载选项中：

**之前**：

```js
const $route = {
  params: {
    id: '1'
  }
}

const wrapper = mount(App, {
  stubs: {
    Foo: true
  },
  mocks: {
    $route
  }
}
```

**之后**：

```js
const $route = {
  params: {
    id: '1'
  }
}

const wrapper = mount(App, {
  global: {
    stubs: {
      Foo: true
    },
    mocks: {
      $route
    }
  }
}
```

### `shallowMount` 和 `renderStubDefaultSlot`

`shallowMount` 旨在将某个自定义组件置换为测试替身。虽然在 Vue Test Utils v1 中是这样的，但被置换的组件仍会渲染其默认的 `<slot />`。虽然这并非预期的行为，但一些用户对此功能表示喜欢。在 v2 中，这一行为已被修正，**组件测试替身的插槽内容不再被渲染**。

给定以下代码：

```js
import { shallowMount } from '@vue/test-utils'

const Foo = {
  template: `<div><slot /></div>`
}

const App = {
  components: { Foo },
  template: `
    <div>
      <Foo>
        Foo Slot
      </Foo>
    </div>
  `
}
```

**之前**：

```js
describe('App', () => {
  it('renders', () => {
    const wrapper = shallowMount(App)
    console.log(wrapper.html())
    // renders:
    // <div>
    //   <foo-stub>
    //     Foo Slot
    //   </foo-stub>
    // </div>
  })
})
```

**之后**：

```js
describe('App', () => {
  it('renders', () => {
    const wrapper = shallowMount(App)
    console.log(wrapper.html())
    // renders:
    // <div>
    //   <foo-stub>
    //   </foo-stub>
    // </div>
  })
})
```

你可以通过以下方式启用旧行为：

```js
import { config } from '@vue/test-utils'

config.global.renderStubDefaultSlot = true
```

### `destroy` 现已改为 `unmount` 以匹配 Vue 3

Vue 3 将 `vm.$destroy` 重命名为 `vm.$unmount`。Vue Test Utils 也随之更改；`wrapper.destroy()` 现已改为 `wrapper.unmount()`。

### `scopedSlots` 和 `slots` 现已合并

Vue 3 将 `slot` 和 `scoped-slot` 语法统一为单一语法 `v-slot`，你可以在[文档](https://v3.vuejs.org/guide/migration/slots-unification.html#overview)中阅读相关内容。由于 `slot` 和 `scoped-slot` 现已合并，因此 `scopedSlots` 挂载选项现已被弃用，只需使用 `slots` 挂载选项即可。

### `slots` 的作用域现在暴露为 `params`

当使用字符串模板作为插槽内容时，插槽作用域如果没有使用 `<template #slot-name="scopeVar">` 标签显式定义，则在插槽计算时以 `params` 对象的方式可用。

```diff
shallowMount(Component, {
-  scopedSlots: {
+  slots: {
-    default: '<p>{{props.index}},{{props.text}}</p>'
+    default: '<p>{{params.index}},{{params.text}}</p>'
  }
})
```

### `findAll().at()` 已移除

`findAll()` 现在会直接返回一个 DOMWrappers 数组。

**之前：**

```js
wrapper.findAll('[data-test="token"]').at(0)
```

**之后：**

```js
wrapper.findAll('[data-test="token"]')[0]
```

### `createWrapper()` 已移除

`createWrapper()` 现在是一个内部函数，无法再被导入。如果你需要访问一个不是 Vue 组件的 DOM 元素的包装器，可以使用 `new DOMWrapper()` 构造函数。

**之前：**

```js
import { createWrapper } from "@vue/test-utils";

describe('App', () => {
  it('renders', () => {
    const body = createWrapper(document.body);
    expect(body.exists()).toBe(true);
  })

```

**之后：**

```js
import { DOMWrapper } from "@vue/test-utils";

describe('App', () => {
  it('renders', () => {
    const body = new DOMWrapper(document.body);
    expect(body.exists()).toBe(true);
  })
```

### `findAllComponents` 不再支持 `ref` 选择器

`findAllComponents` 不再支持 `ref` 语法。你可以通过设置一个 `data-test` attribute 并相应更新选择器：

`Component.vue`:

```diff
<template>
-  <FooComponent v-for="number in [1, 2, 3]" :key="number" ref="number">
+  <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </FooComponent>
</template>
```

`Component.spec.js`:

```diff
- wrapper.findAllComponents({ ref: 'number' })
+ wrapper.findAllComponents('[data-test="number"]')
```

## 测试运行器升级注意事项

> Vue Test Utils 是框架无关的，你可以与任何你喜欢的测试运行器一起使用。

这句话是 `@vue/test-utils` 的核心。但我们确实意识到，在某些情况下，将代码库及其相应的测试套件迁移到 `vue@3` 可能是一项相当大的工作。

本章节试图整理我们的社区在迁移及更新其底层测试栈中发现的一些常见问题。这些与 `@vue/test-utils` 无关，但我们希望它能帮助你完成这一重要的迁移步骤。

### `@vue/vue3-jest` + `jest@^28`

如果你决定借此机会将测试运行器工具升级到更现代的版本，请注意以下几点。

#### `ReferenceError: Vue is not defined` [vue-jest#479](https://github.com/vuejs/vue-jest/issues/479)

当使用 `jest-environment-jsdom` 包时，它默认会从 `package.json` 的 [`browser` 字段](https://jestjs.io/docs/configuration#testenvironmentoptions-object)加载库。你可以通过将其导出字段覆盖为 `node` 来修复此错误：

```js
// jest.config.js
module.exports = {
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
}
```

<br/>

#### 测试快照现在会包含注释节点

如果你在快照测试时发现注释节点泄漏到了你的快照中，请注意现在我们会始终[保留](https://cn.vuejs.org/api/application.html#app-config-compileroptions-comments) `comments` 且仅会在生产中将其删除。你可以通过调整 `app.config.compilerOptions` 来覆盖此行为，以便在快照中也删除它们：

- 通过 `vue-jest` [配置](https://github.com/vuejs/vue-jest#compiler-options-in-vue-3)。

  ```js
  // jest.config.js
  module.exports = {
    globals: {
      'vue-jest': {
        compilerOptions: {
          comments: false
        }
      }
    }
  }
  ```

- 通过 `@vue/test-utils` [`mountingOptions.global.config`](https://test-utils.vuejs.org/api/#global) 全局或基于每个测试进行配置。

## 与 v1 的比较

这是一个针对来自 VTU 1 用户的表格，其比较了两者的 API。

### 基础 API

| API               | 备注                        |
| ----------------- | --------------------------- |
| enableAutoDestroy | 替代为 `enableAutoUnmount` |

### 挂载选项

| 选项             | 备注                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| mocks            | 嵌套在 `global` 中                                                                  |
| propsData        | 现已改为 `props`                                                                    |
| provide          | 嵌套在 `global` 中                                                                  |
| mixins           | 嵌套在 `global` 中                                                                  |
| plugins          | 嵌套在 `global` 中                                                                  |
| component        | 嵌套在 `global` 中                                                                  |
| directives       | 嵌套在 `global` 中                                                                  |
| attachToDocument | 重命名为 `attachTo`，参见[此处](https://github.com/vuejs/vue-test-utils/pull/1492) |
| scopedSlots      | 已移除, ScopedSlots 和 Vue 3 的 `slots` 现已合并                                        |
| context          | 已移除, 与 Vue 2 不同，已不存在                                                 |
| localVue         | 已移除, 不再需要，在 Vue 3 中没有全局 Vue 实例可供修改                             |
| listeners        | 已移除, 在 Vue 3 中已不存在                                                         |
| parentComponent  | 已移除                                                                              |

### Wrapper API (mount)

| 方法           | 备注                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| find           | 仅支持 `querySelector` 语法。可使用 `findComponent(Comp)` 查找 Vue 组件             |
| setValue       | 适用于 select、checkbox、radio、input 和 textarea。返回 `nextTick`。                 |
| trigger        | 返回 `nextTick`。你可以执行 `await wrapper.find('button').trigger('click')`       |
| destroy        | 重命名为 `unmount` 以匹配 Vue 3 生命周期钩子名称。                                |
| contains       | 已移除，请使用 `find`                                                               |
| emittedByOrder | 已移除，请使用 `emitted`                                                            |
| setSelected    | 已移除，现在是 `setValue` 的一部分                                                |
| setChecked     | 已移除，现在是 `setValue` 的一部分                                                |
| is             | 已移除                                                                            |
| isEmpty        | 已移除，请参考[这里](https://github.com/testing-library/jest-dom#tobeempty)使用匹配器 |
| isVueInstance  | 已移除                                                                            |
| name           | 已移除                                                                            |
| setMethods     | 已移除                                                                            |

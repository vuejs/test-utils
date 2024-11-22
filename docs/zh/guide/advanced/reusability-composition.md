# 复用与组合

主要内容：

- `global.mixins`.
- `global.directives`.

## 测试组合函数

在使用组合式 API 并创建组合式函数时，您通常只想测试组合式函数。让我们从一个简单的示例开始：

```typescript
export function useCounter() {
  const counter = ref(0)

  function increase() {
    counter.value += 1
  }

  return { counter, increase }
}
```

在这种情况下，您实际上并不需要 `@vue/test-utils`。对应的测试如下：

```typescript
test('increase counter on call', () => {
  const { counter, increase } = useCounter()

  expect(counter.value).toBe(0)

  increase()

  expect(counter.value).toBe(1)
})
```

对于更复杂的组合式函数，使用了生命周期钩子如 `onMounted` 或 `provide`/`inject` 处理，您可以创建一个简单的测试助手组件。以下组合式函数在 `onMounted` 钩子中获取用户数据。

```typescript
export function useUser(userId) {
  const user = ref()

  function fetchUser(id) {
    axios.get(`users/${id}`).then((response) => (user.value = response.data))
  }

  onMounted(() => fetchUser(userId))

  return { user }
}
```

要测试这个组合式函数，您可以在测试中创建一个简单的 `TestComponent`。`TestComponent` 应该以与真实组件相同的方式使用组合式函数。

```typescript
// 模拟 API 请求
jest.spyOn(axios, 'get').mockResolvedValue({ data: { id: 1, name: 'User' } })

test('fetch user on mount', async () => {
  const TestComponent = defineComponent({
    props: {
      // 定义 props，以便使用不同的输入参数测试组合式函数
      userId: {
        type: Number,
        required: true
      }
    },
    setup(props) {
      return {
        // 调用组合式函数并将所有返回值暴露到我们的组件实例中，以便我们可以通过 wrapper.vm 访问它们
        ...useUser(props.userId)
      }
    }
  })

  const wrapper = mount(TestComponent, {
    props: {
      userId: 1
    }
  })

  expect(wrapper.vm.user).toBeUndefined()

  await flushPromises()

  expect(wrapper.vm.user).toEqual({ id: 1, name: 'User' })
})
```

## Provide (提供) / Inject (注入)

Vue 提供了一种通过 `provide` 和 `inject` 将 props 传递给所有子组件的方法。测试这种行为的最佳方式是测试整个树（父组件 + 子组件）。但有时这并不可能，因为树结构过于复杂，或者您只想测试单个组合式函数。

### 测试 `provide`

假设您要测试以下组件：

```vue
<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
provide('my-key', 'some-data')
</script>
```

在这种情况下，您可以渲染一个实际的子组件并测试 `provide` 的正确用法，或者您可以创建一个简单的测试助手组件并将其传递到默认插槽中。

```typescript
test('provides correct data', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup() {
      const value = inject('my-key')
      return { value }
    }
  })

  const wrapper = mount(ParentComponent, {
    slots: {
      default: () => h(TestComponent)
    }
  })

  expect(wrapper.find('#provide-test').text()).toBe('some-data')
})
```

如果您的组件不包含插槽，您可以使用 [`stub`](./stubs-shallow-mount.md#Stubbing-a-single-child-component) 替换子组件为您的测试助手：

```vue
<template>
  <div>
    <SomeChild />
  </div>
</template>

<script setup>
import SomeChild from './SomeChild.vue'

provide('my-key', 'some-data')
</script>
```

测试如下：

```typescript
test('provides correct data', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup() {
      const value = inject('my-key')
      return { value }
    }
  })

  const wrapper = mount(ParentComponent, {
    global: {
      stubs: {
        SomeChild: TestComponent
      }
    }
  })

  expect(wrapper.find('#provide-test').text()).toBe('some-data')
})
```

### 测试 `inject`

当您的组件使用 `inject` 并需要通过 `provide` 传递数据时，您可以使用 `global.provide` 选项。

```vue
<template>
  <div>
    {{ value }}
  </div>
</template>

<script setup>
const value = inject('my-key')
</script>
```

单元测试可以简单地写成：

```typescript
test('renders correct data', () => {
  const wrapper = mount(MyComponent, {
    global: {
      provide: {
        'my-key': 'some-data'
      }
    }
  })

  expect(wrapper.text()).toBe('some-data')
})
```

## 结论

- 测试简单的组合式函数时无需组件和 `@vue/test-utils`
- 创建测试助手组件以测试更复杂的组合式函数
- 创建测试助手组件以测试您的组件是否通过 `provide` 提供正确的数据
- 使用 `global.provide` 将数据传递给使用 `inject` 的组件

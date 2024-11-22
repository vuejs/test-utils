# 过渡效果

通常情况下，您可能希望测试过渡后的 DOM 结构，这就是为什么 Vue Test Utils 默认会模拟 `<transition>` 和 `<transition-group>` 的原因。

以下是一个简单的组件，它通过淡入淡出的过渡效果切换内容：

```vue
<template>
  <button @click="show = !show">Toggle</button>

  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const show = ref(false)

    return {
      show
    }
  }
}
</script>

<style lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

由于 Vue Test Utils 会模拟内置的过渡效果，您可以像测试其他组件一样测试上述组件：

```js
import Component from './Component.vue'
import { mount } from '@vue/test-utils'

test('works with transitions', async () => {
  const wrapper = mount(Component)

  expect(wrapper.find('hello').exists()).toBe(false)

  await wrapper.find('button').trigger('click')

  // 点击按钮后，<p> 元素存在并且可见
  expect(wrapper.get('p').text()).toEqual('hello')
})
```

## 部分支持

Vue Test Utils 内置的过渡效果模拟比较简单，并不涵盖 Vue 所有的 [过渡特性](https://vuejs.org/guide/built-ins/transition)。例如， [JavaScript 钩子](https://vuejs.org/guide/built-ins/transition#javascript-hooks) 不被支持。这一限制可能会导致 Vue 发出警告。

::: tip
潜在解决方案：

- 您可以通过将 [global stubs transition](../../api/#global-stubs) 设置为 false 来关闭自动模拟。
- 如果需要，您可以创建自己的过渡效果模拟，以处理这些钩子。
- 您可以在测试中捕获警告以消除它。
  :::

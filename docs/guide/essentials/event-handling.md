# Event Handling

Vue components interact with each other via props and by emitting events by calling `$emit`. In this guide, we look at how to verify events are correctly emitted using the `emitted()` function.

This article is also available as a [short video](https://www.youtube.com/watch?v=U_j-nDur4oU&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=14).

## The Counter component

Here is a simple `<Counter>` component. It features a button that, when clicked, increments an internal count variable and emits its value:

```vue
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const emit = defineEmits(['increment'])

const handleClick = () => {
  count.value += 1
  emit('increment', count.value)
}
</script>

<template>
  <button @click="handleClick">Increment</button>
</template>
```

To fully test this component, we should verify that an `increment` event with the latest `count` value is emitted.

## Asserting the emitted events

To do so, we will rely on the `emitted()` method. It **returns an object with all the events the component has emitted**, and their arguments in an array. Let's see how it works:

```js
test('emits an event when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  expect(wrapper.emitted()).toHaveProperty('increment')
})
```

> If you haven't seen `trigger()` before, don't worry. It's used to simulate user interaction. You can learn more in [Forms](./forms).

The first thing to notice is that `emitted()` returns an object, where each key matches an emitted event. In this case, `increment`.

This test should pass. We made sure we emitted an event with the appropriate name.

## Asserting the arguments of the event

This is good - but we can do better! We need to check that we emit the right arguments when `this.$emit('increment', this.count)` is called.

Our next step is to assert that the event contains the `count` value. We do so by passing an argument to `emitted()`.

```js {9}
test('emits an event with count when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  // `emitted()` accepts an argument. It returns an array with all the
  // occurrences of `this.$emit('increment')`.
  const incrementEvent = wrapper.emitted('increment')

  // We have "clicked" twice, so the array of `increment` should
  // have two values.
  expect(incrementEvent).toHaveLength(2)

  // Assert the result of the first click.
  // Notice that the value is an array.
  expect(incrementEvent[0]).toEqual([1])

  // Then, the result of the second one.
  expect(incrementEvent[1]).toEqual([2])
})
```

Let's recap and break down the output of `emitted()`. Each of these keys contains the different values emitted during the test:

```js
// console.log(wrapper.emitted('increment'))
[
  [1], // first time it is called, `count` is 1
  [2] // second time it is called, `count` is 2
]
```

## Asserting complex events

Imagine that now our `<Counter>` component needs to emit an object with additional information. For instance, we need to tell any parent component listening to the `@increment` event if `count` is even or odd:

```vue
<!-- Counter.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)

const emit = defineEmits(['increment'])

const handleClick = () => {
  count.value += 1
  emit('increment', {
    count: count.value,
    isEven: count.value % 2 === 0,
  })
}
</script>

<template>
  <button @click="handleClick">Increment</button>
</template>
```

As we did before, we need to trigger the `click` event on the `<button>` element. Then, we use `emitted('increment')` to make sure the right values are emitted.

```js
test('emits an event with count when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  // We have "clicked" twice, so the array of `increment` should
  // have two values.
  expect(wrapper.emitted('increment')).toHaveLength(2)

  // Then, we can make sure each element of `wrapper.emitted('increment')`
  // contains an array with the expected object.
  expect(wrapper.emitted('increment')[0]).toEqual([
    {
      count: 1,
      isEven: false
    }
  ])

  expect(wrapper.emitted('increment')[1]).toEqual([
    {
      count: 2,
      isEven: true
    }
  ])
})
```

Testing complex event payloads such as Objects is no different from testing simple values such as numbers or strings.

## Conclusion

- Use `emitted()` to access the events emitted from a Vue component.
- `emitted(eventName)` returns an array, where each element represents one event emitted.
- Arguments are stored in `emitted(eventName)[index]` in an array in the same order they are emitted.

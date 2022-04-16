# Reusability & Composition

Mostly:

- `global.mixins`.
- `global.directives`.

## Testing composables

When working with the composition API and creating composables, you often want to test only the composable. Let's start
with a simple example:

```typescript
export function useCounter() {
  const counter = ref(0)

  function increase() {
    counter.value += 1
  }

  return { counter, increase }
}
```

In this case, you don't actually need `@vue/test-utils`. Here is the corresponding test:

```typescript
test('increase counter on call', () => {
  const { counter, increase } = useCounter()

  expect(counter.value).toBe(0)

  increase()

  expect(counter.value).toBe(1)
})
```

For more complex composables, which use lifecycle hooks like `onMounted` or `provide`/`inject` handling, you can create
a simple test helper component. The following composable fetches the user data within the `onMounted` hook.

```typescript
export function useUser(userId) {
  const user = ref()
  
  function fetchUser(id) {
    axios.get(`users/${id}`)
      .then(response => (user.value = response.data))
  }

  onMounted(() => fetchUser(userId))

  return { user }
}
```

To test this composable, you can create a simple `TestComponent` within the tests. The `TestComponent` should use the
composable the exact same way how the real components would use it.

```typescript
// Mock API request
jest.spyOn(axios, 'get').mockResolvedValue({ data: { id: 1, name: 'User' } })

test('fetch user on mount', async () => {
  const TestComponent = defineComponent({
    props: {
      // Define props, to test the composable with different input arguments
      userId: {
        type: Number,
        required: true
      }
    },
    setup (props) {
      return {
        // Call the composable and expose all return values into our
        // component instance so we can access them with wrapper.vm
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

## Provide / inject

Vue offers a way to pass props to all child components with `provide` and `inject`. The best way to test this behavior
is to test the entire tree (parent + children). But sometimes this is not possible, because the tree is too complex, or
you only want to test a single composable.

### Testing `provide`

Let's assume the following component you want to test:
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

In this case you could either render an actual child component and test the correct usage of `provide` or you can create
a simple test helper component and pass it into the default slot. 

```typescript
test('provides correct data', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup () {
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

If your component does not contain a slot you can use a [`stub`](./stubs-shallow-mount.md#stubbing-a-single-child-component)
and replace a child component with your test helper:

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

And the test:

```typescript
test('provides correct data', () => {
  const TestComponent = defineComponent({
    template: '<span id="provide-test">{{value}}</span>',
    setup () {
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

### Testing `inject`

When your Component uses `inject` and you need to pass data with `provide`, then you can use the `global.provides` option.

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

The unit test could simply look like: 

```typescript
test('renders correct data', () => {
  const wrapper = mount(MyComponent, {
    global: {
      provides: {
        'my-key': 'some-data'
      }
    }
  })

  expect(wrapper.text()).toBe('some-data')
})
```

## Conclusion

- test simple composables without a component and `@vue/test-utils`
- create a test helper component to test more complex composables
- create a test helper component to test your component provides the correct data with `provide`
- use `global.provides` to pass data to your component which uses `inject`

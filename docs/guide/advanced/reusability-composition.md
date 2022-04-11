# Reusability & Composition

Mostly:

- `global.provide`.
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
    fetch(`users/${id}`)
      .then(response => (user.value = response.data))
  }

  onMounted(() => fetchUser(userId))

  return { user }
}
```

To test this composable, you can create a simple `TestComponent` within the tests. The `TestComponent` should use the
composable the exact same way how the real components would use it.

```typescript
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

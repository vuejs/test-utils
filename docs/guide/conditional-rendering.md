# Conditional Rendering

Vue Test Utils has a range of features for rendering and making assertions about the state of a component, with the goal of verifying it is behaving correctly. This article will explore how to render components, as well as verify they are rendering content correctly.

## Finding Elements

One of the most basic features of Vue is the ability to dynamically show, hide and remove elements with `v-if`. Let's look at how to test a component that uses `v-if`.

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

In the `<Nav>` component, a link to the user's profile is shown. In addition, if the `admin` value is `true`, we reveal a link to the admin section. There are three scenarios which we should verify are behaving correctly:

1. The `/profile` link should be shown.
2. When the user is an admin, the `/admin` link should be shown.
3. When the user is not an admin, the `/admin` link should not be shown.

## Using `get()`

`wrapper` has a `get()` method that searches for an existing element. It uses [`querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) syntax.

We can assert the profile link content by using `get()`:

```js
test('renders a profile link', () => {
  const wrapper = mount(Nav)

  // Here we are implicitly asserting that the
  // element #profile exists.
  const profileLink = wrapper.get('#profile')

  expect(profileLink.text()).toEqual('My Profile')
})
```

If `get()` does not return an element matching the selector, it will raise an error, and your test will fail.

## Using `find()` and `exists()`

`get()` works for asserting elements do exist. However, as we mentioned, it throws an error when it can't find an element, so you can't use it to assert whether if elements exist.

To do so, we use `find()` and `exists()`. The next test asserts that if `admin` is `false` (which is it by default), the admin link is not present:

```js
test('does not render an admin link', () => {
  const wrapper = mount(Nav)

  // Using `wrapper.get` would throw and make the test fail.
  expect(wrapper.find('#admin').exists()).toBe(false)
})
```

Notice we are calling `exists()` on the value returned from `.find()`? `find()`, like `mount()`, also returns a wrapper, similar to `mount()`. `mount()` has a few extra methods, because it's wrapping a Vue component, and `find()` only returns a regular DOM node, but many of the methods are shared between both. Some other methods include `classes()`, which gets the classes a DOM node has, and `trigger()` for simulating user interaction. You can find a list of methods supported [here](/api/#wrapper-methods).

## Using `data`

The final test is to assert that the admin link is rendered when `admin` is `true`. It's `false` by default, but we can override that using the second argument to `mount()`, the [`mounting options`](/api/#mount-options).

For `data`, we use the aptly named `data` option:

```js
test('renders an admin link', () => {
  const wrapper = mount(Nav, {
    data() {
      return {
        admin: true
      }
    }
  })

  // Again, by using `get()` we are implicitly asserting that
  // the element exists.
  expect(wrapper.get('#admin').text()).toEqual('Admin')
})
```

If you have other properties in `data`, don't worry - Vue Test Utils will merge the two together. The `data` in the mounting options will take priority over any default values.

To learn what other mounting options exist, see [`Passing Data`](/guide/passing-data.html) or see [`mounting options`](/api/#mount-options).

## Conclusion

- Use `find()` along with `exists()` to verify whether if an element is in the DOM.
- Use `get()` if you expect the DOM element to be in the DOM.
- The `data` mounting option can be used to set default values on a component.

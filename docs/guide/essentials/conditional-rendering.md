# Conditional Rendering

Vue Test Utils has a range of features for rendering and making assertions about the state of a component, with the goal of verifying it is behaving correctly. This article will explore how to render components, as well as verify they are rendering content correctly.

This article is also available as a [short video](https://www.youtube.com/watch?v=T3CHtGgEFTs&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=15).

## Finding Elements

One of the most basic features of Vue is the ability to dynamically insert and remove elements with `v-if`. Let's look at how to test a component that uses `v-if`.

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

If `get()` does not return an element matching the selector, it will raise an error, and your test will fail. `get()` returns a `DOMWrapper` if an element is found. A `DOMWrapper` is a thin wrapper around the DOM element that implements the [Wrapper API](/api/#wrapper-methods) - that's why we are able to do `profileLink.text()` and access the text. You can access the raw element using the `element` property.

There is another type of wrapper - a `VueWrapper` - that is returned from [`getComponent`](/api/#getcomponent) that works in the same manner.

## Using `find()` and `exists()`

`get()` works on the assumption that elements do exist and throws an error when they do not. It is _not_ recommended to use it for asserting existence.

To do so, we use `find()` and `exists()`. The next test asserts that if `admin` is `false` (which it is by default), the admin link is not present:

```js
test('does not render an admin link', () => {
  const wrapper = mount(Nav)

  // Using `wrapper.get` would throw and make the test fail.
  expect(wrapper.find('#admin').exists()).toBe(false)
})
```

Notice we are calling `exists()` on the value returned from `.find()`. `find()`, like `mount()`, also returns a `wrapper`, similar to `mount()`. `mount()` has a few extra methods, because it's wrapping a Vue component, and `find()` only returns a regular DOM node, but many of the methods are shared between both. Some other methods include `classes()`, which gets the classes a DOM node has, and `trigger()` for simulating user interaction. You can find a list of methods supported [here](../../api/#wrapper-methods).

## Using `data`

The final test is to assert that the admin link is rendered when `admin` is `true`. It's `false` by default, but we can override that using the second argument to `mount()`, the [`mounting options`](../../api/#mount-options).

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

To learn what other mounting options exist, see [`Passing Data`](../essentials/passing-data.md) or see [`mounting options`](../../api/#mount-options).

## Checking Elements visibility

Sometimes you only want to hide/show an element while keeping it in the DOM. Vue offers `v-show` for scenarios as such. (You can check the differences between `v-if` and `v-show` [here](https://v3.vuejs.org/guide/conditional.html#v-if-vs-v-show)).

This is how a component with `v-show` looks like:

```js
const Nav = {
  template: `
    <nav>
      <a id="user" href="/profile">My Profile</a>
      <ul v-show="shouldShowDropdown" id="user-dropdown">
        <!-- dropdown content -->
      </ul>
    </nav>
  `,
  data() {
    return {
      shouldShowDropdown: false
    }
  }
}
```

In this scenario, the element is not visible but always rendered. `get()` or `find()` will always return a `Wrapper` – `find()` with `.exists()` always return `true` – because the **element is still in the DOM**.

## Using `isVisible()`

`isVisible()` gives the capacity to check for hidden elements. In particular `isVisible()` will check if:

- an element or its ancestors have `display: none`, `visibility: hidden`, `opacity :0` style
- an element or its ancestors are located inside collapsed `<details>` tag
- an element or its ancestors have the `hidden` attribute

For any of these cases, `isVisible()` returns `false`.

Testing scenarios using `v-show` will look like:

```js
test('does not show the user dropdown', () => {
  const wrapper = mount(Nav)

  expect(wrapper.get('#user-dropdown').isVisible()).toBe(false)
})
```

## Conclusion

- Use `find()` along with `exists()` to verify whether an element is in the DOM.
- Use `get()` if you expect the element to be in the DOM.
- The `data` mounting option can be used to set default values on a component.
- Use `get()` with `isVisible()` to verify the visibility of an element that is in the DOM

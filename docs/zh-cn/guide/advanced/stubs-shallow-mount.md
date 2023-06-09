# Stubs and Shallow Mount

Vue Test Utils provides some advanced features for _stubbing_ components and directives. A _stub_ is where you replace an existing implementation of a custom component or directive with a dummy one that doesn't do anything at all, which can simplify an otherwise complex test. Let's see an example.

## Stubbing a single child component

A common example is when you would like to test something in a component that appears very high in the component hierarchy.

In this example, we have an `<App>` that renders a message, as well as a `FetchDataFromApi` component that makes an API call and renders its result.

```js
const FetchDataFromApi = {
  name: 'FetchDataFromApi',
  template: `
    <div>{{ result }}</div>
  `,
  async mounted() {
    const res = await axios.get('/api/info')
    this.result = res.data
  },
  data() {
    return {
      result: ''
    }
  }
}

const App = {
  components: {
    FetchDataFromApi
  },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <fetch-data-from-api />
  `
}
```

We do not want to make the API call in this particular test, we just want to assert the message is rendered. In this case, we could use the `stubs`, which appears in the `global` mounting option.

```js
test('stubs component with custom template', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: {
          template: '<span />'
        }
      }
    }
  })

  console.log(wrapper.html())
  // <h1>Welcome to Vue.js 3</h1><span></span>

  expect(wrapper.html()).toContain('Welcome to Vue.js 3')
})
```

Notice that the template is showing `<span></span>` where `<fetch-data-from-api />` was? We replaced it with a stub - in this case, we provided our own implementation by passing in a `template`.

You can also get a default stub, instead of providing your own:

```js
test('stubs component', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        FetchDataFromApi: true
      }
    }
  })

  console.log(wrapper.html())
  /*
    <h1>Welcome to Vue.js 3</h1>
    <fetch-data-from-api-stub></fetch-data-from-api-stub>
  */

  expect(wrapper.html()).toContain('Welcome to Vue.js 3')
})
```

This will stub out _all_ the `<FetchDataFromApi />` components in the entire render tree, regardless of what level they appear at. That's why it is in the `global` mounting option.

::: tip
To stub out you can either use the key in `components` or the name of your component. If both are given in `global.stubs` the key will be used first.
:::

## Stubbing all children components

Sometimes you might want to stub out _all_ the custom components. For example you might have a component like this:

```js
const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `
}
```

Imagine each of the `<Complex>` does something complicated, and you are only interested in testing that the `<h1>` is rendering the correct greeting. You could do something like:

```js
const wrapper = mount(ComplexComponent, {
  global: {
    stubs: {
      ComplexA: true,
      ComplexB: true,
      ComplexC: true
    }
  }
})
```

But that's a lot of boilerplate. VTU has a `shallow` mounting option that will automatically stub out all the child components:

```js {3}
test('shallow stubs out all child components', () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true
  })

  console.log(wrapper.html())
  /*
    <h1>Welcome to Vue.js 3</h1>
    <complex-a-stub></complex-a-stub>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
})
```

::: tip
If you used VTU V1, you may remember this as `shallowMount`. That method is still available, too - it's the same as writing `shallow: true`.
:::

## Stubbing all children components with exceptions

Sometimes you want to stub out _all_ the custom components, _except_ specific one. Let's consider an example:

```js
const ComplexA = {
  template: '<h2>Hello from real component!</h2>'
}

const ComplexComponent = {
  components: { ComplexA, ComplexB, ComplexC },
  template: `
    <h1>Welcome to Vue.js 3</h1>
    <ComplexA />
    <ComplexB />
    <ComplexC />
  `
}
```

By using `shallow` mounting option that will automatically stub out all the child components. If we want to explicitly opt-out of stubbing specific component, we could provide its name in `stubs` with value set to `false`

```js {3}
test('shallow allows opt-out of stubbing specific component', () => {
  const wrapper = mount(ComplexComponent, {
    shallow: true,
    global: {
      stubs: { ComplexA: false }
    }
  })

  console.log(wrapper.html())
  /*
    <h1>Welcome to Vue.js 3</h1>
    <h2>Hello from real component!</h2>
    <complex-b-stub></complex-b-stub>
    <complex-c-stub></complex-c-stub>
  */
})
```

## Stubbing an async component

In case you want to stub out an async component, then there are two behaviours. For example, you might have components like this:

```js
// AsyncComponent.js
export default defineComponent({
  name: 'AsyncComponent',
  template: '<span>AsyncComponent</span>'
})

// App.js
const App = defineComponent({
  components: {
    MyComponent: defineAsyncComponent(() => import('./AsyncComponent'))
  },
  template: '<MyComponent/>'
})
```

The first behaviour is using the key defined in your component which loads the async component. In this example we used to key "MyComponent".
It is not required to use `async/await` in the test case, because the component has been stubbed out before resolving.

```js
test('stubs async component without resolving', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        MyComponent: true
      }
    }
  })

  expect(wrapper.html()).toBe('<my-component-stub></my-component-stub>')
})
```

The second behaviour is using the name of the async component. In this example we used to name "AsyncComponent".
Now it is required to use `async/await`, because the async component needs to be resolved and then can be stubbed out by the name defined in the async component.

**Make sure you define a name in your async component!**

```js
test('stubs async component with resolving', async () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        AsyncComponent: true
      }
    }
  })

  await flushPromises()

  expect(wrapper.html()).toBe('<async-component-stub></async-component-stub>')
})
```

## Stubbing a directive

Sometimes directives do quite complex things, like perform a lot of DOM manipulation which might result in errors in your tests (due to JSDOM not resembling entire DOM behavior). A common example is tooltip directives from various libraries, which usually rely heavily on measuring DOM nodes position/sizes.

In this example, we have another `<App>` that renders a message with tooltip

```js
// tooltip directive declared somewhere, named `Tooltip`

const App = {
  directives: {
    Tooltip
  },
  template: '<h1 v-tooltip title="Welcome tooltip">Welcome to Vue.js 3</h1>'
}
```

We do not want the `Tooltip` directive code to be executed in this test, we just want to assert the message is rendered. In this case, we could use the `stubs`, which appears in the `global` mounting option passing `vTooltip`.

```js
test('stubs component with custom template', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: true
      }
    }
  })

  console.log(wrapper.html())
  // <h1>Welcome to Vue.js 3</h1>

  expect(wrapper.html()).toContain('Welcome to Vue.js 3')
})
```

::: tip
Usage of `vCustomDirective` naming scheme to differentiate between components and directives is inspired by [same approach](https://vuejs.org/api/sfc-script-setup.html#using-custom-directives) used in `<script setup>`
:::

Sometimes, we need a part of directive functionality (usually because some code relies on it). Let's assume our directive adds `with-tooltip` CSS class when executed and this is important behavior for our code. In this case we can swap `true` with our mock directive implementation

```js
test('stubs component with custom template', () => {
  const wrapper = mount(App, {
    global: {
      stubs: {
        vTooltip: {
          beforeMount(el: Element) {
            console.log('directive called')
            el.classList.add('with-tooltip')
          }
        }
      }
    }
  })

  // 'directive called' logged to console

  console.log(wrapper.html())
  // <h1 class="with-tooltip">Welcome to Vue.js 3</h1>

  expect(wrapper.classes('with-tooltip')).toBe(true)
})
```

We've just swapped our directive implementation with our own one!

::: warning
Stubbing directives won't work on functional components or `<script setup>` due to lack of directive name inside of [withDirectives](https://vuejs.org/api/render-function.html#withdirectives) function. Consider mocking directive module via your testing framework if you need to mock directive used in functional component. See https://github.com/vuejs/core/issues/6887 for proposal to unlock such functionality
:::

## Default Slots and `shallow`

Since `shallow` stubs out all the content of a components, any `<slot>` won't get rendered when using `shallow`. While this is not a problem in most cases, there are some scenarios where this isn't ideal.

```js
const CustomButton = {
  template: `
    <button>
      <slot />
    </button>
  `
}
```

And you might use it like this:

```js
const App = {
  props: ['authenticated'],
  components: { CustomButton },
  template: `
    <custom-button>
      <div v-if="authenticated">Log out</div>
      <div v-else>Log in</div>
    </custom-button>
  `
}
```

If you are using `shallow`, the slot will not be rendered, since the render function in `<custom-button />` is stubbed out. That means you won't be able to verify the correct text is rendered!

For this use case, you can use `config.renderStubDefaultSlot`, which will render the default slot content, even when using `shallow`:

```js {1,4,8}
import { config, mount } from '@vue/test-utils'

beforeAll(() => {
  config.global.renderStubDefaultSlot = true
})

afterAll(() => {
  config.global.renderStubDefaultSlot = false
})

test('shallow with stubs', () => {
  const wrapper = mount(AnotherApp, {
    props: {
      authenticated: true
    },
    shallow: true
  })

  expect(wrapper.html()).toContain('Log out')
})
```

Since this behavior is global, not on a `mount` by `mount` basis, you need to remember to enable/disable it before and after each test.

::: tip
You can also enable this globally by importing `config` in your test setup file, and setting `renderStubDefaultSlot` to `true`. Unfortunately, due to technical limitations, this behavior is not extended to slots other than the default slot.
:::

## `mount`, `shallow` and `stubs`: which one and when?

As a rule of thumb, **the more your tests resemble the way your software is used**, the more confidence they can give you.

Tests that use `mount` will render the entire component hierarchy, which is closer to what the user will experience in a real browser.

On the other hand, tests using `shallow` are focused on a specific component. `shallow` can be useful for testing advanced components in complete isolation. If you just have one or two components that are not relevant to your tests, consider using `mount` in combination with `stubs` instead of `shallow`. The more you stub, the less production-like your test becomes.

Keep in mind that whether you are doing a full mount or a shallow render, good tests focus on inputs (`props` and user interaction, such as with `trigger`) and outputs (the DOM elements that are rendered, and events), not implementation details.

So regardless of which mounting method you choose, we suggest keeping these guidelines in mind.

## Conclusion

- use `global.stubs` to replace a component or directive with a dummy one to simplify your tests
- use `shallow: true` (or `shallowMount`) to stub out all child components
- use `global.renderStubDefaultSlot` to render the default `<slot>` for a stubbed component

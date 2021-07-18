# Plugins

Plugins add global-level functionality to Vue Test Utils' API. This is the
official way to extend Vue Test Utils' API with custom logic, methods, or
functionality.

Some use cases for plugins:

1.  Aliasing existing public methods
1.  Attaching matchers to the Wrapper instance
1.  Attaching functionality to the Wrapper

## Using a Plugin

Install plugins by calling the `config.plugins.VueWrapper.install()` method
. This has to be done before you call `mount`.

The `install()` method will receive an instance of `WrapperAPI` containing both
public and private properties of the instance.

```js
// setup.js file
import { config } from '@vue/test-utils'

// locally defined plugin, see "Writing a Plugin"
import MyPlugin from './myPlugin'

// Install a plugin onto VueWrapper
config.plugins.VueWrapper.install(MyPlugin)
```

You can optionally pass in some options:

```js
config.plugins.VueWrapper.install(MyPlugin, { someOption: true })
```

Your plugin should be installed once. If you are using Jest, this should be in your Jest config's `setupFiles` or `setupFilesAfterEnv` file.

Some plugins automatically call `config.plugins.VueWrapper.install()` when
they're imported. This is common if they're extending multiple interfaces at
once. Follow the instructions of the plugin you're installing.

Check out the [Vue Community Guide](https://vue-community.org/v2/guide/ecosystem/testing.html) or [awesome-vue](https://github.com/vuejs/awesome-vue#test) for a collection of community-contributed plugins and libraries.

## Writing a Plugin

A Vue Test Utils plugin is simply a function that receives the mounted
`VueWrapper` or `DOMWrapper` instance and can modify it.

### Basic Plugin

Below is a simple plugin to add a convenient alias to map `wrapper.element` to `wrapper.$el`

```js
// setup.js
import { config } from '@vue/test-utils'

const myAliasPlugin = (wrapper) => {
  return {
    $el: wrapper.element // simple aliases
  }
}

// Call install on the type you want to extend
// You can write a plugin for any value inside of config.plugins
config.plugins.VueWrapper.install(myAliasPlugin)
```

And in your spec, you'll be able to use your plugin after `mount`.

```js
// component.spec.js
const wrapper = mount({ template: `<h1>🔌 Plugin</h1>` })
console.log(wrapper.$el.innerHTML) // 🔌 Plugin
```

### Data Test ID Plugin

The below plugin adds a method `findByTestId` to the `VueWrapper` instance. This encourages using a selector strategy relying on test-only attributes on your Vue Components.

Usage:

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
wrapper.findByTestId('name-input') // returns a VueWrapper or DOMWrapper
```

Implementation of the plugin:

```js
import { config } from '@vue/test-utils-next'

const DataTestIdPlugin = (wrapper) => {
  function findByTestId(selector) {
    const dataSelector = `[data-testid='${selector}']`
    const element = wrapper.element.querySelector(dataSelector)
    if (element) {
      return new DOMWrapper(element)
    }

    return createWrapperError('DOMWrapper')
  }

  return {
    findByTestId
  }
}

config.plugins.VueWrapper.install(DataTestIdPlugin)
```

## Featuring Your Plugin

If you're missing functionality, consider writing a plugin to extend Vue Test
Utils and submit it to be featured at [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) or [awesome-vue](https://github.com/vuejs/awesome-vue#test).

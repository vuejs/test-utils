# Миграция с Vue Test Utils v1

Обзор изменений VTU v1 -> VTU v2 и некоторых фрагментов кода, которые демонстрируют необходимые изменения. Если вы столкнулись с багом или отличием в поведение, не документированном здесь, пожалуйста [откройте issue](https://github.com/vuejs/test-utils/issues/new).

## Изменения

### `propsData` теперь `props`

В VTU v1, вы могли бы передать `props`, используя опцию монтирования `propsData`. Это сбивало с толку, потому что вы объявляли свойства внутри `props` параметра в ваших Vue компонентах. Теперь вы можете передавать `props`, используя опцию монтирования `props`. `propsData` есть и будет продолжать поддерживаться для обратной совместимости.

**До**:

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

**После**:

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

### Больше нет `createLocalVue`

Во Vue 2 это было распространенным для плагинов, чтобы изменять глобальный Vue экземпляр и прикреплять различные методы к прототипу. Начиная с Vue 3, такой вариант не нужен, потому что вы создаете новое Vue приложение, используя `createApp` вместо `new Vue`, и устанавливаете плагины с помощью `createApp(App).use(/* ... */)`.

Для избежания загрязнения глобального Vue экземпляром в Vue Test Utils v1 мы предоставили `createLocalVue` функцию и опцию монтирования `localVue`. Это должно было позволить вам иметь изолированный Vue экземпляр для каждого теста, избегая перекрестного загрязнения. Теперь это не проблема в Vue 3, поскольку плагины, миксины и т. д. не изменяют глобальный Vue экземпляр.

Для большинства вариантов, где вы ранее использовали бы `createLocalVue` и опцию монтирования `localVue` для установки плагина, миксина или директивы, теперь вы можете использовать [`global` опцию монтирования](/api/#global-components). Здесь пример компонента и теста, которые используют `localVue`, и как это выглядит сейчас (используя `global.plugins`, поскольку Vuex это плагин):

**До**:

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

**После**:

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

### `mocks` и `stubs` теперь в `global`

`mocks` и `stubs` применяются ко всем компонентам, не только к тому, который ты передаешь в `mount`. Чтобы отразить это, `mocks` и `stubs` находятся в опции монтирования `global`:

**До**:

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

**После**:

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

### `shallowMount` и `renderStubDefaultSlot`

`shallowMount` предназначался для заглушки любых пользовательских компонентов. Хотя это и имело место быть в Vue Test Utils v1, заглушенные компоненты все еще отрисовывали их стандартный `<slot />`. Хотя это было не предусмотрено, некоторые пользователям эта функция понравилась. Это поведение было исправлено в v2 - **содержимое слота для заглушенного компонента не отрисовывается**.

Дается такой код:

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

**До**:

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

**После**:

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

Вы можете включить старое поведение примерно так:

```js
import { config } from '@vue/test-utils'

config.global.renderStubDefaultSlot = true
```

### `destroy` теперь `unmount` для соответствия с Vue 3

Vue 3 переименовал `vm.$destroy` в `vm.$unmount`. Vue Test Utils последовал этому примеру; `wrapper.destroy()` теперь `wrapper.unmount()`.

### `scopedSlots` теперь объединены с `slots`

Vue 3 объединил `slot` и `scoped-slot` синтаксис в один `v-slot`, о котором вы можете прочитать в [документации](https://v3.vuejs.org/guide/migration/slots-unification.html#overview). Поскольку `slot` и `scoped-slot` объединены, опция монтирования `scopedSlots` теперь устарела, просто используйте опцию монтирования `slots` для всего.

### `slots` scope предоставляется как `params`

При использовании шаблонов строк для содержимого слота, если явно не определен тэг обертка `<template #slot-name="scopeVar">`, scope слота становится доступным как `params` объект, когда слот вычисляется.

```diff
shallowMount(Component, {
-  scopedSlots: {
+  slots: {
-    default: '<p>{{props.index}},{{props.text}}</p>'
+    default: '<p>{{params.index}},{{params.text}}</p>'
  }
})
````

### `findAll().at()` удален

`findAll()` теперь возвращает массив DOMWrappers.

**До**

```js
wrapper.findAll('[data-test="token"]').at(0);
```

**После**

```js
wrapper.findAll('[data-test="token"]')[0];
```

### `createWrapper()` удален

`createWrapper()` теперь только внутренняя функция и не может быть больше импортирована. Если вам нужен доступ к оболочке, чтобы получить DOM элемент, который не является Vue компонентом, вы можете использовать `new DOMWrapper()` конструктор.

**До**

```js
import { createWrapper } from "@vue/test-utils";

describe('App', () => {
  it('renders', () => {
    const body = createWrapper(document.body);
    expect(body.exists()).toBe(true);
  })

```

**После**

```js
import { DOMWrapper } from "@vue/test-utils";

describe('App', () => {
  it('renders', () => {
    const body = new DOMWrapper(document.body);
    expect(body.exists()).toBe(true);
  })
```

### Больше нет `ref` селектора в `findAllComponents`

`ref` синтаксис больше не поддерживается в `findAllComponents`. Вместо этого вы можете установить `data-test` атрибут и обновить селектор:

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

## Заметки по обновлению программ тестирования

> Vue Test Utils - это фреймворк агностик, т.е. вы можете использовать его с какой угодно программой тестирования, которая вам нравится.

Это утверждение лежит в основе `@vue/test-utils`. Но мы учитываем тот факт, что перенос кодовой базы и соответствующих наборов тестов в `vue@3` может занять в некоторых сценариях довольно много усилий.

Эта секция пытается обобщить некоторые распространенные проблемы, обнаруженные нашим сообществом во время их миграции, а также обновить их базовый стек программ тестирования на более современные версии. Они не имеют отношения к `@vue/test-utils`, но мы надеемся, что это поможет вам завершить этот важный шаг миграции.

### `@vue/vue3-jest` + `jest@^28` 

Если вы приняли решение и обновляете ваши инструменты тестирования к более современным версиям, имейте в виду.

#### `ReferenceError: Vue is not defined` [vue-jest#479](https://github.com/vuejs/vue-jest/issues/479)

Когда `jest-environment-jsdom` пакет используется, по умолчанию он загружается библиотеки из `package.json` [`browser` entry](https://jestjs.io/docs/configuration#testenvironmentoptions-object). Вы можете переопределить это, используя `node` импорты вместо этого, и устранить эту ошибку:

```js
// jest.config.js
module.exports = {
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  }
}
```
<br/>

#### В снапшоты теперь включены мои комментарии

Если вы используете снапшоты и коментарии просачиваются в ваши снапшоты, обратите внимание, что комментарии теперь всегда [сохраняются](https://vuejs.org/api/application.html#app-config-compileroptions-comments) и удаляются только в production версии. Вы можете переопределить это поведения, настроив `app.config.compilerOptions` для удаления комментарием из снапшотов, а также:

- через `vue-jest` [config](https://github.com/vuejs/vue-jest#compiler-options-in-vue-3).
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
- через `@vue/test-utils` [`mountingOptions.global.config`](https://test-utils.vuejs.org/api/#global) либо глобально, либо для каждого теста отдельно.

## Сравнение с v1

Это таблица для тех, кто пришел с VTU 1, в которой сравниваются две API.

### Base API

| export            | заметки                         |
| ----------------- | ------------------------------- |
| enableAutoDestroy | заменено на `enableAutoUnmount` |

### Параметры монтирования

| опция            | заметки                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| mocks            | находится в `global`                                                                            |
| propsData        | теперь называется `props`                                                                       |
| provide          | находится в `global`                                                                            |
| mixins           | находится в `global`                                                                            |
| plugins          | находится в `global`                                                                            |
| component        | находится в `global`                                                                            |
| directives       | находится в `global`                                                                            |
| attachToDocument | переименовано в `attachTo`. Смотрите [здесь](https://github.com/vuejs/vue-test-utils/pull/1492) |
| scopedSlots      | удалено. ScopedSlots объединен с `slots` в Vue 3                                                |
| context          | удалено. В отличии от Vue2, теперь это не имеет смысла.                                         |
| localVue         | удалено. Больше не требуется - в Vue 3 нет глобально экземпляра Vue для изменений.              |
| listeners        | удалено. Больше не существует в Vue 3                                                           |
| parentComponent  | удалено                                                                                         |

### Wrapper API (mount)

| метод          | заметки                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| find           | только `querySelector` синтаксис поддерживается. Используйте `findComponent(Comp)` для поиска Vue компонента |
| setValue       | работает с select, checkbox, radio button, input, textarea. Возвращает `nextTick`.                           |
| trigger        | возвращает `nextTick`. Вы можете сделать `await wrapper.find('button').trigger('click')`                     |
| destroy        | переименован в `unmount` для соответствия с Vue 3 названием хука жизненного цикла.                           |
| contains       | удалено. Используйте `find`                                                                                  |
| emittedByOrder | удалено. Используйте `emitted`                                                                               |
| setSelected    | удалено. Теперь часть `setValue`                                                                             |
| setChecked     | удалено. Теперь часть `setValue`                                                                             |
| is             | удалено                                                                                                      |
| isEmpty        | удалено. Используйте matchers, такой как [этот](https://github.com/testing-library/jest-dom#tobeempty)       |
| isVueInstance  | удалено                                                                                                      |
| name           | удалено                                                                                                      |
| setMethods     | удалено                                                                                                      |

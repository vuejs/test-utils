# Тестирование Vuex

Vuex - это всего лишь деталь реализации; для тестирования компонентов с помощью Vuex не требуется специальной обработки. Тем не менее, существуют некоторые технологии, которые помогут облегчить чтение и запись ваших тестов. Мы посмотрим на них здесь.

Это руководство предполагает, что вы знакомы с Vuex. Vuex 4 - это версия, которая работает с Vue.js 3. Прочитайте документацию [здесь](https://next.vuex.vuejs.org/).

## Простой пример

Здесь простое Vuex хранилище и компонент, который использует Vuex хранилище

```js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state: any) {
      state.count += 1
    }
  }
})
```

Хранилище просто сохраняет количество, увеличивая его, когда `increment` мутация выполняется. Это компонент, который мы будем тестировать:

```js
const App = {
  template: `
    <div>
      <button @click="increment" />
      Count: {{ count }}
    </div>
  `,
  computed: {
    count() {
      return this.$store.state.count
    }
  },
  methods: {
    increment() {
      this.$store.commit('increment')
    }
  }
}
```

## Тестирование с настоящим Vuex хранилищем

Чтобы полностью протестировать, что этот компонент и Vuex хранилище работают, мы нажмем на `<button>` и проверим, что количество увеличивается. В ваших Vue приложениях, обычно в `main.js`, вы устанавливаете Vuex примерно так:

```js
const app = createApp(App)
app.use(store)
```

Это связано с тем, что Vuex - это плагин. А плагины подключаются путем вызова `app.use`.

Vue Test Utils также позволяет вам установить плагины, используя `global.plugins` опцию монтирования.

```js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0
    }
  },
  mutations: {
    increment(state: any) {
      state.count += 1
    }
  }
})

test('vuex', async () => {
  const wrapper = mount(App, {
    global: {
      plugins: [store]
    }
  })

  await wrapper.find('button').trigger('click')

  expect(wrapper.html()).toContain('Count: 1')
})
```

После установки плагина мы используем `trigger` для нажатия на кнопку и проверки того, что `count` увеличивается. Это тип теста, который покрывает взаимодействие между различными системами (в данном случае, компонент и хранилище), известный как интеграционный тест.

## Тестирования с имитацией хранилища

Напротив, юнит тест может изолировать и протестировать компонент и хранилище отдельно. Это может быть полезным, если у вас очень большое приложение со сложным хранилищем. Для такого варианта вы можете имитировать части хранилища, в которых вы заинтересованы, используя `global.mocks`:

```js
test('vuex using a mock store', async () => {
  const $store = {
    state: {
      count: 25
    },
    commit: jest.fn()
  }

  const wrapper = mount(App, {
    global: {
      mocks: {
        $store
      }
    }
  })

  expect(wrapper.html()).toContain('Count: 25')
  await wrapper.find('button').trigger('click')
  expect($store.commit).toHaveBeenCalled()
})
```

Вместо использования настоящего Vuex хранилища и установки его через `global.plugins`, мы создали наше собственное имитированное хранилище, реализуя только те части Vuex, которые используются в компоненте (в данном случае, `state` и `commit` функции).

Хотя это может показаться удобным для тестирования хранилища в изоляции, обратите внимание, что это не даст вам предупреждений, если вы сломаете ваше Vuex хранилище. Рассматривайте с осторожностью, если вы хотите имитировать Vuex хранилище, либо используйте настоящий и учитывайте компромиссы.

## Тестирование Vuex в изоляции

Вы, возможно, захотите протестировать ваши Vuex мутации или действия в полной изоляции, особенно если они сложные. Для этого вам не нужен Vue Test Utils, поскольку Vuex хранилище - это всего лишь обычный Javascript. Ниже показано, как можно протестировать `increment` мутацию без Vue Test Utils:

```js
test('increment mutation', () => {
  const store = createStore({
    state: {
      count: 0
    },
    mutations: {
      increment(state) {
        state.count += 1
      }
    }
  })

  store.commit('increment')

  expect(store.state.count).toBe(1)
})
```

## Предустановка Vuex состояния

Иногда может быть полезным иметь Vuex хранилище в определенном состоянии для тестирования. Одна полезная техника, которую ты можешь использовать, кроме как `global.mocks`, - это создать функцию, которая оборачивает `createStore` и принимать аргумент для начального состояния. В данном примере мы расширяем `increment`, чтобы взять дополнительный аргумент, который будет добавлен к `state.count`. Если он не указан, то мы просто увеличиваем `state.count` на 1.

```js
const createVuexStore = (initialState) =>
  createStore({
    state: {
      count: 0,
      ...initialState
    },
    mutations: {
      increment(state, value = 1) {
        state.count += value
      }
    }
  })

test('increment mutation without passing a value', () => {
  const store = createVuexStore({ count: 20 })
  store.commit('increment')
  expect(store.state.count).toBe(21)
})

test('increment mutation with a value', () => {
  const store = createVuexStore({ count: -10 })
  store.commit('increment', 15)
  expect(store.state.count).toBe(5)
})
```

При помощи создания `createVuexStore` функции, которая принимает начальное состояния, мы можем легко установить начальное состояние. Это позволяет нам протестировать все пограничные варианты, но упростить наши тесты.

[Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/testing-vuex.html) имеет больше примеров для тестирования Vuex. Обратите внимание: примеры относятся к Vue.js 2 и Vue Test Utils v1. Идеи и концепты те же самые, и Vue Testing Handbook будет обновлена для Vue.js 3 и Vue Test Utils 2 в ближайшем будущем.

## Тестирование с использованием Composition API

Vuex доступен через `useStore` функцию при использовании Composition API. [Прочитайте подробнее об этом здесь](https://next.vuex.vuejs.org/guide/composition-api.html).

`useStore` может использоваться с необязательным или уникальным ключом внедрения, как обсуждалось [в Vuex документации](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function).

Это выглядит примерно так:

```js
import { createStore } from 'vuex'
import { createApp } from 'vue'

// создать глобально уникальный символ для ключа внедрения
const key = Symbol()

const App = {
  setup () {
    // используйте уникальный ключ для получения доступа к хранилищу
    const store = useStore(key)
  }
}

const store = createStore({ /* ... */ })
const app = createApp({ /* ... */ })

// укажите ключ как второй аргумент при вызове app.use(store)
app.use(store, key)
```

Для избежания повтора передачи параметра ключа, когда `useStore` используется, Vuex документация рекомендует вынесение этой логики в вспомогательную функцию и переиспользовать эту функцию вместо стандартной `useStore` функции. [Прочитайте подробнее об этом здесь](https://next.vuex.vuejs.org/guide/typescript-support.html#typing-usestore-composition-function). Подход, предоставляющий хранилище с использованием Vue Test Utils, зависит от способа использования `useStore` функции в компоненте.

### Тестирование компонентов, использующий `useStore` без ключа внедрения

Без ключа внедрения данные хранилища могут быть просто вставлены в компонент через глобальную `provide` опцию монтирования. Название внедряемого хранилища должно быть таким же, как название в компоненте т.е. "store". 

#### Пример `useStore` без ключа

```js
import { createStore } from 'vuex'

const store = createStore({
  // ...
})

const wrapper = mount(App, {
  global: {
    provide: {
      store: store
    },
  },
})
```

### Тестирование компонентов, использующий `useStore` с ключом внедрения

При использовании хранилища с ключом внедрения предыдущий подход не будет работать. Экземпляр хранилища не будет возвращаться из `useStore`. Для того, чтобы получить доступ к нужному хранилищу, идентификатор должен быть передан.

Это должен быть тот же самый ключ, которые передается в `useStore` в `setup` функции компонента или в `useStore` внутри вспомогательной функции. Поскольку JavaScript символы уникальны и не могут быть созданы снова, лучше всего экспортировать ключ из настоящего хранилища.

Вы можете либо использовать `global.provide` с корректным ключом или `global.plugins` установить хранилище и указать ключ:

#### Используя `useStore` с ключом в `global.provide`

```js
// store.js
export const key = Symbol()
```

```js
// app.spec.js
import { createStore } from 'vuex'
import { key } from './store'

const store = createStore({ /* ... */ })

const wrapper = mount(App, {
  global: {
    provide: {
      [key]: store
    },
  },
})
```

#### Используя `useStore` с ключом в `global.plugins`

```js
// store.js
export const key = Symbol()
```

```js
// app.spec.js
import { createStore } from 'vuex'
import { key } from './store'

const store = createStore({ /* ... */ })

const wrapper = mount(App, {
  global: {
    // чтобы передать параметры в плагины, используйте синтаксис массива
    plugins: [[store, key]]
  },
})
```

## Заключение

- Используйте `global.plugins` для установки Vuex как плагина
- Используйте `global.mocks` для имитации глобального объекта, таких как Vuex, для продвинутых случаев использования
- Рассмотрите тестирование сложных Vuex мутаций и действий в изоляции
- Оберните `createStore` при помощи функции, которая принимает аргумент для установки определенных сценариев в тестах

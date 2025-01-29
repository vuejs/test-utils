# Заглушки и неглубокий `mount`

Vue Test Utils предоставляет некоторые продвинутые возможности для _заглушивания_ компонентов и директив. _Заглушка_ - это когда вы заменяете существующую реализацию кастомного компонента или директивы на фиктивную, которая не делает вообще ничего, что может помочь упростить сложный тест. Давайте посмотрим на пример:

## Заглушка для одиночного дочернего компонента

Распространенным примером является ситуация, когда вы хотели бы протестировать что-то в компоненте, который находится очень высоко в иерархии компонентов.

В этом примере у нас есть `<App>`, который отрисовывает сообщение, а также  `FetchDataFromApi` компонент, который создает API вызов и отрисовывает его результат.

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

Мы не хотим делать API вызов в этом конкретном тесте, мы лишь хотим проверить, что сообщение отрисовалось. В данном случае мы могли бы использовать `stubs`, который находится `global` в опциях `mount`.

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

Обратите внимание, что шаблон показывает `<span></span>`, где был `<fetch-data-from-api />`. Мы заменили его при помощи заглушки, в данном случае мы предоставили нашу собственную реализацию, передав его в `template`.

Мы можем также получить стандартную заглушку вместо предоставления нашей собственной:

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

Заглушка работает для всех `<FetchDataFromApi />` компонентов во всем дереве компонентов, несмотря на каком уровне они находятся. Вот почему опция находится в опции `global`.

::: tip
Для заглушки нужно использовать ключ в `components` либо название вашего компонента. Если оба переданы в `global.stubs`, тогда ключ будет использоваться в первую очередь.
:::

## Заглушка для всех дочерних компонентов

Иногда вы хотите заглушить _все_ кастомные компоненты. Например, вы можете иметь компонент, как этот

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

Представьте, что каждый из `<Complex>` компонентов делает что-то сложное, и вы заинтересованы только протестировать, что `<h1>` отрисовывает правильно приветствие. Вы могли бы сделать что-то подобное:

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

Это выглядит слишком многословно. VTU имеет `shallow` опцию монтирования, которая автоматически поставит заглушку на все дочерние компоненты:

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
Если вы использовали VTU V1, вы можете вспомнить это как `shallowMount`. Этот метод все еще доступен - это то же самое, что `shallow: true`.
:::

## Заглушка для всех дочерних компонентов с исключением

Иногда вам нужно заглушить все кастомные компоненты, _исключая_ определенный. Давайте рассмотрим пример:

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

Используя опцию `shallow` монтирования, которая автоматически заглушает все дочерние компоненты. Если мы хотим явно убрать заглушку для компонента, мы могли бы указать его имя в `stubs` со значением, установленным в `false`.  

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

## Заглушка для асинхронного компонента

В случае если вы хотите заглушить асинхронные компонент, тогда существуют два способа. Например, вы можете иметь компоненты, как здесь

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

Первый способ - это использование ключа, указанного в твоем компоненте, который загружает асинхронный компонент. В данном примере мы использовали ключ "MyComponent".
Не обязательно использовать `async/await` в тесте, потому что компонент был заглушен до выполнения.

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

Второй способ - это использование названия асинхронного компонента. В этом примере мы использовали название "AsyncComponent".
Теперь обязательно использовать `async/await`, потому что асинхронный компонент необходимо выполнить, и только после будет заглушен по названию, определенному в асинхронном компоненте.

**Убедитесь, что вы указали имя в вашем асинхронном компоненте!**

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

## Заглушка для директивы

Иногда директивы делают вполне сложные вещи, например, выполняют большое количество DOM манипуляций, которые могут привести к ошибкам в ваших тестах (из-за того, что поведение JSDOM не похоже на поведение DOM). Распространенный пример - это сообщение с подсказкой (tooltip) директива из различных библиотек, которые обычно полагаются в большинстве своем на измерении размера/позиции DOM элементов.

В этом примере у нас есть другой `<App>`, который отрисовывает сообщение при помощи сообщения с подсказкой (tooltip).

```js
// tooltip директива, определенная где-то с именем `Tooltip`

const App = {
  directives: {
    Tooltip
  },
  template: '<h1 v-tooltip title="Welcome tooltip">Welcome to Vue.js 3</h1>'
}
```

Мы не хотим, чтобы код директивы `Tooltip` выполнялся, мы лишь хотим проверить, что сообщение отрисовалось. В данном случае мы могли бы использовать `stubs`, который находится в опции монтирования `global`, использующий `vTooltip`.

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
Использование `vCustomDirective` схемы наименования, чтобы отличать компоненты и директивы, вдохновлено на [том же подходе](https://vuejs.org/api/sfc-script-setup.html#using-custom-directives), использованного в `<script setup>`
:::

Иногда нам нужна часть функциональности директивы (обычно, потому что какой-то код полагается на него). Давайте рассмотрим нашу директиву, которая добавляет `with-tooltip` CSS класс, когда выполняется, и это важная часть поведения нашего кода. В данном случае мы можем заменить `true` на нашу фиктивную реализацию директивы.

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

  // 'directive called' отправлено в консоль

  console.log(wrapper.html())
  // <h1 class="with-tooltip">Welcome to Vue.js 3</h1>

  expect(wrapper.classes('with-tooltip')).toBe(true)
})
```

Мы только что заменили нашу реализацию директивы на нашу собственную!

::: warning
Заглушка директив не будет работать с функциональными компонентами или `<script setup>` благодаря отсутствию имени директивы внутри [withDirectives](https://vuejs.org/api/render-function.html#withdirectives) функции. Рассмотрите имитацию модуля директивы через ваш фреймворк тестирования, если вам нужно заглушить директиву, использованную в функциональном компоненте. Посмотрите https://github.com/vuejs/core/issues/6887 для предложений, как это можно сделать.
:::

## Слоты по умолчанию и `shallow`

Поскольку `shallow` ставит заглушку на все содержимое компонентов, любой `<slot>` не будет отрисовываться при использовании `shallow`. Хотя это не проблема в большинстве случаев, есть несколько сценариев, где это не подходит.

```js
const CustomButton = {
  template: `
    <button>
      <slot />
    </button>
  `
}
```

И ты можешь использовать примерно так:

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

Если вы используете `shallow`, слот не будет отрисовываться, поскольку функция отрисовки в `<custom-button />` заглушена. Это значит, что вы не сможете проверить отрисованный текст!

Для этого случая вам нужно использовать `config.renderStubDefaultSlot`, который отрисует содержимое слота по умолчанию, даже при использовании `shallow`:

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

Поскольку это поведение глобальное, не основанное на `mount`, вам нужно помнить о том, что нужно включить/выключить его до и после каждого теста.

::: tip
Вы можете также глобально включить эту опцию при помощи импортирования `config` в вашем файле настроек и установить `renderStubDefaultSlot` в `true`. К несчастью, из-за технических ограничений это поведение распространяется только на слоты по умолчанию.
:::

## `mount`, `shallow` и `stubs`: какой и когда?

Как правило, **чем больше ваши тесты похожи на то, как используется ваше программное обеспечение**, тем больше уверенности они дадут вам.

Тесты, которые используют `mount`, отрисуют всю иерархию компонентов, которая намного ближе к тому, с чем столкнется пользователь в реальном браузере.

С другой стороны, тесты, использующие `shallow`, сфокусированы на определенных компонентах. `shallow` может быть полезным для тестирования продвинутых компонентов в полной изоляции. Если вы имеете только один или два компонента, которые не относятся к вашим тестам, рассмотрите использование `mount` в комбинации с `stubs` вместо `shallow`. Чем больше вы добавите заглушек, тем меньше ваши тесты будут похожи на реальное использование.

Держите в голове, что используете ли вы полное монтирование или неглубокую отрисовку, хорошие тесты фокусируются на входных данных (`props` и пользовательское взаимодействие, такое как `trigger`) и выходных данных (DOM элементы, которые отрисовались и события), не детали реализации.

Поэтому, несмотря на методы монтирования, которые ты будешь использовать, мы предлагаем держать эти советы в голове.

## Заключение

- используйте `global.stubs`, чтобы заменить компонент или директиву на фиктивную для упрощения ваших тестов
- используйте `shallow: true` (или `shallowMount`) для заглушки всех ваших дочерних компонентов
- используйте `global.renderStubDefaultSlot` для отрисовки `<slot>` по умолчанию для заглушенных компонентов

---
sidebar: auto
---

# API Reference

## mount

Создает оболочку, которая содержит смонтированный и отрисованный Vue компонент для тестирования. 
Обратите внимание, что при имитации даты/таймеров при помощи Vitest, он должен быть вызван после `vi.setSystemTime`.

**Сигнатура:**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: Element | string
  attrs?: Record<string, unknown>
  data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
  props?: (RawProps & Props) | ({} extends Props ? null : never)
  slots?: { [key: string]: Slot } & { default?: Slot }
  global?: GlobalMountOptions
  shallow?: boolean
}

function mount(Component, options?: MountingOptions): VueWrapper
```

**Подробности:**

`mount` - это главный метод, предоставляемый Vue Test Utils. Он создает Vue 3 приложение, которое содержит и отрисовывает компонент для тестирования. В свою очередь, он создает оболочку для взаимодействия и проверки компонента.

```js
import { mount } from '@vue/test-utils'

const Component = {
  template: '<div>Hello world</div>'
}

test('mounts a component', () => {
  const wrapper = mount(Component, {})

  expect(wrapper.html()).toContain('Hello world')
})
```

Обратите внимание, что `mount` принимает второй параметр, чтобы определить конфигурацию состояния компонента.

**Пример: монтирование вместе с `props` компонента и Vue App плагина**

```js
const wrapper = mount(Component, {
  props: {
    msg: 'world'
  },
  global: {
    plugins: [vuex]
  }
})
```

#### options.global

В зависимости от состояния компонента вы можете настроить вышеупомянутое Vue 3 приложение при помощи [`MountingOptions.global` свойства конфига.](#global) Это было бы полезно для предоставления имитируемых данных, которые, как ожидается, будут доступны вашему компоненту.

::: tip
Если вы решили настроить общую конфигурацию для многих ваших тестов, тогда вы можете установить конфигурацию для всех ваших тестов, используя экспортированный [`config` объект.](#config)
:::

### attachTo

Определяет элемент, на который будет монтироваться компонент. Метод недоступен при использовании `renderToString`.

**Сигнатура:**

```ts
attachTo?: Element | string
```

**Подробности:**

Может быть корректным CSS селектором или [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element), связанного с документом.

Обратите внимание, что компонент добавлен к узлу, и метод не заменяет все содержимое узла. Если вы монтируете компонент на тот же самый узел в нескольких тестах, убедитесь, что отмонтировали его после каждого теста при помощи вызова `wrapper.unmount()`, он удалит отрисованные элементы.

`Component.vue`:

```vue
<template>
  <p>Vue Component</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

document.body.innerHTML = `
  <div>
    <h1>Non Vue app</h1>
    <div id="app"></div>
  </div>
`

test('mounts on a specific element', () => {
  const wrapper = mount(Component, {
    attachTo: document.getElementById('app')
  })

  expect(document.body.innerHTML).toBe(`
  <div>
    <h1>Non Vue app</h1>
    <div id="app"><div data-v-app=""><p>Vue Component</p></div></div>
  </div>
`)
})
```

### attrs

Устанавливает HTML атрибуты для компонента.

**Сигнатура:**

```ts
attrs?: Record<string, unknown>
```

**Подробности:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attrs', () => {
  const wrapper = mount(Component, {
    attrs: {
      id: 'hello',
      disabled: true
    }
  })

  expect(wrapper.attributes()).toEqual({
    disabled: 'true',
    id: 'hello'
  })
})
```

Обратите внимание, что установка `props` имеет больший приоритет, чем атрибут с тем же названием:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attribute is overridden by a prop with the same name', () => {
  const wrapper = mount(Component, {
    props: {
      message: 'Hello World'
    },
    attrs: {
      message: 'this will get overridden'
    }
  })

  expect(wrapper.props()).toEqual({ message: 'Hello World' })
  expect(wrapper.attributes()).toEqual({})
})
```

### data

Переопределяет `data` компонента. Должно быть функцией:

**Сигнатура:**

```ts
data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
```

**Подробности:**

`Component.vue`

```vue
<template>
  <div>Hello {{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'everyone'
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('data', () => {
  const wrapper = mount(Component, {
    data() {
      return {
        message: 'world'
      }
    }
  })

  expect(wrapper.html()).toContain('Hello world')
})
```

### props

Устанавливает `props` на компонент при монтировании.

**Сигнатура:**

```ts
props?: (RawProps & Props) | ({} extends Props ? null : never)
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <span>Count: {{ count }}</span>
</template>

<script>
export default {
  props: {
    count: {
      type: Number,
      required: true
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('props', () => {
  const wrapper = mount(Component, {
    props: {
      count: 5
    }
  })

  expect(wrapper.html()).toContain('Count: 5')
})
```

### slots

Устанавливает значения для слотов у компонента.

**Сигнатура:**

```ts
type Slot = VNode | string | { render: Function } | Function | Component

slots?: { [key: string]: Slot } & { default?: Slot }
```

**Подробности:**

Слоты могут быть строкой или любым валидным определением компонента(импортированным из `.vue` файла или предоставленным в inline виде).

`Component.vue`:

```vue
<template>
  <slot name="first" />
  <slot />
  <slot name="second" />
</template>
```

`Bar.vue`:

```vue
<template>
  <div>Bar</div>
</template>
```

`Component.spec.js`:

```js
import { h } from 'vue';
import { mount } from '@vue/test-utils'
import Component from './Component.vue'
import Bar from './Bar.vue'

test('renders slots content', () => {
  const wrapper = mount(Component, {
    slots: {
      default: 'Default',
      first: h('h1', {}, 'Named Slot'),
      second: Bar
    }
  })

  expect(wrapper.html()).toBe('<h1>Named Slot</h1>Default<div>Bar</div>')
})
```

### global

**Сигнатура:**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[]
  config?: Partial<Omit<AppConfig, 'isNativeTag'>>
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>
  renderStubDefaultSlot?: boolean
}
```

Вы можете настроить все `global` опции как для каждого теста, так и для всего набора тестов. [Смотрите здесь как настроить сразу все тесты по умолчанию](#config-global).

#### global.components

Регистрирует компоненты глобально для монтированного компонента.

**Сигнатура:**

```ts
components?: Record<string, Component | object>
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <div>
    <global-component />
  </div>
</template>

<script>
import GlobalComponent from '@/components/GlobalComponent'

export default {
  components: {
    GlobalComponent
  }
}
</script>
```

`GlobalComponent.vue`:

```vue
<template>
  <div class="global-component">My Global Component</div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import GlobalComponent from '@/components/GlobalComponent'
import Component from './Component.vue'

test('global.components', () => {
  const wrapper = mount(Component, {
    global: {
      components: {
        GlobalComponent
      }
    }
  })

  expect(wrapper.find('.global-component').exists()).toBe(true)
})
```

#### global.config

Настраивает [глобальную конфигурацию Vue приложения](https://v3.vuejs.org/api/application-config.html#application-config).

**Сигнатура:**

```ts
config?: Partial<Omit<AppConfig, 'isNativeTag'>>
```

#### global.directives

Регистрирует [директиву](https://v3.vuejs.org/api/directives.html#directives) глобально для смонтированного компонента.

**Сигнатура:**

```ts
directives?: Record<string, Directive>
```

**Подробности:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'

import Directive from '@/directives/Directive'

const Component = {
  template: '<div v-bar>Foo</div>'
}

test('global.directives', () => {
  const wrapper = mount(Component, {
    global: {
      directives: {
        Bar: Directive // Bar matches v-bar
      }
    }
  })
})
```

#### global.mixins

Регистрирует [mixin](https://v3.vuejs.org/guide/mixins.html) глобально для монтированного компонента.

**Сигнатура:**

```ts
mixins?: ComponentOptions[]
```

**Подробности:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.mixins', () => {
  const wrapper = mount(Component, {
    global: {
      mixins: [mixin]
    }
  })
})
```

#### global.mocks

Имитирует свойство глобального экземпляра. Может быть использовано для имитации `this.$store`, `this.$router` и т.д.

**Сигнатура:**

```ts
mocks?: Record<string, any>
```

**Подробности:**

::: warning
Он предоставляет имитацию переменных, добавленных с помощью сторонних плагинов, но не собственные свойства Vue, такие как $root, $children и т.д.
:::

`Component.vue`:

```vue
<template>
  <button @click="onClick" />
</template>

<script>
export default {
  methods: {
    onClick() {
      this.$store.dispatch('click')
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.mocks', async () => {
  const $store = {
    dispatch: jest.fn()
  }

  const wrapper = mount(Component, {
    global: {
      mocks: {
        $store
      }
    }
  })

  await wrapper.find('button').trigger('click')

  expect($store.dispatch).toHaveBeenCalledWith('click')
})
```

#### global.plugins

Устанавливает плагины на монтированный компонент.

**Сигнатура:**

```ts
plugins?: (Plugin | [Plugin, ...any[]])[]
```

**Подробности:**

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import myPlugin from '@/plugins/myPlugin'

test('global.plugins', () => {
  mount(Component, {
    global: {
      plugins: [myPlugin]
    }
  })
})
```

Чтобы использовать плагин вместе с опциями, массив опций может быть передан.

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.plugins with options', () => {
  mount(Component, {
    global: {
      plugins: [Plugin, [PluginWithOptions, 'argument 1', 'another argument']]
    }
  })
})
```

#### global.provide

Предоставляет данные, которые будут предоставлены в `setup` функции через `inject`.

**Сигнатура:**

```ts
provide?: Record<any, any>
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <div>Theme is {{ theme }}</div>
</template>

<script>
import { inject } from 'vue'

export default {
  setup() {
    const theme = inject('Theme')
    return {
      theme
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.provide', () => {
  const wrapper = mount(Component, {
    global: {
      provide: {
        Theme: 'dark'
      }
    }
  })

  console.log(wrapper.html()) //=> <div>Theme is dark</div>
})
```

Если вы используете ES6 `Symbol` для ключа в provide, вы можете использовать это как динамический ключ:

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

const ThemeSymbol = Symbol()

mount(Component, {
  global: {
    provide: {
      [ThemeSymbol]: 'value'
    }
  }
})
```

#### global.renderStubDefaultSlot

Отрисовывает `default` содерижмое слота, даже при использовании `shallow` или `shallowMount`.

**Сигнатура:**

```ts
renderStubDefaultSlot?: boolean
```

**Подробности:**

По умолчанию **false**.

`Component.vue`

```vue
<template>
  <slot />
  <another-component />
</template>

<script>
export default {
  components: {
    AnotherComponent
  }
}
</script>
```

`AnotherComponent.vue`

```vue
<template>
  <p>Another component content</p>
</template>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.renderStubDefaultSlot', () => {
  const wrapper = mount(ComponentWithSlots, {
    slots: {
      default: '<div>My slot content</div>'
    },
    shallow: true,
    global: {
      renderStubDefaultSlot: true
    }
  })

  expect(wrapper.html()).toBe(
    '<div>My slot content</div><another-component-stub></another-component-stub>'
  )
})
```

Из-за технических ограничений **это поведение не может быть расширено на слоты, отличные от слотов по умолчанию**.

#### global.stubs

Устанавливает глобальную заглушку на смонтированный компонент.

**Сигнатура:**

```ts
stubs?: Record<any, any>
```

**Подробности:**

Заглушка стоит для `Transition` и `TransitionGroup` по умолчанию.

`Component.vue`:

```vue
<template>
  <div><foo /></div>
</template>

<script>
import Foo from '@/Foo.vue'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('global.stubs using array syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: ['Foo']
    }
  })

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
})

test('global.stubs using object syntax', () => {
  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: true }
    }
  })

  expect(wrapper.html()).toEqual('<div><foo-stub></div>')
})

test('global.stubs using a custom component', () => {
  const CustomStub = {
    name: 'CustomStub',
    template: '<p>custom stub content</p>'
  }

  const wrapper = mount(Component, {
    global: {
      stubs: { Foo: CustomStub }
    }
  })

  expect(wrapper.html()).toEqual('<div><p>custom stub content</p></div>')
})
```

### shallow

Заглушка для всех дочерних компонентов из компонента.

**Сигнатура:**

```ts
shallow?: boolean
```

**Подробности:**

По умолчанию **false**.

`Component.vue`

```vue
<template>
  <a-component />
  <another-component />
</template>

<script>
export default {
  components: {
    AComponent,
    AnotherComponent
  }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('shallow', () => {
  const wrapper = mount(Component, { shallow: true })

  expect(wrapper.html()).toEqual(
    `<a-component-stub></a-component-stub><another-component-stub></another-component-stub>`
  )
})
```

::: tip
`shallowMount()` это псевдоним для монтирования компонента при помощи `shallow: true`.
:::

## Wrapper методы

Когда вы используете `mount`, `VueWrapper` возвращается с рядом полезных функций для тестирования. `VueWrapper` - это небольшая оболочка вокруг вашего экземпляра компонента.

Обратите внимание, что методы, такие как `find`, возвращают `DOMWrapper`, который является небольшой оболочкой вокруг DOM элементов в вашем компоненте и его детей. Оба реализуют схожий API.

### attributes

Возвращает атрибуты DOM элемента.

**Сигнатура:**

```ts
attributes(): { [key: string]: string }
attributes(key: string): string
attributes(key?: string): { [key: string]: string } | string
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <div id="foo" :class="className" />
</template>

<script>
export default {
  data() {
    return {
      className: 'bar'
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('attributes', () => {
  const wrapper = mount(Component)

  expect(wrapper.attributes('id')).toBe('foo')
  expect(wrapper.attributes('class')).toBe('bar')
})
```

### classes

**Сигнатура:**

```ts
classes(): string[]
classes(className: string): boolean
classes(className?: string): string[] | boolean
```

**Подробности:**

Возвращает массив классов элемента.

`Component.vue`:

```vue
<template>
  <span class="my-span" />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('classes', () => {
  const wrapper = mount(Component)

  expect(wrapper.classes()).toContain('my-span')
  expect(wrapper.classes('my-span')).toBe(true)
  expect(wrapper.classes('not-existing')).toBe(false)
})
```

### emitted

Возвращает все сгенерированные события из вашего компонента.

**Сигнатура:**

```ts
emitted<T = unknown>(): Record<string, T[]>
emitted<T = unknown>(eventName: string): undefined | T[]
emitted<T = unknown>(eventName?: string): undefined | T[] | Record<string, T[]>
```

**Подробности:**

Аргументы хранятся в массиве, поэтому вы можете проверить, какие аргументы были сгенерированы вместе с каждым событием.

`Component.vue`:

```vue
<script>
export default {
  created() {
    this.$emit('greet', 'hello')
    this.$emit('greet', 'goodbye')
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('emitted', () => {
  const wrapper = mount(Component)

  // wrapper.emitted() вернет { greet: [ ['hello'], ['goodbye'] ] }

  expect(wrapper.emitted()).toHaveProperty('greet')
  expect(wrapper.emitted().greet).toHaveLength(2)
  expect(wrapper.emitted().greet[0]).toEqual(['hello'])
  expect(wrapper.emitted().greet[1]).toEqual(['goodbye'])
})
```

### exists

Проверяет, существует ли элемент или нет.

**Сигнатура:**

```ts
exists(): boolean
```

**Подробности:**

Вы можете использовать тот же синтаксис по аналогии с `querySelector`

`Component.vue`:

```vue
<template>
  <span />
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('exists', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('span').exists()).toBe(true)
  expect(wrapper.find('p').exists()).toBe(false)
})
```

### find

Находит элемент и возвращает `DOMWrapper`, если он найден.

**Сигнатура:**

```ts
find<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>
find<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>
find<T extends Element>(selector: string): DOMWrapper<T>
find(selector: string): DOMWrapper<Element>
find<T extends Node = Node>(selector: string | RefSelector): DOMWrapper<T>;
```

**Подробности:**

Вы можете использовать такой же синтаксис, как и с `querySelector`. `find` - это, по сути, псевдоним для `querySelector`. В дополнении, вы можете найти ref элемента.

Он похож на `get`, но `find` вернет ErrorWrapper, если элемент не найден, но [`get`](#get) выбросит ошибку.

Как правило, всегда используйте `find`, когда вы проверяете что-то, что не существует. Если вы проверяете что-то, что существует, используйте [`get`](#get).

`Component.vue`:

```vue
<template>
  <span>Span</span>
  <span data-test="span">Span</span>
  <span ref="span">Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('find', () => {
  const wrapper = mount(Component)

  wrapper.find('span') //=> найдено; вернет DOMWrapper
  wrapper.find('[data-test="span"]') //=> найдено; вернет DOMWrapper
  wrapper.find({ ref: 'span' }) //=> найдено; вернет DOMWrapper
  wrapper.find('p') //=> ничего не найдено; вернет ErrorWrapper
})
```

### findAll

Похож на `find`, но вместо этого возвращает массив `DOMWrapper`.

**Сигнатура:**

```ts
findAll<K extends keyof HTMLElementTagNameMap>(selector: K): DOMWrapper<HTMLElementTagNameMap[K]>[]
findAll<K extends keyof SVGElementTagNameMap>(selector: K): DOMWrapper<SVGElementTagNameMap[K]>[]
findAll<T extends Element>(selector: string): DOMWrapper<T>[]
findAll(selector: string): DOMWrapper<Element>[]
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <span v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import BaseTable from './BaseTable.vue'

test('findAll', () => {
  const wrapper = mount(BaseTable)

  // .findAll() вернет массив DOMWrappers
  const thirdRow = wrapper.findAll('span')[2]
})
```

### findComponent

Находит экземпляр Vue компонента и вернет `VueWrapper`, если найден. В противном случае вернет `ErrorWrapper`.

**Сигнатура:**

```ts
findComponent<T extends never>(selector: string): WrapperLike
findComponent<T extends DefinedComponent>(selector: T | Exclude<FindComponentSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>
findComponent<T extends FunctionalComponent>(selector: T | string): DOMWrapper<Element>
findComponent<T extends never>(selector: NameSelector | RefSelector): VueWrapper
findComponent<T extends ComponentPublicInstance>(selector: T | FindComponentSelector): VueWrapper<T>
findComponent(selector: FindComponentSelector): WrapperLike
```

**Подробности:**

`findComponent` поддерживает несколько вариантов:

| синтаксис      | пример                        | детали                                                                                                                                                             |
| -------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| querySelector  | `findComponent('.component')` | Соответствует стандартному селектору запросов (query selector).                                                                                                    |
| Component name | `findComponent({name: 'a'})`  | Соответствует PascalCase, snake-case, camelCase                                                                                                                    |
| Component ref  | `findComponent({ref: 'ref'})` | Может использоваться только для прямых ссылок на дочерние элементы смонтированного компонента (т.е. ref должен находится на дочернем компоненте, а не внутри него) |
| SFC            | `findComponent(Component)`    | Передать импортированный компонент напрямую                                                                                                                        |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
```

`Component.vue`:

```vue
<template>
  <Foo data-test="foo" ref="foo" class="foo" />
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import Foo from '@/Foo.vue'

test('findComponent', () => {
  const wrapper = mount(Component)

  // Все следующие запросы вернули бы VueWrapper

  wrapper.findComponent('.foo')
  wrapper.findComponent('[data-test="foo"]')

  wrapper.findComponent({ name: 'Foo' })

  wrapper.findComponent({ ref: 'foo' })

  wrapper.findComponent(Foo)
})
```

:::warning
Если `ref` в компоненте ссылается на HTML элемент, `findComponent` вернет пустую оболочку. Это ожидаемое поведение.
:::

:::warning Использование с CSS селекторами
Использование `findComponent` с CSS селекторами может привести к запутанному поведению

Рассмотрите этот пример:

```js
const ChildComponent = {
  name: 'Child',
  template: '<div class="child"></div>'
}
const RootComponent = {
  name: 'Root',
  components: { ChildComponent },
  template: '<child-component class="root" />'
}
const wrapper = mount(RootComponent)
const rootByCss = wrapper.findComponent('.root') // => нашел Root компонент
expect(rootByCss.vm.$options.name).toBe('Root')
const childByCss = wrapper.findComponent('.child')
expect(childByCss.vm.$options.name).toBe('Root') // => все еще Root компонент
```

Причина такого поведения в том, что `RootComponent` и `ChildComponent` используют одинаковый DOM узел, и только первый соответствующий компонент включен для каждого уникального DOM узла
:::

:::info WrapperLike тип при использовании CSS селектора
Для примера, при использовании `wrapper.findComponent('.foo')`, VTU вернет `WrapperLike` тип. Дело в том, что функциональному компоненту мог бы потребоваться 
`DOMWrapper`, иначе `VueWrapper`. Вы можете заставить вернуть `VueWrapper`, указав правильный тип компонента:

```typescript
wrapper.findComponent('.foo') // вернет WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo') // вернет VueWrapper
wrapper.findComponent<DefineComponent>('.foo') // вернет VueWrapper
```
:::

### findAllComponents

**Сигнатура:**

```ts
findAllComponents<T extends never>(selector: string): WrapperLike[]
findAllComponents<T extends DefinedComponent>(selector: T | Exclude<FindAllComponentsSelector, FunctionalComponent>): VueWrapper<InstanceType<T>>[]
findAllComponents<T extends FunctionalComponent>(selector: string): DOMWrapper<Element>[]
findAllComponents<T extends FunctionalComponent>(selector: T): DOMWrapper<Node>[]
findAllComponents<T extends never>(selector: NameSelector): VueWrapper[]
findAllComponents<T extends ComponentPublicInstance>(selector: T | FindAllComponentsSelector): VueWrapper<T>[]
findAllComponents(selector: FindAllComponentsSelector): WrapperLike[]
```

**Подробности:**

Похож на `findComponent`, но находит все экземпляры Vue компонентов, который совпадают с селектором. Вернет массив `VueWrapper`.

:::warning
`ref` синтаксис не поддерживается в `findAllComponents`. Все остальные синтаксисы запросов будут работать.
:::

`Component.vue`:

```vue
<template>
  <FooComponent v-for="number in [1, 2, 3]" :key="number" data-test="number">
    {{ number }}
  </FooComponent>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('findAllComponents', () => {
  const wrapper = mount(Component)

  // Вернет массив VueWrapper
  wrapper.findAllComponents('[data-test="number"]')
})
```

:::warning Использование с  CSS селекторами
`findAllComponents` имеет одинаковое поведение при использовании с CSS селектором, как [findComponent](#findcomponent)
:::

### get

Получит элемент и вернет `DOMWrapper`, если найден. В противном случае выбросит ошибку.

**Сигнатура:**

```ts
get<K extends keyof HTMLElementTagNameMap>(selector: K): Omit<DOMWrapper<HTMLElementTagNameMap[K]>, 'exists'>
get<K extends keyof SVGElementTagNameMap>(selector: K): Omit<DOMWrapper<SVGElementTagNameMap[K]>, 'exists'>
get<T extends Element>(selector: string): Omit<DOMWrapper<T>, 'exists'>
get(selector: string): Omit<DOMWrapper<Element>, 'exists'>
```

**Подробности:**

Он похож на `find`, но `get` выбросит ошибку, если элемент не найден, в то время как [`find`](#find) вернет ErrorWrapper.

Как правило, всегда используйте `get`, исключая, когда вы проверяете что-то, что не существует. В этом случае используйте [`find`](#find).

`Component.vue`:

```vue
<template>
  <span>Span</span>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('get', () => {
  const wrapper = mount(Component)

  wrapper.get('span') //=> найден; вернет DOMWrapper

  expect(() => wrapper.get('.not-there')).toThrowError()
})
```

### getComponent

Получит экземпляр Vue компонента и вернет `VueWrapper`, если найден. Иначе он выбросит ошибку.

**Сигнатура:**

```ts
getComponent<T extends ComponentPublicInstance>(selector: new () => T): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: { name: string } | { ref: string } | string): Omit<VueWrapper<T>, 'exists'>
getComponent<T extends ComponentPublicInstance>(selector: any): Omit<VueWrapper<T>, 'exists'>
```

**Подробности:**

Он похож на `findComponent`, но `getComponent`выбросит ошибку, если экземпляр Vue компонента не найден, в том время как [`findComponent`](#findComponent) вернет ErrorWrapper.

**Поддерживаемый синтаксис:**

| синтаксис      | пример                       | детали                                                                                                                                                             |
| -------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| querySelector  | `getComponent('.component')` | Соответствует стандартному селектору запросов.                                                                                                                     |
| Component name | `getComponent({name: 'a'})`  | Соответствует PascalCase, snake-case, camelCase                                                                                                                    |
| Component ref  | `getComponent({ref: 'ref'})` | Может использоваться только для прямых ссылок на дочерние элементы смонтированного компонента (т.е. ref должен находится на дочернем компоненте, а не внутри него) |
| SFC            | `getComponent(Component)`    | Передать импортированный компонент напрямую                                                                                                                        |

`Foo.vue`

```vue
<template>
  <div class="foo">Foo</div>
</template>

<script>
export default {
  name: 'Foo'
}
</script>
```

`Component.vue`:

```vue
<template>
  <Foo />
</template>

<script>
import Foo from '@/Foo'

export default {
  components: { Foo }
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

import Foo from '@/Foo.vue'

test('getComponent', () => {
  const wrapper = mount(Component)

  wrapper.getComponent({ name: 'foo' }) // вернет VueWrapper
  wrapper.getComponent(Foo) // вернет VueWrapper

  expect(() => wrapper.getComponent('.not-there')).toThrowError()
})
```

### html

Вернет HTML элемента.

По умолчанию результат форматируется при помощи [`js-beautify`](https://github.com/beautify-web/js-beautify), чтобы сделать снапшоты более читабельными. Используйте `raw: true` опцию, чтобы получить неформатированную html строку.

**Сигнатура:**

```ts
html(): string
html(options?: { raw?: boolean }): string
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <div>
    <p>Hello world</p>
  </div>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('html', () => {
  const wrapper = mount(Component)

  expect(wrapper.html()).toBe(
    '<div>\n' +
    '  <p>Hello world</p>\n' +
    '</div>'
  )

  expect(wrapper.html({ raw: true })).toBe('<div><p>Hello world</p></div>')
})
```

### isVisible

Проверяет является ли элемент видимым или нет.

**Сигнатура:**

```ts
isVisible(): boolean
```

**Подробности:**

::: warning
`isVisible()` работает корректно, только если оболочка прикреплена к DOM, используя [`attachTo`](#attachTo)
:::

```js
const Component = {
  template: `<div v-show="false"><span /></div>`
}

test('isVisible', () => {
  const wrapper = mount(Component, {
    attachTo: document.body
  });

  expect(wrapper.find('span').isVisible()).toBe(false);
})
```

### props

Возвращает `props`, переданные в Vue компонент.

**Сигнатура:**

```ts
props(): { [key: string]: any }
props(selector: string): any
props(selector?: string): { [key: string]: any } | any
```

**Подробности:**

`Component.vue`:

```js
export default {
  name: 'Component',
  props: {
    truthy: Boolean,
    object: Object,
    string: String
  }
}
```

```vue
<template>
  <Component truthy :object="{}" string="string" />
</template>

<script>
import Component from '@/Component'

export default {
  components: { Component }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('props', () => {
  const wrapper = mount(Component, {
    global: { stubs: ['Foo'] }
  })

  const foo = wrapper.getComponent({ name: 'Foo' })

  expect(foo.props('truthy')).toBe(true)
  expect(foo.props('object')).toEqual({})
  expect(foo.props('notExisting')).toEqual(undefined)
  expect(foo.props()).toEqual({
    truthy: true,
    object: {},
    string: 'string'
  })
})
```

:::tip
Как правило, проверяйте влияние переданного `prop` (DOM обновление, сгенерированное событие и так далее). Это сделает тесты более мощными, чем просто проверка того, что `prop` был передан.
:::

### setData

Обновляет внутреннее свойство `data` у компонента.

**Сигнатура:**

```ts
setData(data: Record<string, any>): Promise<void>
```

**Подробности:**

`setData` не позволяет установить новые поля, которые не были определены в компоненте.

::: warning
А также, обратите внимание, что`setData` не изменяет composition API `setup()` данные.
:::

`Component.vue`:

```vue
<template>
  <div>Count: {{ count }}</div>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('setData', async () => {
  const wrapper = mount(Component)
  expect(wrapper.html()).toContain('Count: 0')

  await wrapper.setData({ count: 1 })

  expect(wrapper.html()).toContain('Count: 1')
})
```

::: warning
Вы должны использовать `await`, когда вызываете `setData`, чтобы убедиться в том, что Vue обновит DOM до того, как тест продолжится.
:::

### setProps

Обновляет `props` компонента.

**Сигнатура:**

```ts
setProps(props: Record<string, any>): Promise<void>
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ['message']
}
</script>
```

`Component.spec.js`

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('updates prop', async () => {
  const wrapper = mount(Component, {
    props: {
      message: 'hello'
    }
  })

  expect(wrapper.html()).toContain('hello')

  await wrapper.setProps({ message: 'goodbye' })

  expect(wrapper.html()).toContain('goodbye')
})
```

::: warning
Вы должны использовать `await`, когда вызываете `setProps`, чтобы убедиться в том, что Vue обновит DOM до того, как тест продолжится.
:::

### setValue

Устанавливает значение на DOM элементе. Включая:

- `<input>`
  - `type="checkbox"` и `type="radio"` обрабатываются и установится в `element.checked`.
- `<select>`
  - `<option>` обрабатывается и установится в `element.selected`.

**Сигнатура:**

```ts
setValue(value: unknown, prop?: string): Promise<void>
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <input type="text" v-model="text" />
  <p>Text: {{ text }}</p>

  <input type="checkbox" v-model="checked" />
  <div v-if="checked">The input has been checked!</div>

  <select v-model="multiselectValue" multiple>
    <option value="value1"></option>
    <option value="value2"></option>
    <option value="value3"></option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      text: '',
      checked: false,
      multiselectValue: []
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('setValue on checkbox', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input[type="checkbox"]').setValue(true)
  expect(wrapper.find('div').exists()).toBe(true)

  await wrapper.find('input[type="checkbox"]').setValue(false)
  expect(wrapper.find('div').exists()).toBe(false)
})

test('setValue on input text', async () => {
  const wrapper = mount(Component)

  await wrapper.find('input[type="text"]').setValue('hello!')
  expect(wrapper.find('p').text()).toBe('Text: hello!')
})

test('setValue on multi select', async () => {
  const wrapper = mount(Component)

  // Для select без множественного выбора
  await wrapper.find('select').setValue('value1')
  // Для select с множественным выбором
  await wrapper.find('select').setValue(['value1', 'value3'])
})
```

::: warning
Вы должны использовать `await`, когда вызываете `setValue`, чтобы убедиться в том, что Vue обновит DOM до того, как тест продолжится.
:::

### text

Возвращает текст элемента.

**Сигнатура:**

```ts
text(): string
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <p>Hello world</p>
</template>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('text', () => {
  const wrapper = mount(Component)

  expect(wrapper.find('p').text()).toBe('Hello world')
})
```

### trigger

Вызывает DOM событие, например `click`, `submit` или `keyup`.

**Сигнатура:**

```ts
interface TriggerOptions {
  code?: String
  key?: String
  keyCode?: Number
  [custom: string]: any
}

trigger(eventString: string, options?: TriggerOptions | undefined): Promise<void>
```

**Подробности:**

`Component.vue`:

```vue
<template>
  <span>Count: {{ count }}</span>
  <button @click="count++">Click me</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('trigger', async () => {
  const wrapper = mount(Component)

  await wrapper.find('button').trigger('click')

  expect(wrapper.find('span').text()).toBe('Count: 1')
})
```

Обратите внимание, что `trigger` принимает второй аргумент, чтобы передать параметры в вызываемое событие:

```js
await wrapper.trigger('keydown', { keyCode: 65 })
```

::: warning
Вы должны использовать `await`, когда вызываете `trigger`, чтобы убедиться в том, что Vue обновит DOM до того, как тест продолжится.
:::

::: warning
Некоторые события, например, нажатие на чекбокс изменяет его `v-model`, 
будет работать только, если тест использует `attachTo: document.body`. 
Иначе `change` событие не будет вызвано и `v-model` значение не изменится.
:::

### unmount

Размонтирует(удаляет) приложение из DOM.

**Сигнатура:**

```ts
unmount(): void
```

**Подробности:**

Работает только на корневом `VueWrapper`, возвращаемый из `mount`. Полезный для ручной очистки после тестов.

`Component.vue`:

```vue
<script>
export default {
  unmounted() {
    console.log('unmounted!')
  }
}
</script>
```

`Component.spec.js`:

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

test('unmount', () => {
  const wrapper = mount(Component)

  wrapper.unmount()
  // Компонент удален из DOM.
  // console.log вызвался с 'unmounted!'
})
```

## Wrapper properties

### vm

**Сигнатура:**

```ts
vm: ComponentPublicInstance
```

**Подробности:**

`Vue` экземпляр. Вы можете получить доступ ко всем [методам экземпляра](https://v3.vuejs.org/api/instance-methods.html) и [свойствам экземпляра](https://v3.vuejs.org/api/instance-properties.html).

Обратите внимание, что `vm` доступен только на `VueWrapper`.

:::tip
Как правило, проверяйте влияние переданного `prop` (DOM обновление, сгенерированное событие и так далее). Это сделает тесты более мощными, чем просто проверка того, что `prop` был передан.
:::

## shallowMount

Создает оболочку, которая содержит смонтированный и отрисованный Vue компонент для тестирования всех дочерних компонентов в виде заглушек.

**Сигнатура:**

```ts
interface MountingOptions<Props, Data = {}> {
  attachTo?: Element | string
  attrs?: Record<string, unknown>
  data?: () => {} extends Data ? any : Data extends object ? Partial<Data> : any
  props?: (RawProps & Props) | ({} extends Props ? null : never)
  slots?: { [key: string]: Slot } & { default?: Slot }
  global?: GlobalMountOptions
}

function shallowMount(Component, options?: MountingOptions): VueWrapper
```

**Подробности:**

`shallowMount` ведет себя практически, также как `mount`, но ставит заглушку на все дочерние компоненты по умолчанию. По сути `shallowMount(Component)` это псевдоним для `mount(Component, { shallow: true })`.

## enableAutoUnmount

**Сигнатура:**

```ts
enableAutoUnmount(hook: (callback: () => void) => void);
disableAutoUnmount(): void;
```

**Подробности:**

`enableAutoUnmount` позволяет автоматически уничтожить Vue оболочки. Логика уничтожения передается как обратный вызов в `hook` функцию.
Распространенное использование - это использование `enableAutoUnmount` с вспомогательными функциями демонтирования, предоставленных вашим фреймворком тестирования, такой как `afterEach`:

```ts
import { enableAutoUnmount } from '@vue/test-utils'

enableAutoUnmount(afterEach)
```

`disableAutoUnmount` может быть полезным, если вы хотите такое поведение только в определенным подмножествам тестов, и вы хотите явно отключить такое поведение.

## flushPromises

**Сигнатура:**

```ts
flushPromises(): Promise<unknown>
```

**Подробности:**

`flushPromises` выполняет все разрешенные обработчики промисов. Это помогает убедиться в том, что асинхронные операции, такие как промисы или обновление DOM случаются перед их проверкой.

Посмотрите [Выполнение HTTP запросов](/ru/guide/advanced/http-requests.md), чтобы увидеть пример `flushPromises` в действии.

## config

### config.global

**Сигнатура:**

```ts
type GlobalMountOptions = {
  plugins?: (Plugin | [Plugin, ...any[]])[]
  config?: Partial<Omit<AppConfig, 'isNativeTag'>>
  mixins?: ComponentOptions[]
  mocks?: Record<string, any>
  provide?: Record<any, any>
  components?: Record<string, Component | object>
  directives?: Record<string, Directive>
  stubs?: Stubs = Record<string, boolean | Component> | Array<string>
  renderStubDefaultSlot?: boolean
}
```

**Подробности:**

Вместо настройки опций монтирования на каждом тесте, вы можете настроить их для всего набора тестов. Они будут использоваться по умолчанию каждый раз, когда вы монтируете компонент. При желании вы можете переопределить ваши значения по умолчанию для каждого теста.

**Пример:**

Примером может быть глобальная имитация `$t` переменной из vue-i18n и компонента:

`Component.vue`:

```vue
<template>
  <p>{{ $t('message') }}</p>
  <my-component />
</template>

<script>
import MyComponent from '@/components/MyComponent'

export default {
  components: {
    MyComponent
  }
}
</script>
```

`Component.spec.js`:

```js {1,8-10,12-14}
import { config, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

const MyComponent = defineComponent({
  template: `<div>My component</div>`
})

config.global.stubs = {
  MyComponent
}

config.global.mocks = {
  $t: (text) => text
}

test('config.global mocks and stubs', () => {
  const wrapper = mount(Component)

  expect(wrapper.html()).toBe('<p>message</p><div>My component</div>')
})
```

::: tip
Помните, что это глобальное поведение, а не для каждого теста отдельно. Возможно, вам придется включать/выключать их до и после каждого теста.
:::

## компоненты

### RouterLinkStub

Компонент для заглушки Vue Router `router-link` компонента, когда вы не хотите имитировать или добавлять весь роутер.

Вы можете использовать этот компонент, чтобы найти `router-link` компонент в дереве рендеринга (render tree).

**Использование:**

Установить как заглушку в опциях монтирования:
```js
import { mount, RouterLinkStub } from '@vue/test-utils'

const wrapper = mount(Component, {
  global: {
    stubs: {
      RouterLink: RouterLinkStub,
    },
  },
})

expect(wrapper.findComponent(RouterLinkStub).props().to).toBe('/some/path')
```

**Использование со слотом:**

`RouterLinkStub` компонент поддерживает содержимое слота и вернет очень базовое значение для его свойств слота. Если вам нужны более специфические значения свойств слота для ваших тестов, рассмотрите использование [настоящего роутера](/ru/guide/advanced/vue-router.html#using-a-real-router), чтобы вы могли использовать `router-link` компонент. Как альтернатива, вы можете определить ваш собственный `RouterLinkStub` компонент с помощью копирования реализации из test-utils пакета.

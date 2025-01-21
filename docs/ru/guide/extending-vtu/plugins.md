# Плагины

Плагины добавляют функциональность глобального уровня для Vue Test Utils' API. Это официальный способ расширить Vue Test Utils' API при помощи пользовательской логики, методов или функциональности.

Некоторые варианты использования плагинов:

1. Псевдонимы для существующих доступных методов
2. Прикрепить средства сопоставления к экземпляру оболочки
3. Прикрепить функциональность к оболочке

## Оболочка плагина

### Использование плагина

Установите плагины, вызвав `config.plugins.VueWrapper.install()` метод. Это должно быть сделано перед тем, как вы вызовите `mount`.

`install()` метод получит экземпляр `WrapperAPI`, содержащий доступные и закрытые свойства экземпляра.

```js
// setup.js файл
import { config } from '@vue/test-utils'

// Локально написанный плагин, смотрите "Writing a Plugin"
import MyPlugin from './myPlugin'

// Установить плагин в VueWrapper
config.plugins.VueWrapper.install(MyPlugin)
```

Вы можете, по желанию, передать некоторые параметры:

```js
config.plugins.VueWrapper.install(MyPlugin, { someOption: true })
```

Ваш плагин должен быть установлен один раз. Если вы используете Jest, это должно быть сделано в вашем Jest `setupFiles` или `setupFilesAfterEnv` конфиг файле.

Некоторые плагины автоматически вызывают `config.plugins.VueWrapper.install()`, когда их импортируют. Это распространено, если они расширяют несколько интерфейсов одновременно. Следуйте инструкциям плагина, который вы используете.

Посмотрите [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) или [awesome-vue](https://github.com/vuejs/awesome-vue#test) для коллекции плагинов и библиотек, предоставленных сообществом.

### Написание плагина

Vue Test Utils плагин - это просто функция, которая получает смонтированный `VueWrapper` или `DOMWrapper` экземпляр и может модифицировать его.

#### Базовый плагин

Ниже указан простой плагин для добавления удобного псевдонима для соответствия `wrapper.element` к `wrapper.$el`

```js
// setup.js
import { config } from '@vue/test-utils'

const myAliasPlugin = (wrapper) => {
  return {
    $el: wrapper.element // простые псевдонимы
  }
}

// Вызовите установку для типа, который вы хотите расширить
// Вы можете написать плагин для любого значения внутри config.plugins
config.plugins.VueWrapper.install(myAliasPlugin)
```

И в вашем тесте вы можете использовать ваш плагин после `mount`.

```js
// component.spec.js
const wrapper = mount({ template: `<h1>🔌 Plugin</h1>` })
console.log(wrapper.$el.innerHTML) // 🔌 Plugin
```

#### Data Test ID Плагин

Ниже плагин добавляет метод `findByTestId` к `VueWrapper` экземпляру. Это поощряет использование стратегию селекторов, полагающихся только на тестовые атрибуты в ваших Vue компонентах.

Использование:

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
wrapper.findByTestId('name-input') // возвращает VueWrapper или DOMWrapper
```

Реализация плагина:

```js
import { config, DOMWrapper} from '@vue/test-utils'

const DataTestIdPlugin = (wrapper) => {
  function findByTestId(selector) {
    const dataSelector = `[data-testid='${selector}']`
    const element = wrapper.element.querySelector(dataSelector)
    return new DOMWrapper(element)
  }

  return {
    findByTestId
  }
}

config.plugins.VueWrapper.install(DataTestIdPlugin)
```

## Stubs Plugin

`config.plugins.createStubs` позволяет перезаписать стандартное создание заглушек, предоставляемое VTU.

Некоторые варианты использования:
* Вы хотите добавить больше логики в заглушки (например, именованные слоты)
* Вы хотите использовать различные заглушки для различных компонентов (например, заглушки для компонентов из библиотеки)

### Использование

```typescript
config.plugins.createStubs = ({ name, component }) => {
  return defineComponent({
    render: () => h(`custom-${name}-stub`)
  })
}
```

Это функция будет вызвана каждый раз, когда VTU генерирует заглушку либо из
```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: true
    }
  }
})
```

либо

```typescript
const wrapper = shallowMount(Component)
```

Но не будет вызвана, когда вы явно укажете заглушку

```typescript
const wrapper = mount(Component, {
  global: {
    stubs: {
      ChildComponent: { template: '<child-stub/>' }
    }
  }
})
```

## Использование плагина с TypeScript

Для использования вашего пользовательского плагина с [TypeScript](https://www.typescriptlang.org/) вам нужно объявить вашу пользовательскую функцию. Следовательно, добавьте файл, названный `vue-test-utils.d.ts`, с следующим содержимым:

```typescript
import { DOMWrapper } from '@vue/test-utils';

declare module '@vue/test-utils' {
  interface VueWrapper {
    findByTestId(testId: string): DOMWrapper[];
  }
}
```

## Опубликуйте ваш плагин

Если вам не хватает возможностей, рассмотрите написание плагина для расширения Vue Test Utils и опубликуйте его в [Vue Community Guide](https://vue-community.org/guide/ecosystem/testing.html) или [awesome-vue](https://github.com/vuejs/awesome-vue#test).

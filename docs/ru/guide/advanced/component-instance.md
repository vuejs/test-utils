# Экземпляр компонента

[`mount`](/api/#mount) возвращает `VueWrapper` с множеством удобных методов для тестирования Vue компонентов. Иногда вы можете захотеть получить доступ к Vue экземпляру. Вы можете получить доступ к нему с помощью `vm` свойства.

## Простой пример

Здесь простой компонент, который объединяет props и data для отрисовки приветствия

```ts
test('renders a greeting', () => {
  const Comp = {
    template: `<div>{{ msg1 }} {{ msg2 }}</div>`,
    props: ['msg1'],
    data() {
      return {
        msg2: 'world'
      }
    }
  }

  const wrapper = mount(Comp, {
    props: {
      msg1: 'hello'
    }
  })

  expect(wrapper.html()).toContain('hello world')
})
```

Давайте посмотрим, что доступно на `vm` при помощи `console.log(wrapper.vm)`:

```js
{
  msg1: [Getter/Setter],
  msg2: [Getter/Setter],
  hasOwnProperty: [Function]
}
```

Мы видим как `msg1`, так и `msg2`! Такие вещи, как `methods` и `computed` свойства отобразятся тоже, если они определены. Во время написания теста, хотя в общем рекомендуется проверять DOM (например, используя `wrapper.html()`), в некоторых редких случаях вы можете захотеть получить доступ к Vue экземпляру. 

## Использование `getComponent` и `findComponent`

`getComponent` и `findComponent` возвращает `VueWrapper` - сильно похожий на то, что вернет `mount`. Это значит, что ты можешь также получить доступ ко всем таким же свойствам, включая `vm`, от результата `getComponent` или `findComponent`.

Здесь простой пример:

```js
test('asserts correct props are passed', () => {
  const Foo = {
    props: ['msg'],
    template: `<div>{{ msg }}</div>`
  }

  const Comp = {
    components: { Foo },
    template: `<div><foo msg="hello world" /></div>`
  }

  const wrapper = mount(Comp)

  expect(wrapper.getComponent(Foo).vm.msg).toBe('hello world')
  expect(wrapper.getComponent(Foo).props()).toEqual({ msg: 'hello world' })
})
```

Для более тщательного способа протестировать это, могла бы стать проверка отрисованного содержимого. Это значит, что вы проверяете, что правильный prop передан *и* отрисован.


:::warning WrapperLike тип при использовании CSS селектора
При использовании `wrapper.findComponent('.foo')`, например, когда VTU вернет `WrapperLike` тип. Потому что функциональным компонентам мог понадобиться `DOMWrapper`, иначе `VueWrapper`. Вы можете заставить вернуть `VueWrapper`, передав правильный тип компонента:

```typescript
wrapper.findComponent('.foo') // вернет WrapperLike
wrapper.findComponent<typeof FooComponent>('.foo') // вернет VueWrapper
wrapper.findComponent<DefineComponent>('.foo') // вернет VueWrapper
```
:::

## Заключение

- Используйте `vm` для получения доступа к внутреннему Vue экземпляру
- `getComponent` и `findComponent` возвращают Vue оболочку. Эти Vue экземпляры также доступны через `vm`

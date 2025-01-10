# Обработка события

Vue компоненты взаимодействуют друг с другом через свойства компонента и с помощью генерации событий, используя `$emit`. В этом руководстве, мы посмотрим, как проверить, что события корректно генерируются, используя `emitted()` функцию.

Эта статья также доступна как [короткое видео](https://www.youtube.com/watch?v=U_j-nDur4oU&list=PLC2LZCNWKL9ahK1IoODqYxKu5aA9T5IOA&index=14).

## Счетчик компонент

Здесь простой `<Counter>` компонент. В нем есть кнопка, которая, когда нажата, увеличивает внутреннюю count переменную и генерирует его значение:

```js
const Counter = {
  template: '<button @click="handleClick">Increment</button>',
  data() {
    return {
      count: 0
    }
  },
  methods: {  
    handleClick() {
      this.count += 1
      this.$emit('increment', this.count)
    }
  }
}
```
Для полного тестирования компонента нам нужно проверить, что `increment` событие было сгенерировано с последним `count` значением.

## Проверка сгенерированных событий

Для этого мы будем полагаться на `emitted()` метод. Он **вернет объект со всеми событиями, которые были сгенерированы компонентом**, и их аргументами в массиве. Давайте посмотрим, как это работает:

```js
test('emits an event when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  expect(wrapper.emitted()).toHaveProperty('increment')
})
```

> Если ты еще не видел `trigger()` до этого, не беспокойся. Он используется для имитации действий пользователя. Ты можешь узнать больше в [Формы](/ru/guide/essentials/forms).

Обратите внимание, что `emitted()` возвращает объект, где каждый ключ совпадает с генерированным событием. В данном случае, `increment`.

Этот тест должен пройти успешно. Мы должны быть уверены, что мы сгенерировали событие с соответствующим названием.

## Проверка аргументов события

Это хорошо, но мы можем сделать лучше! Нам нужно проверить, что мы генерируем верные аргументы, когда вызываем `this.$emit('increment', this.count)`.

Наш следующий шаг - это проверить, что событие содержит `count` значение. Мы сделаем так, с помощью передачи аргументов в `emitted()`.

```js {9}
test('emits an event with count when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  // `emitted()` принимает аргумент. Он вернет массив 
  // со всеми вхождениями для `this.$emit('increment')`.
  const incrementEvent = wrapper.emitted('increment')

  // Мы вызвали "clicked" дважды, поэтому массив `increment` должен
  // иметь два значения.
  expect(incrementEvent).toHaveLength(2)

  // Проверить результат первого клика.
  // Убедиться, что значение в массиве.
  expect(incrementEvent[0]).toEqual([1])

  // После результат второго клика.
  expect(incrementEvent[1]).toEqual([2])
})
```

Давайте подведем итог и рассмотрим вернувшиеся значения от `emitted()`. Каждое из этих ключей содержит различные значения, сгенерированных во время теста:

```js
// console.log(wrapper.emitted('increment'))
;[
  [1], // при первом вызове значение `count` равно 1
  [2] // при втором вызове значение `count` равно 2
]
```

## Проверка сложных событий

Представьте, что сейчас нашему `<Counter>` компоненту нужно сгенерировать событие с объектом, с указанием дополнительной информации. Например, нам нужно сказать, чтобы любой родительский компонент прослушивал `@increment` событие, является ли `count` четным или нечетным:

```js {12-15}
const Counter = {
  template: `<button @click="handleClick">Increment</button>`,
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick() {
      this.count += 1

      this.$emit('increment', {
        count: this.count,
        isEven: this.count % 2 === 0
      })
    }
  }
}
```

Как делали раньше, нам нужно вызвать `click` событие на `<button>` элементе. После, мы используем `emitted('increment')`, чтобы убедиться в правильных сгенерированных значениях.

```js
test('emits an event with count when clicked', () => {
  const wrapper = mount(Counter)

  wrapper.find('button').trigger('click')
  wrapper.find('button').trigger('click')

  // Мы вызвали "clicked" дважды, поэтому массив `increment` должен
  // иметь два значения.
  expect(wrapper.emitted('increment')).toHaveLength(2)

  // После, мы должны убедиться, что каждый элемент из `wrapper.emitted('increment')`
  // содержит массив с ожидаемым объектом.
  expect(wrapper.emitted('increment')[0]).toEqual([
    {
      count: 1,
      isEven: false
    }
  ])

  expect(wrapper.emitted('increment')[1]).toEqual([
    {
      count: 2,
      isEven: true
    }
  ])
})
```

Тестирование сложных аргументов событий, таких как объекты, никак не отличается от тестирования простых значений, таких как числа или строки.

## Composition API

Если вы используете Composition API, вы вызовите `context.emit()` вместо `this.$emit()`. `emitted()` фиксирует события в обоих случаях, поэтому ты можешь тестировать компоненты, используя такой же алгоритм, описанный здесь.

## Заключение

- Используйте `emitted()` для получения доступа к событиям, сгенерированным Vue компонентом.
- `emitted(eventName)` возвращает массив, где каждый элемент представляет собой одно сгенерированное событие.
- Аргументы хранятся в `emitted(eventName)[index]` в массиве, в том же порядке, в каком они были сгенерированы.

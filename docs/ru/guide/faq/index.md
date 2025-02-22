# Ответы на вопросы

[[toc]]

## Имитация даты и таймера при помощи Vitest

Vue планировщик зависит от системного времени. Убедитесь, что смонтировали компоненты
*после* вызова `vi.setSystemTime`, поскольку Vue зависит от его побочных эффектов.
Монтирование компонентов до вызова `vi.setSystemTime` может вызвать поломки в реактивности.

Смотрите [vuejs/test-utils#2074](https://github.com/vuejs/test-utils/issues/2074).

## Vue warn: Failed setting prop

```
[Vue warn]: Failed setting prop "prefix" on <component-stub>: value foo is invalid.
TypeError: Cannot set property prefix of #<Element> which has only a getter
```

Это предупреждение показывается в случае, если вы используете `shallowMount` или `stubs` с именем свойства, который идет вместе с [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element).

Распространенные свойства, которые используются с `Element`:

* `attributes`
* `children`
* `prefix`

Смотрите: https://developer.mozilla.org/en-US/docs/Web/API/Element

**Возможные решения**

1. Используете `mount` вместо `shallowMount` для отрисовки без заглушек
2. Игнорируйте предупреждения с помощью имитации `console.warn`
3. Переименуйте свойство, чтобы оно не конфликтовало с `Element` свойствами

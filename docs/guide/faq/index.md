# FAQ

[[toc]]

## Mocking Dates and Timers with Vitest

Vue's scheduler depends on the system time. Make sure to mount components
*after* calling `vi.setSystemTime`, since Vue depends on its side effects.
Mounting components before calling `vi.setSystemTime` may cause breaks in
reactivity.

See [vuejs/test-utils#2074](https://github.com/vuejs/test-utils/issues/2074).

## Vue warn: Failed setting prop

```
[Vue warn]: Failed setting prop "prefix" on <component-stub>: value foo is invalid.
TypeError: Cannot set property prefix of #<Element> which has only a getter
```

This warning is shown in case you are using `shallowMount` or `stubs` with a property name that is shared with [`Element`](https://developer.mozilla.org/en-US/docs/Web/API/Element).

Common property names that are shared with `Element`:
* `attributes`
* `children`
* `prefix`

See: https://developer.mozilla.org/en-US/docs/Web/API/Element

**Possible solutions**

1. Use `mount` instead of `shallowMount` to render without stubs
2. Ignore the warning by mocking `console.warn`
3. Rename the prop to not clash with `Element` properties

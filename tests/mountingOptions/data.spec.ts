import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'

import { mount } from '../../src'

describe('mounting options: data', () => {
  it('merges data from mounting options with component', () => {
    const Comp = defineComponent({
      data() {
        return {
          foo: 'foo',
          bar: 'bar'
        }
      },
      render() {
        return h('div', `Foo is ${this.foo} bar is ${this.bar}`)
      }
    })

    const wrapper = mount(Comp, {
      data() {
        return {
          foo: 'qux'
        }
      }
    })

    expect(wrapper.text()).toBe('Foo is qux bar is bar')
  })

  it('works with immediate watchers', () => {
    const Comp = defineComponent({
      data() {
        return {
          foo: 'original',
          bar: ''
        }
      },
      watch: {
        foo: {
          handler() {
            this.bar = this.foo
          },
          immediate: true
        }
      },
      render() {
        return h('div', `Foo is ${this.foo} bar is ${this.bar}`)
      }
    })

    const wrapper = mount(Comp, {
      data() {
        return {
          foo: 'from test'
        }
      }
    })

    expect(wrapper.text()).toBe('Foo is from test bar is from test')
  })

  it('keeps Set objects when merging data into setup() state', () => {
    const Comp = defineComponent({
      setup() {
        return { selected: ref(new Set([1])) }
      },
      render() {
        return h('div', `Selected: ${Array.from(this.selected).join(',')}`)
      }
    })

    const wrapper = mount(Comp, {
      data() {
        return {
          selected: new Set([2, 3])
        }
      }
    })

    expect(wrapper.text()).toBe('Selected: 2,3')
  })

  it('throws when used on functional component', () => {
    expect(() =>
      mount(() => '<div />', {
        data: () => ({ foo: 1 })
      })
    ).toThrowError('data() option is not supported on functional components')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'

import { mount } from '../src'

describe('setData', () => {
  it('sets component data', async () => {
    const Component = {
      template: '<div>{{ foo }}</div>',
      data: () => ({ foo: 'bar' })
    }

    const wrapper = mount(Component)
    expect(wrapper.html()).toContain('bar')

    await wrapper.setData({ foo: 'qux' })
    expect(wrapper.html()).toContain('qux')
  })

  // This was a problem in V1
  // See: https://github.com/vuejs/vue-test-utils/issues/1756
  // Making sure it does not regress here.
  it('triggers a watcher', async () => {
    const Comp = defineComponent({
      template: `<div />`,
      data() {
        return {
          myObject: {
            key: 'value'
          },
          watchCounter: 0
        }
      },
      watch: {
        myObject: {
          immediate: true,
          handler() {
            this.watchCounter += 1
          }
        }
      }
    })

    const initial = 'value'
    const expected = 'something else'
    const wrapper = mount(Comp)
    expect(wrapper.vm.myObject.key).toBe(initial)
    expect(wrapper.vm.watchCounter).toBe(1)

    await wrapper.setData({ myObject: { key: expected } })
    expect(wrapper.vm.myObject.key).toEqual(expected)
    expect(wrapper.vm.watchCounter).toBe(2)
  })

  it('causes nested nodes to re-render', async () => {
    const Component = {
      template: `<div><div v-if="show" id="show">Show</div></div>`,
      data: () => ({ show: false })
    }

    const wrapper = mount(Component)

    expect(wrapper.find('#show').exists()).toBe(false)

    await wrapper.setData({ show: true })

    expect(wrapper.find('#show').exists()).toBe(true)
  })

  it('updates a single property of a complex object', async () => {
    const Component = {
      template: `<div>{{ complexObject.string }}. bar: {{ complexObject.foo.bar }}</div>`,
      data: () => ({
        complexObject: {
          string: 'will not change',
          foo: {
            bar: 'old val'
          }
        }
      })
    }

    const wrapper = mount(Component)

    expect(wrapper.html()).toContain('will not change. bar: old val')

    await wrapper.setData({
      complexObject: {
        foo: {
          bar: 'new val'
        }
      }
    })

    expect(wrapper.html()).toContain('will not change. bar: new val')
  })

  it('does not set new properties', async () => {
    vi.spyOn(console, 'warn').mockImplementationOnce(() => {})

    const Component = {
      template: `<div>{{ foo || 'fallback' }}</div>`
    }

    const wrapper = mount(Component)

    expect(wrapper.html()).toContain('fallback')

    expect(() => wrapper.setData({ foo: 'bar' })).toThrowError(
      'Cannot add property foo'
    )
  })

  it('does not modify composition API setup data', async () => {
    const Component = defineComponent({
      template: `<div>Count is: {{ count }}</div>`,
      setup: () => ({ count: ref(1) })
    })
    const wrapper = mount(Component)

    expect(wrapper.html()).toContain('Count is: 1')

    expect(() => wrapper.setData({ count: 2 })).toThrowError(
      'Cannot add property count'
    )
  })

  // https://github.com/vuejs/test-utils/issues/538
  it('updates data set via data mounting option using setData', async () => {
    const Comp = defineComponent({
      template: `
        <div>{{ isFieldNull ? 'It is null' : 'It is not null' }}</div>
      `,
      data() {
        return {
          field: null
        }
      },
      computed: {
        isFieldNull() {
          return this.field === null
        }
      }
    })

    const wrapper = mount(Comp, {
      data() {
        return {
          field: null
        }
      }
    })

    expect(wrapper.vm.isFieldNull).toBe(true)
    expect(wrapper.html()).toContain('It is null')

    await wrapper.setData({ field: 10 })
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toContain('It is not null')
    expect(wrapper.vm.field).toEqual(10)
    expect(wrapper.vm.isFieldNull).toBe(false)
  })

  it('overwrites array with new value', async () => {
    const Comp = {
      template: `
        <div>{{state.items.join(",")}}</div>
      `,
      data() {
        return {
          state: {
            items: ['1']
          }
        }
      }
    }

    const wrapper = mount(Comp)
    expect(wrapper.html()).toMatchInlineSnapshot(`"<div>1</div>"`)

    await wrapper.setData({ state: { items: ['2', '3'] } })
    expect(wrapper.html()).toMatchInlineSnapshot(`"<div>2,3</div>"`)
  })

  it('should keep Date object on setData', async () => {
    const wrapper = mount(
      defineComponent({
        template: '<div/>',
        props: { modelValue: Date },
        data() {
          return { value: this.modelValue }
        }
      }),
      {
        props: {
          modelValue: new Date('2022-08-10T12:15:54Z')
        }
      }
    )

    expect(wrapper.vm.value).toBeInstanceOf(Date)
    expect(wrapper.vm.value!.toISOString()).toBe('2022-08-10T12:15:54.000Z')

    await wrapper.setData({
      value: new Date('2022-08-11T12:15:54Z')
    })

    expect(wrapper.vm.value).toBeInstanceOf(Date)
    expect(wrapper.vm.value!.toISOString()).toBe('2022-08-11T12:15:54.000Z')
  })

  it('should retain prototype methods for constructed objects when calling setData', async () => {
    const expectedResult = 'success!'
    class TestClass {
      constructor(readonly name: string) {}
      getResult(): string {
        return expectedResult
      }
    }

    const wrapper = mount(
      defineComponent({
        template: '<div/>',
        data() {
          return { value: new TestClass('test1') }
        },
        methods: {
          getResult() {
            return `${this.value.name}: ${this.value.getResult()}`
          }
        }
      })
    )

    expect(wrapper.vm.getResult()).toStrictEqual(`test1: ${expectedResult}`)

    await wrapper.setData({
      value: new TestClass('test2')
    })

    expect(wrapper.vm.getResult()).toStrictEqual(`test2: ${expectedResult}`)
  })

  // https://github.com/vuejs/test-utils/issues/2257
  it('should ignore prototype methods when using setData on objects', async () => {
    const wrapper = mount(
      defineComponent({
        template: '<div />',
        data() {
          return {
            firstArray: [],
            secondArray: []
          }
        }
      })
    )

    await wrapper.setData({
      firstArray: [1, 2],
      secondArray: [3, 4]
    })

    expect(wrapper.vm.$data).toStrictEqual({
      firstArray: [1, 2],
      secondArray: [3, 4]
    })
  })
})

import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '../src'
import { promisify } from '../src/utils/promisify'
import { simulateDelay } from './utils'
import PromisifyComponent from './components/PromisefyComponent.vue'

describe('promisify', async () => {
  it('ignores synchronous method', async () => {
    const Component = defineComponent({
      template: '<button @click="clickHandler()"/>',
      data: () => ({
        clicked: false
      }),
      methods: {
        clickHandler() {
          this.clicked = true
        }
      }
    })

    const wrapper = mount(Component)
    const promises = promisify(wrapper)

    await wrapper.find('button').trigger('click')

    expect(promises).toHaveLength(0)
    expect(wrapper.vm.clicked).toBe(true)
  })

  it('creates a promise for asynchronous method', async () => {
    const Component = defineComponent({
      template: '<button @click="clickHandler()"/>',
      data: () => ({
        clicked: false
      }),
      methods: {
        async clickHandler() {
          await simulateDelay({ delayInMs: 100 })
          this.clicked = true
        }
      }
    })

    const wrapper = mount(Component)
    const promises = promisify(wrapper)

    await wrapper.find('button').trigger('click')

    expect(promises).toHaveLength(1)

    await Promise.all(promises)

    expect(wrapper.vm.clicked).toBe(true)
  })

  it('creates a promise for asynchronous method (setup function)', async () => {
    const Component = defineComponent({
      template: '<button @click="clickHandler()"/>',
      setup() {
        const clicked = ref(false)

        const clickHandler = async () => {
          await simulateDelay({ delayInMs: 100 })
          clicked.value = true
        }

        return { clicked, clickHandler }
      }
    })

    it('creates a promise for asynchronous method (SFCs)', async () => {
      const wrapper = mount(PromisifyComponent)
      const promises = promisify(wrapper)

      await wrapper.find('button').trigger('click')

      expect(promises).toHaveLength(1)

      await Promise.all(promises)

      expect(wrapper.vm.clicked).toBe(true)
    })

    const wrapper = mount(Component)
    const promises = promisify(wrapper)

    await wrapper.find('button').trigger('click')

    expect(promises).toHaveLength(1)

    await Promise.all(promises)

    expect(wrapper.vm.clicked).toBe(true)
  })

  it('creates a promise for asynchronous method with parameters', async () => {
    const Component = defineComponent({
      template: '<button @click="clickHandler(...$props.params)"/>',
      props: {
        params: {
          type: Array,
          default: () => []
        }
      },
      data: () => ({
        clicked: false,
        args: []
      }),
      methods: {
        async clickHandler(...args: []) {
          await simulateDelay({ delayInMs: 100 })
          this.clicked = true
          this.args = args
        }
      }
    })

    const wrapper = mount(Component, {
      props: {
        params: [1, 2, 3]
      }
    })
    const promises = promisify(wrapper)

    await wrapper.find('button').trigger('click')

    expect(promises).toHaveLength(1)

    await Promise.all(promises)

    expect(wrapper.vm.clicked).toBe(true)
    expect(wrapper.vm.args).toEqual(wrapper.vm.$props.params)
  })

  it('creates a promise for asynchronous method that returns value', async () => {
    const Component = defineComponent({
      template: '<button @click="clickHandler()"/>',
      data: () => ({
        clicked: false
      }),
      methods: {
        async clickHandler() {
          await simulateDelay({ delayInMs: 100 })
          this.clicked = await this.getTrue()
        },
        async getTrue() {
          return true
        }
      }
    })

    const wrapper = mount(Component)
    const promises = promisify(wrapper)

    await wrapper.find('button').trigger('click')

    expect(promises).toHaveLength(1)

    await Promise.all(promises)

    expect(wrapper.vm.clicked).toBe(true)
  })

  it('creates multiple promises for asynchronous method', async () => {
    const Component = defineComponent({
      template: '<button @click="clickHandler()"/>',
      data: () => ({
        count: 0
      }),
      methods: {
        async clickHandler() {
          await simulateDelay({ delayInMs: 100 })
          this.count++
        }
      }
    })

    const wrapper = mount(Component)
    const promises = promisify(wrapper)

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')

    expect(promises).toHaveLength(2)

    await Promise.all(promises)

    expect(wrapper.vm.count).toEqual(2)
  })
})

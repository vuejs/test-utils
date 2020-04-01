import { defineComponent, h, onMounted, nextTick, onBeforeMount } from 'vue'

import { mount } from '../src'

describe('lifecycles', () => {
  it('calls onMounted', async () => {
    const beforeMountFn = jest.fn()
    const onBeforeMountFn = jest.fn()
    const onMountFn = jest.fn()
    const Component = defineComponent({
      beforeMount() {
        beforeMountFn()
      },
      setup() {
        onMounted(onMountFn)
        onBeforeMount(onBeforeMountFn)
        return () => h('div')
      }
    })

    mount(Component)
    await nextTick()
    expect(beforeMountFn).toHaveBeenCalled()
    expect(onBeforeMountFn).toHaveBeenCalled()
    expect(onBeforeMountFn).toHaveBeenCalled()
  })
})

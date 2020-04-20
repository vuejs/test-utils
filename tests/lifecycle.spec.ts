import {
  defineComponent,
  h,
  onMounted,
  nextTick,
  onBeforeMount,
  onUnmounted,
  onBeforeUnmount,
  ref
} from 'vue'

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

  it('calls onUnmounted', async () => {
    const beforeUnmountFn = jest.fn()
    const onBeforeUnmountFn = jest.fn()
    const onUnmountFn = jest.fn()
    const Component = defineComponent({
      beforeUnmount: beforeUnmountFn,
      setup() {
        onUnmounted(onUnmountFn)
        onBeforeUnmount(onBeforeUnmountFn)

        return () => h('div')
      }
    })

    const wrapper = mount(Component)
    await nextTick()
    expect(beforeUnmountFn).not.toHaveBeenCalled()
    expect(onBeforeUnmountFn).not.toHaveBeenCalled()
    expect(onUnmountFn).not.toHaveBeenCalled()

    const removeChildSpy = jest.spyOn(
      wrapper.element.parentElement,
      'removeChild'
    )

    const el = wrapper.element

    wrapper.unmount()

    expect(beforeUnmountFn).toHaveBeenCalled()
    expect(onBeforeUnmountFn).toHaveBeenCalled()
    expect(onUnmountFn).toHaveBeenCalled()

    expect(removeChildSpy).toHaveBeenCalledWith(el)
  })
})

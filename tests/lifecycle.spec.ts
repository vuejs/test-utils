import {
  defineComponent,
  h,
  onMounted,
  nextTick,
  onBeforeMount,
  onUnmounted,
  onBeforeUnmount
} from 'vue'

import { mount } from '../src'

describe('lifecycles', () => {
  it('calls onMounted', async () => {
    const beforeMountFn = vi.fn()
    const onBeforeMountFn = vi.fn()
    const onMountFn = vi.fn()
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
    expect(onMountFn).toHaveBeenCalled()
    expect(onBeforeMountFn).toHaveBeenCalled()
  })

  it('calls onUnmounted', async () => {
    const beforeUnmountFn = vi.fn()
    const onBeforeUnmountFn = vi.fn()
    const onUnmountFn = vi.fn()
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

    const removeChildSpy = vi.spyOn(
      wrapper.element.parentElement!,
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

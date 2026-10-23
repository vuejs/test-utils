import { describe, expect, it, vi } from 'vitest'
import {
  Teleport,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  ref
} from 'vue'
import { mount } from '../../src'

describe('stubbed Teleport keeps children mounted across re-renders', () => {
  it('teleport: true does not remount teleported children on re-render', async () => {
    const onMountedSpy = vi.fn()
    const onUnmountedSpy = vi.fn()
    const Child = defineComponent({
      setup() {
        onMounted(onMountedSpy)
        onUnmounted(onUnmountedSpy)
        return () => h('span')
      }
    })
    const count = ref(0)
    const Owner = defineComponent({
      setup: () => () =>
        h(Teleport, { to: 'body' }, [h('div', count.value), h(Child)])
    })

    mount(Owner, { global: { stubs: { teleport: true } } })
    for (let i = 0; i < 5; i++) {
      count.value++
      await nextTick()
    }
    expect(onMountedSpy).toHaveBeenCalledTimes(1)
    expect(onUnmountedSpy).toHaveBeenCalledTimes(0)
  })

  it('custom teleport stub component does not remount teleported children on re-render', async () => {
    const onMountedSpy = vi.fn()
    const onUnmountedSpy = vi.fn()
    const Child = defineComponent({
      setup() {
        onMounted(onMountedSpy)
        onUnmounted(onUnmountedSpy)
        return () => h('span')
      }
    })
    const TeleportStub = defineComponent({
      template: '<div><slot /></div>'
    })
    const count = ref(0)
    const Owner = defineComponent({
      setup: () => () =>
        h(Teleport, { to: 'body' }, [h('div', count.value), h(Child)])
    })

    mount(Owner, { global: { stubs: { teleport: TeleportStub } } })
    for (let i = 0; i < 5; i++) {
      count.value++
      await nextTick()
    }
    expect(onMountedSpy).toHaveBeenCalledTimes(1)
    expect(onUnmountedSpy).toHaveBeenCalledTimes(0)
  })

  it('teleported slot content still updates across re-renders', async () => {
    const Child = defineComponent({ setup: () => () => h('span') })
    const count = ref(0)
    const Owner = defineComponent({
      setup: () => () =>
        h(Teleport, { to: 'body' }, [h('div', String(count.value)), h(Child)])
    })
    const wrapper = mount(Owner, { global: { stubs: { teleport: true } } })

    count.value++
    await nextTick()
    expect(wrapper.html()).toContain('<div>1</div>')
    count.value++
    await nextTick()
    expect(wrapper.html()).toContain('<div>2</div>')
  })
})

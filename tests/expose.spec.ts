import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '../src'

import DefineExpose from './components/DefineExpose.vue'
import DefineExposeWithRenderFunction from './components/DefineExposeWithRenderFunction.vue'
import ScriptSetupExpose from './components/ScriptSetup_Expose.vue'
import ScriptSetup from './components/ScriptSetup.vue'
import ScriptSetupWithProps from './components/ScriptSetupWithProps.vue'

describe('expose', () => {
  const commonTests = (vm: any) => {
    // exposedState1 is exposed vie `expose` and aliased to `exposedState1`
    expect(vm.exposedState1).toBe('exposedState1')
    // exposedState2 is exposed vie `expose` and aliased to `exposedState2Alias`
    expect(vm.exposedState2Alias).toBe('exposedState2')

    // exposed state can be changed but will not affect the original state
    vm.exposedState2Alias = 'newExposedState2'
    expect(vm.exposedState2Alias).toBe('newExposedState2')
    expect(vm.exposedState2Getter()).toBe('exposedState2')

    // exposed ref can be changed and will affect the original ref
    // @ts-ignore upstream issue, see https://github.com/vuejs/vue-next/issues/4397#issuecomment-957613874
    expect(vm.exposedRef).toBe('exposedRef')
    vm.exposedRef = 'newExposedRef'
    expect(vm.exposedRef).toBe('newExposedRef')
    expect(vm.exposedRefGetter()).toBe('newExposedRef')

    // exposedMethod1 is exposed vie `expose`
    expect(vm.exposedMethod1).not.toBe(undefined)
    expect(vm.exposedMethod1()).toBe('result of exposedMethod1')

    // exposedMethod2 is exposed vie `expose` and aliased to `exposedMethod2Alias`
    expect(vm.exposedMethod2Alias).not.toBe(undefined)
    expect(vm.exposedMethod2Alias()).toBe('result of exposedMethod2')
  }

  it('access vm on simple components with custom `expose`', async () => {
    const wrapper = mount(DefineExpose)
    const vm = wrapper.vm

    commonTests(vm)

    // returned state shuold be accessible
    expect(vm.returnedState).toBe('returnedState')

    // non-exposed and non-returned state should not be accessible
    expect(
      (vm as unknown as { stateNonExposedAndNonReturned: undefined })
        .stateNonExposedAndNonReturned
    ).toBe(undefined)
  })

  it('access vm on simple components with custom `expose` and a setup returning a render function', async () => {
    const wrapper = mount(DefineExposeWithRenderFunction)
    const vm = wrapper.vm

    commonTests(vm)

    // can't access `refUseByRenderFnButNotExposed` as it is not exposed
    // and we are in a component with a setup returning a render function
    expect(
      (vm as unknown as { refUseByRenderFnButNotExposed: undefined })
        .refUseByRenderFnButNotExposed
    ).toBeUndefined()
  })

  it('access vm with <script setup> and defineExpose()', async () => {
    const wrapper = mount(ScriptSetupExpose)
    const vm = wrapper.vm as unknown as {
      inc: () => void
      resetCount: () => void
      count: number
      refNonExposed: string
      refNonExposedGetter: () => string
    }

    commonTests(vm)

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toContain('1')

    // can access state/method/ref as it is exposed via `defineExpose()`
    expect(vm.count).toBe(1)
    vm.resetCount()
    expect(vm.count).toBe(0)

    // non-exposed state/method/ref should be accessible
    vm.inc()
    expect(vm.count).toBe(1)
    expect(vm.refNonExposed).toBe('refNonExposed')
    vm.refNonExposed = 'newRefNonExposed'
    expect(vm.refNonExposedGetter()).toBe('newRefNonExposed')
  })

  it('access vm with <script setup> even without defineExpose()', async () => {
    const wrapper = mount(ScriptSetup)

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toContain('1')
    // can access `count` even if it is _not_ exposed
    // @ts-ignore we need better types here, see https://github.com/vuejs/test-utils/issues/972
    expect(wrapper.vm.count).toBe(1)

    // @ts-ignore we need better types here, see https://github.com/vuejs/test-utils/issues/972
    wrapper.vm.count = 2
    await nextTick()
    expect(wrapper.html()).toContain('2')
  })

  it('spies on vm with <script setup> even without defineExpose()', async () => {
    const wrapper = mount(ScriptSetup)

    const spiedIncrement = vi
      // @ts-ignore we need better types here, see https://github.com/vuejs/test-utils/issues/972
      .spyOn(wrapper.vm, 'inc')
      .mockImplementation(() => {})

    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(spiedIncrement).toHaveBeenCalled()
    expect(wrapper.html()).toContain('0')
  })

  it('access props on vm with <script setup>', async () => {
    const wrapper = mount(ScriptSetupWithProps, {
      props: {
        count: 2
      }
    })
    // make sure that props are accessible on wrapper.vm
    expect(wrapper.vm.count).toBe(2)
    expect(wrapper.html()).toContain('2')

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toContain('3')
  })

  it('should not throw when mocking', async () => {
    const spiedIncrement = vi.fn()
    const wrapper = mount(ScriptSetup, {
      global: {
        mocks: {
          count: -1,
          inc: spiedIncrement
        }
      }
    })
    expect(wrapper.html()).toContain('-1')

    await wrapper.find('button').trigger('click')
    await nextTick()

    expect(spiedIncrement).toHaveBeenCalled()
    expect(wrapper.html()).toContain('-1')
  })
})

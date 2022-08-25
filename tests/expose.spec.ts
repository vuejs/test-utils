import { describe, expect, it } from 'vitest'
import { mount } from '../src'
import Hello from './components/Hello.vue'
import DefineExpose from './components/DefineExpose.vue'
import DefineExposeWithRenderFunction from './components/DefineExposeWithRenderFunction.vue'
import ScriptSetupExpose from './components/ScriptSetup_Expose.vue'
import ScriptSetup from './components/ScriptSetup.vue'

describe('expose', () => {
  it('access vm on simple components', async () => {
    const wrapper = mount(Hello)

    expect(wrapper.vm.msg).toBe('Hello world')
  })

  it('access vm on simple components with custom `expose`', async () => {
    const wrapper = mount(DefineExpose)

    // other is exposed vie `expose`
    expect(wrapper.vm.other).toBe('other')
    // can access `msg` even if not exposed
    expect(wrapper.vm.msg).toBe('Hello world')
  })

  it('access vm on simple components with custom `expose` and a setup returning a render function', async () => {
    const wrapper = mount(DefineExposeWithRenderFunction)

    // other is exposed vie `expose`
    // @ts-ignore upstream issue, see https://github.com/vuejs/vue-next/issues/4397#issuecomment-957613874
    expect(wrapper.vm.other).toBe('other')
    // can't access `msg` as it is not exposed
    // and we are in a component with a setup returning a render function
    expect((wrapper.vm as unknown as { msg: undefined }).msg).toBeUndefined()
  })

  it('access vm with <script setup> and defineExpose()', async () => {
    const wrapper = mount(ScriptSetupExpose)

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toContain('1')
    // can access `count` as it is exposed via `defineExpose()`
    expect(wrapper.vm.count).toBe(1)

    wrapper.vm.resetCount()

    expect(wrapper.vm.count).toBe(0)
  })

  it('access vm with <script setup> even without defineExpose()', async () => {
    const wrapper = mount(ScriptSetup)

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toContain('1')
    // can access `count` even if it is _not_ exposed
    // @ts-ignore we need better types here, see https://github.com/vuejs/test-utils/issues/972
    expect(wrapper.vm.count).toBe(1)

    wrapper.vm.resetCount()

    expect(wrapper.vm.count).toBe(0)
  })
})

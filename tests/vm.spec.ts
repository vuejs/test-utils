import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '../src'
import ExposeWithOptionsAndTemplate from './components/DefineExpose.vue'
import ExposeWithOptionsAndRenderFunction from './components/DefineExposeWithRenderFunction.vue'
import ExposeWithScriptSetup from './components/ScriptSetup_Expose.vue'
import ExposeWithBundledCode from './components/DefineExposeBundled.ts'

describe('vm', () => {
  it('returns the component vm', () => {
    const Component = defineComponent({
      name: 'VTUComponent',
      template: '<div>{{ msg }}</div>',
      setup() {
        const msg = 'hello'
        const isEnabled = ref(true)
        const toggle = () => (isEnabled.value = !isEnabled.value)
        return { msg, isEnabled, toggle }
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.vm.msg).toBe('hello')
    expect(wrapper.vm.isEnabled).toBe(true)

    wrapper.vm.toggle()

    expect(wrapper.vm.isEnabled).toBe(false)
  })

  it('allows spying on vm', async () => {
    const Component = defineComponent({
      name: 'VTUComponent',
      template: '<div @click="toggle()">{{ msg }}</div>',
      setup() {
        const msg = 'hello'
        const isEnabled = ref(true)
        const toggle = () => (isEnabled.value = !isEnabled.value)
        return { msg, isEnabled, toggle }
      }
    })

    const wrapper = mount(Component)

    vi.spyOn(wrapper.vm, 'toggle')

    await wrapper.get('div').trigger('click')

    expect(wrapper.vm.toggle).toHaveBeenCalled()
  })

  // https://github.com/vuejs/test-utils/issues/2591
  describe('mounted vm includes exposed properties', () => {
    it.each([
      { d: 'options.setup + template', t: ExposeWithOptionsAndTemplate },
      { d: 'options.setup + render fn', t: ExposeWithOptionsAndRenderFunction },
      { d: '<script setup> + defineExpose', t: ExposeWithScriptSetup },
      { d: 'bundled code', t: ExposeWithBundledCode }
    ])(
      'when exposing target component is defined with $d',
      ({ t: ExposeTarget }) => {
        const wrapper = mount(ExposeTarget)

        expect(wrapper.exists()).toBe(true)
        expect(wrapper.vm.exposedMethod1).toBeInstanceOf(Function)
      }
    )
  })
})

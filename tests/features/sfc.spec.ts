import { describe, expect, it } from 'vitest'
import { mount } from '../../src'
import Hello from '../components/Hello.vue'
import ScriptSetup from '../components/ScriptSetup.vue'

describe('sfc', () => {
  it('mounts an sfc via vue-test-transformer', () => {
    const wrapper = mount(Hello)
    expect(wrapper.find('#msg').text()).toBe('Hello world')
  })

  // rfc: https://github.com/vuejs/rfcs/pull/228
  it('works with <script setup> (as of Vue 3.0.3)', async () => {
    const wrapper = mount(ScriptSetup)
    expect(wrapper.findComponent(Hello).exists()).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(wrapper.html()).toContain('1')
  })
})

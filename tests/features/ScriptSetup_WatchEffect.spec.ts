import { mount } from '../../src'
import ScriptSetup_WatchEffect from '../components/ScriptSetup_WatchEffect.vue'

it('watchEffect works with script setup', () => {
  const wrapper = mount(ScriptSetup_WatchEffect, {
    global: {
      provide: { someType: 'content' }
    }
  })

  expect(wrapper.find('#contentInfo').exists()).toBe(true)
})

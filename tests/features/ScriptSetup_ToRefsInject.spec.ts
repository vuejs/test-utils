import { mount } from '../../src'
import ScriptSetup_ToRefsInject from '../components/ScriptSetup_ToRefsInject.vue'

it('toRefs and inject work with script setup', async () => {
  const wrapper = mount(ScriptSetup_ToRefsInject, {
    props: {
      title: 'Some title'
    },
    global: {
      provide: {
        parentType: 'Parent Type'
      }
    }
  })

  expect(wrapper.html()).toContain('Some title')
  expect(wrapper.find('p').html()).toContain('Parent Type')
  expect(wrapper.find('#data').exists()).toBe(true)
  expect(wrapper.find('#data').html()).toContain('Has Data')
})

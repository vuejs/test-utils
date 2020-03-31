import flushPromises from 'flush-promises'

import SuspenseComponent from '../components/Suspense.vue'
import { mount } from '../../src'

describe('suspense', () => {
  test('fallback state', () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
  })

  test('default state', async (done) => {
    const wrapper = mount(SuspenseComponent)

    console.log(wrapper.html())
    setTimeout(() => {
      expect(wrapper.html()).toContain('Default content')
      done()
    }, 150)
  })
})

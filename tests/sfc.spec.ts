import { mount } from '../src'
import Hello from './components/Hello.vue'

describe('sfc', () => {
  it('mounts an sfc via vue-test-transformer', () => {
    const wrapper = mount(Hello)
    expect(wrapper.find('#msg').text()).toBe('Hello world')
  })
})
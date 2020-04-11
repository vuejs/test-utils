import { mount, VueWrapper } from '../../src'
import Hello from '../components/Hello.vue'
// add a method to the VueWrapper
declare module '../../src/vue-wrapper' {
  interface VueWrapper {
    name(): string
  }
}

VueWrapper.prototype.name = function () {
  return this.componentVM.$.type.name
}

describe('Plugin', () => {
  it('adds name property', () => {
    const wrapper = mount(Hello)
    expect(wrapper.name()).toEqual('Hello')
  })
})

import { mount, VueWrapper, config } from '../../src'
import Hello from '../components/Hello.vue'
// add a method to the VueWrapper
declare module '../../src/vue-wrapper' {
  interface VueWrapper {
    name(): string

    lowerCaseName(): string[]
  }
}

VueWrapper.prototype.name = function () {
  return this.componentVM.$.type.name
}

config.plugins.VueWrapper.lowerCaseName = function lowerCaseName(
  this: VueWrapper
) {
  return this.name().toLocaleLowerCase()
}

describe('Plugin', () => {
  it('adds name property', () => {
    const wrapper = mount(Hello)
    expect(wrapper.name()).toEqual('Hello')
  })

  it('adds loweCase name property', () => {
    const wrapper = mount(Hello)
    expect(wrapper.lowerCaseName()).toEqual('hello')
  })
})

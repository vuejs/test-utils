import { h } from 'vue'
import { mount } from '../src'

describe('attributes', () => {
  it('returns an object with attributes', () => {
    const value = 'value'
    const component = {
      render() {
        return h('div', { attribute: value })
      }
    }
    const wrapper = mount(component)
    expect(wrapper.attributes()).toEqual({ attribute: value })
  })

  it('returns empty object if wrapper does not contain any attributes', () => {
    const component = {
      render() {
        return h('div', 'text')
      }
    }
    const wrapper = mount(component)
    expect(wrapper.attributes()).toEqual({})
  })

  it('returns the given attribute if wrapper contains attribute matching value', () => {
    const value = 'value'
    const component = {
      render() {
        return h('div', { attribute: value })
      }
    }
    const wrapper = mount(component)
    expect(wrapper.attributes('attribute')).toEqual(value)
  })

  it('returns undefined if the wrapper does not contain the matching value', () => {
    const value = 'value'
    const component = {
      render() {
        return h('div', { attribute: value })
      }
    }
    const wrapper = mount(component)
    expect(wrapper.attributes('fake')).toEqual(undefined)
  })
})

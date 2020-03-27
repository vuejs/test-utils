import { h } from 'vue'
import { mount } from '../src'

describe('multipleRootNodes', () => {
  it('returns false if only one root node', () => {
    const component = {
      render() {
        return h('div')
      }
    }
    const wrapper = mount(component)
    expect(wrapper.__hasMultipleRoots).toBe(false)
  })

  it('returns true if multiple root nodes', () => {
    const component = {
      render() {
        return [h('div', '1'), h('div', '2')]
      }
    }
    const wrapper = mount(component)
    expect(wrapper.__hasMultipleRoots).toBe(true)
  })
})

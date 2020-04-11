import { mount } from '../src'
import Hello from './components/Hello.vue'

const compC = {
  name: 'ComponentC',
  template: '<div class="C">C</div>'
}
const compB = {
  template: '<div class="B">TextBefore<comp-c/>TextAfter<comp-c/></div>',
  components: { compC }
}
const compA = {
  template: '<div class="A"><comp-b ref="b"/><hello ref="b"/></div>',
  components: { compB, Hello }
}

describe('findAllComponents', () => {
  it('finds all deeply nested vue components', () => {
    const wrapper = mount(compA)
    // find by DOM selector
    expect(wrapper.findAllComponents('.C')).toHaveLength(2)
    expect(wrapper.findAllComponents({ name: 'Hello' })[0].el.textContent).toBe(
      'Hello world'
    )
    expect(wrapper.findAllComponents(Hello)[0].el.textContent).toBe(
      'Hello world'
    )
  })
})

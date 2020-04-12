import { mount } from '../src'
import Hello from './components/Hello.vue'

describe('findComponent', () => {
  it('finds deeply nested vue components', () => {
    const compC = {
      name: 'ComponentC',
      template: '<div class="C">C</div>'
    }
    const compB = {
      template: '<div class="B">TextBefore<comp-c/>TextAfter<comp-c/></div>',
      components: { compC }
    }
    const compA = {
      template: '<div class="A"><comp-b/><hello ref="b"/></div>',
      components: { compB, Hello }
    }
    const wrapper = mount(compA)
    // find by ref
    expect(wrapper.findComponent({ ref: 'b' })).toBeTruthy()
    // find by DOM selector
    expect(wrapper.findComponent('.C').$options.name).toEqual('ComponentC')
    expect(wrapper.findComponent({ name: 'Hello' }).$el.textContent).toBe(
      'Hello world'
    )
    expect(wrapper.findComponent(Hello).$el.textContent).toBe('Hello world')
  })
})

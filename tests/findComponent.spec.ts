import { mount } from '../src'
import Hello from './components/Hello.vue'

const compC = {
  name: 'ComponentC',
  template: '<div class="C">C</div>'
}
const compB = {
  name: 'component-b',
  template: '<div class="B">TextBefore<comp-c/>TextAfter<comp-c/></div>',
  components: { compC }
}
const compA = {
  template: '<div class="A"><comp-b/><hello ref="b"/></div>',
  components: { compB, Hello }
}

describe('findComponent', () => {
  it('finds component by ref', () => {
    const wrapper = mount(compA)
    // find by ref
    expect(wrapper.findComponent({ ref: 'b' })).toBeTruthy()
  })

  it('finds component by dom selector', () => {
    const wrapper = mount(compA)
    // find by DOM selector
    expect(wrapper.findComponent('.C').$options.name).toEqual('ComponentC')
  })

  it('finds component by name', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent({ name: 'Hello' }).$el.textContent).toBe(
      'Hello world'
    )
    expect(wrapper.findComponent({ name: 'ComponentB' })).toBeTruthy()
    expect(wrapper.findComponent({ name: 'component-c' })).toBeTruthy()
  })

  it('finds component by imported SFC file', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent(Hello).$el.textContent).toBe('Hello world')
    expect(wrapper.findComponent(compC).$el.textContent).toBe('C')
  })
})

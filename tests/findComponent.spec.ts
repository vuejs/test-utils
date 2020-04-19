import { defineComponent } from 'vue'
import { mount } from '../src'
import Hello from './components/Hello.vue'

const compC = defineComponent({
  name: 'ComponentC',
  template: '<div class="C">C</div>'
})

const compD = defineComponent({
  name: 'ComponentD',
  template: '<comp-c class="c-as-root-on-d" />',
  components: { compC }
})

const compB = defineComponent({
  name: 'component-b',
  template: `
    <div class="B">
      TextBefore
      <comp-c />
      TextAfter
      <comp-c />
      <comp-d id="compD" />
    </div>`,
  components: { compC, compD }
})

const compA = defineComponent({
  template: `
    <div class="A">
      <comp-b />
      <hello ref="b" />
      <div class="domElement" />
    </div>`,
  components: { compB, Hello }
})

describe('findComponent', () => {
  it('does not find plain dom elements', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent('.domElement').exists()).toBeFalsy()
  })

  it('finds component by ref', () => {
    const wrapper = mount(compA)
    // find by ref
    expect(wrapper.findComponent({ ref: 'b' })).toBeTruthy()
  })

  it('finds component by dom selector', () => {
    const wrapper = mount(compA)
    // find by DOM selector
    expect(wrapper.findComponent('.C').vm).toHaveProperty(
      '$options.name',
      'ComponentC'
    )
  })

  it('does allows using complicated DOM selector query', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent('.B > .C').vm).toHaveProperty(
      '$options.name',
      'ComponentC'
    )
  })

  it('finds a component when root of mounted component', async () => {
    const wrapper = mount(compD)
    // make sure it finds the component, not its root
    expect(wrapper.findComponent('.c-as-root-on-d').vm).toHaveProperty(
      '$options.name',
      'ComponentC'
    )
  })

  it('finds component by name', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent({ name: 'Hello' }).text()).toBe('Hello world')
    expect(wrapper.findComponent({ name: 'ComponentB' }).exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'component-c' }).exists()).toBeTruthy()
  })

  it('finds component by imported SFC file', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent(Hello).text()).toBe('Hello world')
    expect(wrapper.findComponent(compC).text()).toBe('C')
  })
})

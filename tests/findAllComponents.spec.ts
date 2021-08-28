import { mount } from '../src'
import Hello from './components/Hello.vue'
import { defineComponent } from 'vue'

const compC = defineComponent({
  name: 'ComponentC',
  template: '<div class="C">C</div>'
})
const compB = defineComponent({
  template: '<div class="B">TextBefore<comp-c/>TextAfter<comp-c/></div>',
  components: { compC }
})
const compA = defineComponent({
  template: '<div class="A"><comp-b ref="b"/><hello ref="b"/></div>',
  components: { compB, Hello }
})

describe('findAllComponents', () => {
  it('finds all deeply nested vue components', () => {
    const wrapper = mount(compA)
    expect(wrapper.findAllComponents(compC)).toHaveLength(2)
    expect(wrapper.findAllComponents({ name: 'Hello' })[0].text()).toBe(
      'Hello world'
    )
    expect(wrapper.findAllComponents(Hello)[0].text()).toBe('Hello world')
  })

  it('finds all deeply nested vue components when chained from dom wrapper', () => {
    const Component = defineComponent({
      components: { Hello },
      template:
        '<div><Hello /><div class="nested"><Hello /><Hello /></div></div>'
    })
    const wrapper = mount(Component)
    expect(wrapper.findAllComponents(Hello)).toHaveLength(3)
    expect(wrapper.find('.nested').findAllComponents(Hello)).toHaveLength(2)
  })
})

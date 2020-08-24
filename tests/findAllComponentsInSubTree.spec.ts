import { mount } from '../src'
import { defineComponent, h } from 'vue'

describe('findAllComponentsInSubTree', () => {
  it('finds all components', () => {
    const compB = defineComponent({
      name: 'compB',
      render: () => h('div', { class: 'B' }, 'TextB')
    })
    const compA = defineComponent({
      name: 'compA',
      template: '<div><slot /></div>'
    })
    const starter = defineComponent({
      name: 'starter',
      template: '<comp-a><comp-b /><comp-b /><comp-b /></comp-a>',
      components: { compA, compB }
    })
    const App = defineComponent({
      name: 'App',
      render: () => h(starter),
      components: { starter }
    })

    const wrapper = mount(App)
    // find by DOM selector
    expect(wrapper.findComponent(compA).exists()).toBe(true)
    expect(wrapper.findComponent(compB).exists()).toBe(true)
    expect(wrapper.findComponent(starter).exists()).toBe(true)
  })

  it('finds all components', () => {
    const compC = defineComponent({
      name: 'compC',
      render: () => h('div', { class: 'B' }, 'TextB')
    })
    const compB = defineComponent({
      name: 'compB',
      render: () => h('div', { class: 'B' }, 'TextB')
    })
    const compA = defineComponent({
      name: 'compA',
      template: '<div><slot /><slot name="b" /></div>'
    })
    const starter = defineComponent({
      name: 'starter',
      template:
        '<comp-a><comp-b /><comp-b /><comp-b /><comp-c v-slot:b /></comp-a>',
      components: { compA, compB, compC }
    })
    const App = defineComponent({
      name: 'App',
      template: '<starter />',
      components: { starter }
    })

    const wrapper = mount(App)
    // find by DOM selector
    expect(wrapper.findComponent(compA).exists()).toBe(true)
    expect(wrapper.findComponent(compB).exists()).toBe(true)
    expect(wrapper.findComponent(compC).exists()).toBe(true)
    expect(wrapper.findComponent(starter).exists()).toBe(true)
  })
})

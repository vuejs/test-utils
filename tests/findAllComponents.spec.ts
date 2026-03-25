import { describe, expect, it, vi } from 'vitest'
import { mount } from '../src'
import Hello from './components/Hello.vue'
import type { DefineComponent } from 'vue'
import { defineComponent, h } from 'vue'

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
    // find by DOM selector
    expect(wrapper.findAllComponents('.C')).toHaveLength(2)
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

  it('ignores DOM nodes matching css selector', () => {
    const Component = defineComponent({
      components: { Hello },
      template:
        '<div class="foo"><Hello class="foo" /><div class="nested foo"></div></div>'
    })
    const wrapper = mount(Component)
    expect(wrapper.findAllComponents('.foo')).toHaveLength(1)
  })

  it('findAllComponents returns top-level components when components are nested', () => {
    const DeepNestedChild = {
      name: 'DeepNestedChild',
      template: '<div>I am deeply nested</div>'
    }
    const NestedChild = {
      name: 'NestedChild',
      components: { DeepNestedChild },
      template: '<deep-nested-child class="in-child" />'
    }
    const RootComponent = {
      name: 'RootComponent',
      components: { NestedChild },
      template: '<div><nested-child class="in-root"></nested-child></div>'
    }

    const wrapper = mount(RootComponent)

    expect(wrapper.findAllComponents('.in-root')).toHaveLength(1)
    expect(
      wrapper.findAllComponents<DefineComponent>('.in-root')[0].vm.$options.name
    ).toEqual('NestedChild')

    expect(wrapper.findAllComponents('.in-child')).toHaveLength(1)

    // someone might expect DeepNestedChild here, but
    // we always return TOP component matching DOM element
    expect(
      wrapper.findAllComponents<DefineComponent>('.in-child')[0].vm.$options
        .name
    ).toEqual('NestedChild')
  })

  it('findAllComponents with function slots', () => {
    const ComponentA = defineComponent({
      template: '<div><slot /></div>'
    })
    const ComponentB = defineComponent({
      template: '<span>Text</span>'
    })

    const wrapper = mount({
      components: { ComponentA, ComponentB },
      render() {
        return h(ComponentA, {}, () => [1, 2, 3].map(() => h(ComponentB)))
      }
    })
    expect(wrapper.findAll('span')).toHaveLength(3)
    expect(wrapper.findAllComponents(ComponentB)).toHaveLength(3)
  })

  it('findAllComponents with non-function slots', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ComponentA = defineComponent({
      template: '<div><slot /></div>'
    })
    const ComponentB = defineComponent({
      template: '<span>Text</span>'
    })

    const wrapper = mount({
      components: { ComponentA, ComponentB },
      render() {
        return h(
          ComponentA,
          {},
          [1, 2, 3].map(() => h(ComponentB))
        )
      }
    })
    expect(wrapper.findAll('span')).toHaveLength(3)
    expect(wrapper.findAllComponents(ComponentB)).toHaveLength(3)
    // we're expecting a warning from Vue as we're using non-function slots
    expect(spy.mock.calls[0][0]).toContain(
      'Non-function value encountered for default slot'
    )
  })
})

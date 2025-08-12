import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '../src'
import DefinePropsAndDefineEmits from './components/DefinePropsAndDefineEmits.vue'
import WithDeepRef from './components/WithDeepRef.vue'
import HelloFromVitestPlayground from './components/HelloFromVitestPlayground.vue'
import Hello from './components/Hello.vue'

describe('mount: general tests', () => {
  it('correctly handles component, throwing on mount', () => {
    // See https://github.com/vuejs/core/issues/7020
    const ThrowingComponent = defineComponent({
      props: ['blowup'],
      mounted() {
        if (this.blowup) {
          throw new Error('Boom!')
        }
      },
      template: '<div>hello</div>'
    })

    expect(() =>
      mount(ThrowingComponent, { props: { blowup: true } })
    ).toThrow()

    const wrapper = mount(ThrowingComponent, { props: { blowup: false } })

    expect(wrapper.html()).toBe('<div>hello</div>')
  })

  it('should throw the first error encountered when mounting the component', () => {
    const ThrowingComponent = defineComponent({
      setup() {
        throw new Error('Boom!')
      },
      template: '<div>{{ x.y }}</div>'
    })

    expect(() => mount(ThrowingComponent)).toThrowError('Boom!')
  })

  it('should not warn on readonly hasOwnProperty when mounting a component', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(HelloFromVitestPlayground, { props: { count: 2 } })

    expect(spy).not.toHaveBeenCalled()
  })

  it('should mount a component with props, emits and slot (#1973)', () => {
    const wrapper = mount(DefinePropsAndDefineEmits, {
      props: {
        placement: 'end'
      },
      slots: { default: 'Hello' }
    })
    expect(wrapper.get('div').text()).toContain('Hello')
    expect(wrapper.get('div').classes()).toContain('end')
  })
  it('allows access to nested computed values', async () => {
    const wrapper = mount(WithDeepRef, {
      props: {
        count: ref(1),
        oneLayerCountObject: { count: ref(2) },
        twoLayersCountObject: { oneLayerCountObject: { count: ref(3) } },

        countArray: [ref(4)],
        countMatrix: [[ref(5)]],

        oneLayerCountObjectArray: [{ count: ref(6) }],
        oneLayerCountArrayObject: { count: [ref(7)] },
        oneLayerCountObjectMatrix: [[{ count: ref(8) }]]
      }
    })

    expect(wrapper.get('#countValue').text()).toBe('1')
    expect(wrapper.get('#oneLayerCountObjectValue').text()).toBe('2')
    expect(wrapper.get('#twoLayersCountObjectValue').text()).toBe('3')
    expect(wrapper.get('#countArrayValue').text()).toBe('4')
    expect(wrapper.get('#countMatrixValue').text()).toBe('5')
    expect(wrapper.get('#oneLayerCountObjectArrayValue').text()).toBe('6')
    expect(wrapper.get('#oneLayerCountArrayObjectValue').text()).toBe('7')
    expect(wrapper.get('#oneLayerCountObjectMatrixValue').text()).toBe('8')
  })
  it('circular references in non-ref props do not cause a stack overflow', () => {
    const item = { id: 1, parent: null as any }
    const parentItem = { children: [item] }
    item.parent = parentItem

    const wrapper = mount(Hello, {
      props: { msg: 'Hello world', item: item }
    })
    expect(wrapper.text()).toContain('Hello world')
  })
  it('circular references in ref props do not cause a stack overflow', () => {
    const item = { id: 1, parent: ref<any>(null) }
    const parentItem = { children: [ref(item)] }
    item.parent.value = parentItem

    const wrapper = mount(Hello, {
      props: { msg: 'Hello world', item: item }
    })
    expect(wrapper.text()).toContain('Hello world')
  })

  it('should remove wrapper div when unmount', () => {
    expect(document.body.firstChild, 'Container should be empty').toBeNull();

    const wrapper = mount(Hello, { props: { msg: 'Hello world' }, attachTo: document.body });
    expect(document.body.firstChild, 'Container should have mounted component wrapper').toBeInstanceOf(HTMLDivElement);
    
    wrapper.unmount();
    expect(document.body.firstChild, 'Container should be empty').toBeNull();
  })
})

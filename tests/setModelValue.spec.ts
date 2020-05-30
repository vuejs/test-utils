import { mount, shallowMount } from '../src'
import { defineComponent } from 'vue'

const PlainInputComponent = defineComponent({
  props: ['modelValue'],
  template: '<div>{{ modelValue }}</div>'
})

const MultiInputComponent = defineComponent({
  props: ['foo', 'bar'],
  template: '<div>{{ foo }} {{ bar }}</div>'
})

const Component = defineComponent({
  template:
    '<PlainInputComponent v-model="plain" /><MultiInputComponent v-model:foo="foo" v-model:bar="bar" />',
  data() {
    return {
      plain: null,
      foo: null,
      bar: null
    }
  },
  components: { PlainInputComponent, MultiInputComponent }
})

describe('setModelValue', () => {
  describe('mount', () => {
    it('triggers a normal `v-model` on a Vue Component', async () => {
      const wrapper = mount(Component)
      const plain = wrapper.findComponent(PlainInputComponent)
      await plain.setModelValue('plain-value')
      expect(wrapper.text()).toContain('plain-value')
    })

    it('triggers `v-model:parameter` style', async () => {
      const wrapper = mount(Component)
      const multiInput = wrapper.findComponent(MultiInputComponent)
      await multiInput.setModelValue('fooValue', 'foo')
      await multiInput.setModelValue('barValue', 'bar')
      expect(multiInput.text()).toContain('fooValue')
      expect(multiInput.text()).toContain('barValue')
    })
  })
  describe('shallowMount', () => {
    it('triggers a normal `v-model` on a Vue Component', async () => {
      const wrapper = shallowMount(Component)
      const plain = wrapper.findComponent(PlainInputComponent)
      await plain.setModelValue('plain-value')
      expect(wrapper.vm.plain).toEqual('plain-value')
    })

    it('triggers `v-model:parameter` style', async () => {
      const wrapper = shallowMount(Component)
      const multiInput = wrapper.findComponent(MultiInputComponent)
      await multiInput.setModelValue('fooValue', 'foo')
      await multiInput.setModelValue('barValue', 'bar')
      expect(wrapper.vm.foo).toEqual('fooValue')
      expect(wrapper.vm.bar).toEqual('barValue')
    })
  })
})

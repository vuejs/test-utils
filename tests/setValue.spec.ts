import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, shallowMount } from '../src'
import ComponentWithInput from './components/ComponentWithInput.vue'

describe('setValue', () => {
  describe('on input and textarea', () => {
    it('sets element of input value', async () => {
      const wrapper = mount(ComponentWithInput)
      const input = wrapper.find<HTMLInputElement>('input[type="text"]')
      await input.setValue('foo')

      expect(wrapper.text()).toContain('foo')

      expect(input.element.value).toBe('foo')
    })

    it('sets element of textarea value', async () => {
      const wrapper = mount(ComponentWithInput)
      const textarea = wrapper.find<HTMLTextAreaElement>('textarea')
      await textarea.setValue('foo')

      expect(textarea.element.value).toBe('foo')
    })

    it('updates dom with input v-model.lazy', async () => {
      const wrapper = mount(ComponentWithInput)
      const input = wrapper.find<HTMLInputElement>('input#lazy')
      await input.setValue('lazy')

      expect(wrapper.text()).toContain('lazy')
    })
  })

  describe('on select and option', () => {
    it('sets element of select value', async () => {
      const wrapper = mount(ComponentWithInput)
      const select = wrapper.find<HTMLSelectElement>('select')
      await select.setValue('selectB')

      expect(select.element.value).toEqual('selectB')
      expect(wrapper.text()).toContain('selectB')
    })

    it('as an option of a select as selected', async () => {
      const wrapper = mount(ComponentWithInput)
      const input = wrapper.find<HTMLOptionElement>('option')

      await input.setValue()
      expect(wrapper.text()).toContain('selectA')
    })

    it('sets select with an option group', async () => {
      const wrapper = mount(ComponentWithInput)
      const options = wrapper.find('select.with-optgroups').findAll('option')
      await options[1].setValue()
      expect(wrapper.text()).toContain('selectB')

      await options[0].setValue()
      expect(wrapper.text()).toContain('selectA')
    })

    it('does not select an already selected element', async () => {
      const handle = vi.fn()

      const Component = {
        setup() {
          return () =>
            h('select', { onChange: handle }, [
              h('option', { value: 'A' }),
              h('option', { value: 'B' })
            ])
        }
      }

      const wrapper = mount(Component)
      const input = wrapper.findAll<HTMLOptionElement>('option')[1]

      await input.setValue()
      await input.setValue()
      await input.setValue()

      expect(handle).toHaveBeenCalledTimes(1)
    })
  })

  describe('on radio and checkbox', () => {
    it('selects a checkbox by passing a value', async () => {
      const wrapper = mount(ComponentWithInput)
      const checkbox = wrapper.find<HTMLInputElement>('input[type=checkbox]')
      await checkbox.setValue(true)

      expect(wrapper.find('.checkboxResult').exists()).toBe(true)
      expect(checkbox.element.checked).toBe(true)

      await checkbox.setValue(false)

      expect(wrapper.find('.checkboxResult').exists()).toBe(false)
      expect(checkbox.element.checked).toBe(false)
    })

    it('selects a checkbox without passing any value', async () => {
      const wrapper = mount(ComponentWithInput)
      await wrapper.find<HTMLInputElement>('input[type=checkbox]').setValue()
      expect(wrapper.find('.checkboxResult').exists()).toBe(true)
    })

    it('changes state the right amount of times with checkbox v-model', async () => {
      const wrapper = mount(ComponentWithInput)
      const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]')

      await input.setValue()
      await input.setValue(false)
      await input.setValue(false)
      await input.setValue(true)
      await input.setValue(false)
      await input.setValue(false)

      expect(wrapper.find<HTMLInputElement>('.counter').text()).toBe('4')
    })

    it('does not trigger a change event if the checkbox is already checked', async () => {
      const listener = vi.fn()
      const Comp = defineComponent({
        setup() {
          return () =>
            h('input', {
              onChange: listener,
              type: 'checkbox',
              checked: true
            })
        }
      })

      await mount(Comp).find('input').setValue()

      expect(listener).not.toHaveBeenCalled()
    })

    it('selects radio', async () => {
      const wrapper = mount(ComponentWithInput)
      const radio = wrapper.find<HTMLInputElement>('#radioBar')
      await radio.setValue()
      expect(wrapper.text()).toContain('radioBarResult')
      expect(radio.element.checked).toBe(true)
    })

    it('changes state the right amount of times with radio v-model', async () => {
      const wrapper = mount(ComponentWithInput)
      const radioBar = wrapper.find<HTMLInputElement>('#radioBar')
      const radioFoo = wrapper.find<HTMLInputElement>('#radioFoo')

      await radioBar.setValue()
      await radioBar.setValue()
      await radioFoo.setValue()
      await radioBar.setValue()
      await radioBar.setValue()
      await radioFoo.setValue()
      await radioFoo.setValue()
      expect(wrapper.find<HTMLInputElement>('.counter').text()).toBe('4')
    })

    it('throws error if element is radio and checked is false', async () => {
      const message = `wrapper.setChecked() cannot be called with parameter false on a '<input type="radio" /> element`
      const wrapper = mount(ComponentWithInput)
      const radioFoo = wrapper.find<HTMLInputElement>('#radioFoo')

      const fn = radioFoo.setValue(false)
      await expect(fn).rejects.toThrowError(message)
    })
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setValue() cannot be called on LABEL'
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find('#label-el')

    const fn = () => input.setValue('')
    expect(fn).toThrowError(message)
  })

  describe('on component instance', () => {
    const PlainInputComponent = defineComponent({
      props: ['modelValue', 'onUpdate:modelValue'],
      template: '<div>{{ modelValue }}</div>'
    })

    const MultiInputComponent = defineComponent({
      props: ['foo', 'bar', 'onUpdate:bar', 'onUpdate:foo'],
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

    describe('mount', () => {
      it('triggers a normal `v-model` on a Vue Component', async () => {
        const wrapper = mount(Component)
        const plain = wrapper.findComponent(PlainInputComponent)
        await plain.setValue('plain-value')
        expect(wrapper.text()).toContain('plain-value')
      })

      it('triggers `v-model:parameter` style', async () => {
        const wrapper = mount(Component)
        const multiInput = wrapper.findComponent(MultiInputComponent)
        await multiInput.setValue('fooValue', 'foo')
        await multiInput.setValue('barValue', 'bar')
        expect(multiInput.text()).toContain('fooValue')
        expect(multiInput.text()).toContain('barValue')
      })
    })
    describe('shallowMount', () => {
      it('triggers a normal `v-model` on a Vue Component', async () => {
        const wrapper = shallowMount(Component)
        const plain = wrapper.findComponent(PlainInputComponent)
        await plain.setValue('plain-value')
        expect(wrapper.vm.plain).toEqual('plain-value')
      })

      it('triggers `v-model:parameter` style', async () => {
        const wrapper = shallowMount(Component)
        const multiInput = wrapper.findComponent(MultiInputComponent)
        await multiInput.setValue('fooValue', 'foo')
        await multiInput.setValue('barValue', 'bar')
        expect(wrapper.vm.foo).toEqual('fooValue')
        expect(wrapper.vm.bar).toEqual('barValue')
      })
    })
  })
})

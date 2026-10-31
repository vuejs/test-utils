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
    const renderOptions = () => [
      h('option', { value: 'A' }),
      h('option', { value: 'B' })
    ]

    it('sets element of select value', async () => {
      const wrapper = mount(ComponentWithInput)
      const select = wrapper.find<HTMLSelectElement>('select')
      await select.setValue('selectB')

      expect(select.element.value).toEqual('selectB')
      expect(wrapper.text()).toContain('selectB')

      expect(wrapper.emitted('change')).toHaveLength(1)
      expect(wrapper.emitted('input')).toHaveLength(1)
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
          return () => h('select', { onChange: handle }, renderOptions())
        }
      }

      const wrapper = mount(Component)
      const input = wrapper.findAll<HTMLOptionElement>('option')[1]

      await input.setValue()
      await input.setValue()
      await input.setValue()

      expect(handle).toHaveBeenCalledTimes(1)
    })

    it('sets element of multiselect value', async () => {
      const wrapper = mount(ComponentWithInput)
      const select = wrapper.find<HTMLSelectElement>('select.multiselect')
      await select.setValue(['selectA', 'selectC'])

      const selectedOptions = Array.from(select.element.selectedOptions).map(
        o => o.value
      )
      expect(selectedOptions).toEqual(['selectA', 'selectC'])
      expect(wrapper.vm.multiselectVal).toEqual(['selectA', 'selectC'])

      expect(wrapper.emitted('change')).toHaveLength(1)
      expect(wrapper.emitted('input')).toHaveLength(1)
    })

    it('overrides elements of multiselect', async () => {
      const wrapper = mount(ComponentWithInput)
      const select = wrapper.find<HTMLSelectElement>('select.multiselect')
      await select.setValue(['selectA', 'selectC'])
      await select.setValue(['selectB'])

      const selectedOptions = Array.from(select.element.selectedOptions).map(
        o => o.value
      )
      expect(selectedOptions).toEqual(['selectB'])
      expect(wrapper.vm.multiselectVal).toEqual(['selectB'])

      expect(wrapper.emitted('change')).toHaveLength(2)
      expect(wrapper.emitted('input')).toHaveLength(2)
    })

    it('does trigger input and change event on select', async () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const Comp = defineComponent({
        setup() {
          return () => h('select', { onInput, onChange }, renderOptions())
        }
      })

      await mount(Comp).find('select').setValue('A')

      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does trigger input and change event on option select', async () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const Comp = defineComponent({
        setup() {
          return () => h('select', { onInput, onChange }, renderOptions())
        }
      })

      await mount(Comp).findAll('option')[1].setValue()

      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
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

    it('does trigger input and change event on checkbox', async () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const Comp = defineComponent({
        setup() {
          return () =>
            h('input', {
              onInput,
              onChange,
              type: 'checkbox'
            })
        }
      })

      await mount(Comp).find('input').setValue()

      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('does trigger input and change event on radio', async () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const Comp = defineComponent({
        setup() {
          return () =>
            h('input', {
              onInput,
              onChange,
              type: 'radio'
            })
        }
      })

      await mount(Comp).find('input').setValue()

      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
    })
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setValue() cannot be called on LABEL'
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find('#label-el')

    const fn = () => input.setValue('')
    expect(fn).toThrowError(message)
  })

  describe('on contenteditable element', () => {
    it('sets innerHTML of a contenteditable="true" element', async () => {
      const wrapper = mount({
        template: '<div contenteditable="true"></div>'
      })
      const div = wrapper.find('div')
      await div.setValue('<b>foo</b>')

      expect(div.element.innerHTML).toBe('<b>foo</b>')
    })

    it('sets innerHTML of a bare contenteditable element', async () => {
      const wrapper = mount({
        template: '<div contenteditable></div>'
      })
      const div = wrapper.find('div')
      await div.setValue('foo')

      expect(div.element.innerHTML).toBe('foo')
    })

    it('triggers input and change events on a contenteditable element', async () => {
      const onInput = vi.fn()
      const onChange = vi.fn()
      const Comp = defineComponent({
        setup() {
          return () => h('div', { contenteditable: 'true', onInput, onChange })
        }
      })

      await mount(Comp).find('div').setValue('foo')

      expect(onInput).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledTimes(1)
    })

    it('throws error if contenteditable is explicitly false', () => {
      const message = 'wrapper.setValue() cannot be called on DIV'
      const wrapper = mount({
        template: '<div contenteditable="false"></div>'
      })
      const div = wrapper.find('div')

      const fn = () => div.setValue('foo')
      expect(fn).toThrowError(message)
    })

    it('sets innerHTML of a contenteditable="plaintext-only" element', async () => {
      const wrapper = mount({
        template: '<div contenteditable="plaintext-only"></div>'
      })
      const div = wrapper.find('div')
      await div.setValue('foo')

      expect(div.element.innerHTML).toBe('foo')
    })

    it('works on elements other than div, such as span and p', async () => {
      const wrapper = mount({
        template:
          '<span contenteditable="true"></span><p contenteditable="true"></p>'
      })

      const span = wrapper.find('span')
      await span.setValue('foo')
      expect(span.element.innerHTML).toBe('foo')

      const paragraph = wrapper.find('p')
      await paragraph.setValue('bar')
      expect(paragraph.element.innerHTML).toBe('bar')
    })

    it('sets innerHTML of a child with no contenteditable attribute of its own, inherited from an editable ancestor', async () => {
      const wrapper = mount({
        template: '<div contenteditable="true"><span id="child"></span></div>'
      })
      const child = wrapper.find('#child')
      await child.setValue('foo')

      expect(child.element.innerHTML).toBe('foo')
    })

    it('throws for a child with no contenteditable attribute of its own and no editable ancestor', () => {
      const message = 'wrapper.setValue() cannot be called on SPAN'
      const wrapper = mount({
        template: '<div><span id="child"></span></div>'
      })
      const child = wrapper.find('#child')

      const fn = () => child.setValue('foo')
      expect(fn).toThrowError(message)
    })

    it('throws for a child with no contenteditable attribute of its own inside a contenteditable="false" ancestor', () => {
      const message = 'wrapper.setValue() cannot be called on SPAN'
      const wrapper = mount({
        template: '<div contenteditable="false"><span id="child"></span></div>'
      })
      const child = wrapper.find('#child')

      const fn = () => child.setValue('foo')
      expect(fn).toThrowError(message)
    })

    it("a non-editable ancestor's contenteditable=false does not leak past a nearer editable ancestor", async () => {
      const wrapper = mount({
        template:
          '<div contenteditable="false"><div contenteditable="true"><span id="child"></span></div></div>'
      })
      const child = wrapper.find('#child')
      await child.setValue('foo')

      expect(child.element.innerHTML).toBe('foo')
    })
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

import Vue from 'vue'
import { mount } from '../src'
import ComponentWithInput from './components/ComponentWithInput.vue'

describe('setValue', () => {
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

  it('sets element of select value', async () => {
    const wrapper = mount(ComponentWithInput)
    const select = wrapper.find<HTMLSelectElement>('select')
    await select.setValue('selectB')

    expect(select.element.value).toEqual('selectB')
    expect(wrapper.text()).toContain('selectB')
  })

  it('selects radio', async () => {
    const wrapper = mount(ComponentWithInput)
    await wrapper.find<HTMLInputElement>('#radioBar').setValue()
    expect(wrapper.text()).toContain('radioBarResult')
  })

  it('throws selects a checkbox', async () => {
    const wrapper = mount(ComponentWithInput)
    await wrapper.find<HTMLInputElement>('input[type=checkbox]').setValue()
    expect(wrapper.find('.checkboxResult').exists()).toBe(true)
  })

  it('throws error if element is not valid', () => {
    const message = 'wrapper.setValue() cannot be called on LABEL'
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find('#label-el')

    const fn = () => input.setValue('')
    expect(fn).toThrowError(message)
  })

  it('sets select > option', async () => {
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find<HTMLOptionElement>('option')

    await input.setValue()
    expect(wrapper.text()).toContain('selectA')
  })

  it('sets select with an option group', async () => {
    const wrapper = mount(ComponentWithInput)
    const options = wrapper.find('select.with-optgroups').findAll('option')
    await options[1].setSelected()
    expect(wrapper.text()).toContain('selectB')

    await options[0].setSelected()
    expect(wrapper.text()).toContain('selectA')
  })
})

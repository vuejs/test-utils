import { defineComponent, h, ref } from 'vue'

import { mount } from '../src'
import ComponentWithInput from './components/ComponentWithInput.vue'

describe('setChecked', () => {
  it('updates a controlled checkbox', async () => {
    const checked = ref(false)
    const Comp = defineComponent({
      setup() {
        return () => {
          return h('div', [h('input', {
            checked: checked.value,
            onChange: () => checked.value = !checked.value,
            type: 'checkbox',
            class: checked.value ? 'checked' : 'not-checked'
          })])
        }
      }
    })
    const wrapper = mount(Comp)

    await wrapper.find('input').setChecked(true)

    expect(checked.value).toBe(true)
    expect(wrapper.find<HTMLInputElement>('input').element.checked).toBe(true)
  })

  // <input
  //     type="radio"
  //     v-model="radioVal"
  //     id="radioFoo"
  //     value="radioFooResult"
  //   />
  //   <input
  //     type="radio"
  //     v-model="radioVal"
  //     id="radioBar"
  //     value="radioBarResult"
  //   />
  it('updates a controlled radio button', async () => {
    const checked = ref('')
    const Comp = defineComponent({
      setup() {
        return () => {
          return h('div', 
            [
              h('input', {
                checked: checked.value,
                onChange: () => checked.value = 'foo',
                type: 'radio',
                id: 'foo',
                class: checked.value === 'foo' ? 'checked' : 'not-checked'
              }),
              h('input', {
                checked: checked.value,
                onChange: () => checked.value = 'bar',
                type: 'radio',
                id: 'bar',
                class: checked.value === 'bar' ? 'checked' : 'not-checked'
              })
            ]
          )
        }
      }
    })
    const wrapper = mount(Comp)

    await wrapper.find('input#foo').setChecked(true)
    expect(checked.value).toBe('foo')
    expect(wrapper.find('input#foo').classes()).toContain('checked')
    expect(wrapper.find('input#bar').classes()).not.toContain('checked')

    await wrapper.find('input#bar').setChecked(true)
    expect(checked.value).toBe('bar')
    expect(wrapper.find('input#foo').classes()).not.toContain('checked')
    expect(wrapper.find('input#bar').classes()).toContain('checked')
  })

  xit('updates dom with checkbox v-model', async () => {
    // this breaks atm
    const wrapper = mount(ComponentWithInput)
    const input = wrapper.find('input')

    // await input.setChecked()
    // expect(wrapper.text()).toContain('checkbox checked')

    // await input.setChecked(false)
    // expect(wrapper.text()).not.toContain('checkbox checked')
  })
})

import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount, shallowMount } from '../../src'

describe('tsx', () => {
  it('works with tsx', async () => {
    const Comp = defineComponent({
      setup() {
        const count = ref(0)

        const inc = () => {
          count.value++
        }

        return () => <div onClick={inc}>{count.value}</div>
      }
    })

    const wrapper = mount(() => <Comp />)
    await wrapper.get('div').trigger('click')

    expect(wrapper.html()).toContain('1')
  })

  it('works with renderless component', () => {
    const Comp = defineComponent({
      render() {
        return this.$slots?.default?.()
      }
    })
    const wrapper = shallowMount(Comp, {
      slots: {
        default() {
          return <div>OK!</div>
        }
      }
    })

    expect(wrapper.html()).toBe('<div>OK!</div>')
  })
})

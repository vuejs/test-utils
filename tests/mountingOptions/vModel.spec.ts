import { mount } from '../../src'
import WithProps from './components/WithProps.vue'
import Hello from './components/Hello.vue'
import { defineComponent, h } from 'vue'

describe('vModel', () => {
  it('updates v-model automatically', async () => {
    const Comp = defineComponent({
      props: ['foo'],
      template: `
        <input @input="handle" />
        {{ foo }}
      `,
      methods: {
        handle($event: KeyboardEvent) {
          this.$emit('update:foo', ($event.target as HTMLInputElement).value)
        }
      }
    })

    const wrapper = mount(Comp, {
      vModel: {
        foo: 'foo'
      }
    })

    expect(wrapper.html()).toContain('foo')
    wrapper.find('input').element.value = 'bar'
    await wrapper.find('input').trigger('input')
    expect(wrapper.html()).toContain('bar')
  })
})

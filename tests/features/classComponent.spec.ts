import 'reflect-metadata'
import { h } from 'vue'
import { Options, Vue } from 'vue-class-component'
import { mount } from '../../src'

test('data: $props should be available', () => {
  @Options({
    props: ['foo']
  })
  class MyComp extends Vue {
    message = 'answer is ' + (this.$props as any).foo
    render() {
      return h('div', this.message)
    }
  }

  const wrapper = mount(MyComp, {
    props: {
      foo: 42
    }
  })

  expect(wrapper.html()).toBe('<div>answer is 42</div>')
})

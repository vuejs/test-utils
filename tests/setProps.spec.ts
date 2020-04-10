import { h, reactive } from 'vue'

import { mount } from '../src'

// const setProps = (wrapper: any, props: any) => {

// }

test.only('', async () => {
  const Foo = {
    props: ['foo'],
    template: '<div>{{ foo }}</div>'
  }
  // const data = reactive({
  //   foo: 'foo'
  // })
  // const Wrapper = {
  //   components: { Foo },
  //   data() {
  //     return data
  //   },
  //   template: '<div><Foo :foo="foo" /></div>'
  // }

  const { wrapper, setProps } = mount(Foo, {
    props: {
      foo: 'bar'
    }
  })

  console.log(wrapper.html())
  setProps({ foo: 'qux' })
  // data.foo = 'bar'
  await wrapper.vm.$nextTick()

  console.log(wrapper.html())
})

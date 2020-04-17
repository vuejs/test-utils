import { expectType } from 'tsd'
import { defineComponent } from 'vue'
import { mount } from '../src'

const App = defineComponent({
  props: {
    a: String
  },
  template: ''
})

const wrapper = mount(App)
expectType<any>(wrapper.vm.a) // should be string

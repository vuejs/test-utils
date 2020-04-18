import { expectType } from 'tsd'
import { defineComponent } from 'vue'
import { mount } from '../src'

const App = defineComponent({
  props: {
    a: String
  },
  template: ''
})

let wrapper = mount(App)
expectType<string>(wrapper.vm.a)

const AppWithoutDefine = {
  props: {
    a: String
  },
  template: ''
}

wrapper = mount(AppWithoutDefine)
expectType<string>(wrapper.vm.a)

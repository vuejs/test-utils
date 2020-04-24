import { expectType } from 'tsd'
import { defineComponent, ComponentPublicInstance } from 'vue'
import { mount } from '../src'

const ComponentToFind = defineComponent({
  props: {
    a: {
      type: String,
      required: true
    }
  },
  template: ''
})

const AppWithDefine = defineComponent({
  template: ''
})

const wrapper = mount(AppWithDefine)

// get by type
const componentByType = wrapper.getComponent(ComponentToFind)
// returns a wrapper with properly typed vm
expectType<string>(componentByType.vm.a)

// get by name
const componentByName = wrapper.getComponent({ name: 'ComponentToFind' })
// returns a wrapper with a generic vm (any)
expectType<ComponentPublicInstance>(componentByName.vm)

// get by string
const componentByString = wrapper.getComponent('other')
// returns a wrapper with a generic vm (any)
expectType<ComponentPublicInstance>(componentByString.vm)

// get by ref
const componentByRef = wrapper.getComponent({ ref: 'ref' })
// returns a wrapper with a generic vm (any)
expectType<ComponentPublicInstance>(componentByRef.vm)

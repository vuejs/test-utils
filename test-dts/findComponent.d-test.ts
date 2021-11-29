import { expectType } from './index'
import { defineComponent } from 'vue'
import { DOMWrapper, mount, VueWrapper } from '../src'
import WrapperLike from '../src/interfaces/wrapperLike'

const FuncComponent = () => 'hello'

const ComponentToFind = defineComponent({
  props: {
    a: {
      type: String,
      required: true
    }
  },
  template: ''
})

const ComponentWithEmits = defineComponent({
  emits: {
    hi: () => true
  },
  props: [],
  template: ''
})

const AppWithDefine = defineComponent({
  template: ''
})

const wrapper = mount(AppWithDefine)

// find by type - component definition
const componentByType = wrapper.findComponent(ComponentToFind)
expectType<VueWrapper<InstanceType<typeof ComponentToFind>>>(componentByType)

// find by type - component definition with emits
const componentWithEmitsByType = wrapper.findComponent(ComponentWithEmits)
expectType<VueWrapper<InstanceType<typeof ComponentWithEmits>>>(
  componentWithEmitsByType
)

// find by type - functional
const functionalComponentByType = wrapper.findComponent(FuncComponent)
expectType<DOMWrapper<Element>>(functionalComponentByType)

// find by string
const componentByString = wrapper.findComponent('.foo')
expectType<WrapperLike>(componentByString)

// findi by string with specifying component
const componentByStringWithParam =
  wrapper.findComponent<typeof ComponentToFind>('.foo')
expectType<VueWrapper<InstanceType<typeof ComponentToFind>>>(
  componentByStringWithParam
)

const functionalComponentByStringWithParam =
  wrapper.findComponent<typeof FuncComponent>('.foo')
expectType<DOMWrapper<Element>>(functionalComponentByStringWithParam)

// find by ref
const componentByRef = wrapper.findComponent({ ref: 'foo' })
expectType<VueWrapper>(componentByRef)

// find by ref with specifying component
const componentByRefWithType = wrapper.findComponent<typeof ComponentToFind>({
  ref: 'foo'
})
expectType<VueWrapper<InstanceType<typeof ComponentToFind>>>(
  componentByRefWithType
)

// find by name
const componentByName = wrapper.findComponent({ name: 'foo' })
expectType<VueWrapper>(componentByName)

// find by name with specifying component
const componentByNameWithType = wrapper.findComponent<typeof ComponentToFind>({
  name: 'foo'
})
expectType<VueWrapper<InstanceType<typeof ComponentToFind>>>(
  componentByNameWithType
)

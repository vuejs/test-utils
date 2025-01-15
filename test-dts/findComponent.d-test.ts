import { expectType } from './index'
import { defineComponent } from 'vue'
import { DOMWrapper, mount, VueWrapper } from '../src'
import WrapperLike from '../src/interfaces/wrapperLike'

const FuncComponent = () => 'hello'

const FuncComponentWithProps = (props: { a: string }) => 'hello'

const FuncComponentWithEmits = (
  props: object,
  ctx: { emit: (event: 'hi') => void }
) => 'hello'

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
expectType<DOMWrapper<Node>>(functionalComponentByType)

// find by type - functional component with props
const functionalComponentWithPropsByType = wrapper.findComponent(
  FuncComponentWithProps
)
expectType<DOMWrapper<Node>>(functionalComponentWithPropsByType)

// find by type - functional component with emits
const functionalComponentWithEmitsByType = wrapper.findComponent(
  FuncComponentWithEmits
)
expectType<DOMWrapper<Node>>(functionalComponentWithEmitsByType)

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

const functionalComponentWithPropsByString =
  wrapper.findComponent<typeof FuncComponentWithProps>('.foo')
expectType<DOMWrapper<Element>>(functionalComponentWithPropsByString)

const functionalComponentWithEmitsByString =
  wrapper.findComponent<typeof FuncComponentWithEmits>('.foo')
expectType<DOMWrapper<Element>>(functionalComponentWithEmitsByString)

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

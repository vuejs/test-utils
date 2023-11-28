import { expectType } from './index'
import { defineComponent } from 'vue'
import { mount } from '../src'

const AppWithDefine = defineComponent({
  template: ''
})

const wrapper = mount(AppWithDefine)
const domWrapper = wrapper.find('#other')

// find Vue wrapper
// HTML element selector
let inputMaybe = wrapper.find('input')
expectType<HTMLInputElement | undefined>(inputMaybe.element)

// SVG element selector
let lineMaybe = wrapper.find('line')
expectType<SVGLineElement | undefined>(lineMaybe.element)

// string selector
let byClassMaybe = wrapper.find('.todo')
expectType<Element | undefined>(byClassMaybe.element)

// find DOM wrapper
// HTML element selector
inputMaybe = domWrapper.find('input')
expectType<HTMLInputElement | undefined>(inputMaybe.element)

// SVG element selector
lineMaybe = domWrapper.find('line')
expectType<SVGLineElement | undefined>(lineMaybe.element)

// string selector
byClassMaybe = domWrapper.find('.todo')
expectType<Element | undefined>(byClassMaybe.element)

// findAll
// HTML element selector
let inputArray = wrapper.findAll('input')
expectType<HTMLInputElement | undefined>(inputArray[0].element)

// SVG element selector
let lineArray = wrapper.findAll('line')
expectType<SVGLineElement | undefined>(lineArray[0].element)

// string selector
let byClassArray = wrapper.findAll('.todo')
expectType<Element | undefined>(byClassArray[0].element)

// findAll DOM wrapper
// HTML element selector
inputArray = domWrapper.findAll('input')
expectType<HTMLInputElement | undefined>(inputArray[0].element)

// SVG element selector
lineArray = domWrapper.findAll('line')
expectType<SVGLineElement | undefined>(lineArray[0].element)

// string selector
byClassArray = domWrapper.findAll('.todo')
expectType<Element | undefined>(byClassArray[0].element)

// emitted

// event name without specific type
let incrementEventWithoutType = wrapper.emitted('increment')
expectType<unknown[][] | undefined>(incrementEventWithoutType)

// event name
let incrementEvent = wrapper.emitted<{ count: number }>('increment')
expectType<{ count: number }[] | undefined>(incrementEvent)
expectType<{ count: number }>(incrementEvent![0])

// without event name
let allEvents = wrapper.emitted()
expectType<Record<string, unknown[]>>(allEvents)

// get
// HTML element selector
let input = wrapper.get('input')
expectType<HTMLInputElement>(input.element)

// SVG element selector
let line = wrapper.get('line')
expectType<SVGLineElement>(line.element)

// string selector
let byClass = wrapper.get('.todo')
expectType<Element>(byClass.element)

// get DOM wrapper
// HTML element selector
input = domWrapper.get('input')
expectType<HTMLInputElement>(input.element)

// SVG element selector
line = domWrapper.get('line')
expectType<SVGLineElement>(line.element)

// string selector
byClass = domWrapper.get('.todo')
expectType<Element>(byClass.element)

// attributes
expectType<{ [key: string]: string }>(wrapper.attributes())
expectType<string | undefined>(wrapper.attributes('key'))
expectType<{ [key: string]: string }>(domWrapper.attributes())
expectType<string | undefined>(domWrapper.attributes('key'))

// classes
expectType<Array<string>>(wrapper.classes())
expectType<boolean>(wrapper.classes('class'))
expectType<Array<string>>(domWrapper.classes())
expectType<boolean>(domWrapper.classes('class'))

// props
expectType<{ [key: string]: any }>(wrapper.props())

const ComponentWithProps = defineComponent({
  props: {
    foo: String,
    bar: Number
  }
})

const propsWrapper = mount(ComponentWithProps)

propsWrapper.setProps({ foo: 'abc' })
propsWrapper.setProps({ foo: 'abc', bar: 123 })
// @ts-expect-error :: should require string
propsWrapper.setProps({ foo: 123 })
// @ts-expect-error :: unknown prop
propsWrapper.setProps({ badProp: true })

expectType<string | undefined>(propsWrapper.props().foo)
expectType<number | undefined>(propsWrapper.props().bar)
// @ts-expect-error :: unknown prop
propsWrapper.props().badProp

expectType<string | undefined>(propsWrapper.props('foo'))
expectType<number | undefined>(propsWrapper.props('bar'))
// @ts-expect-error :: unknown prop
propsWrapper.props('badProp')

const requiredPropsWrapper = mount(
  defineComponent({
    props: {
      foo: { type: String, required: true },
      bar: { type: Number, required: true }
    }
  }),
  {
    props: {
      foo: 'abc',
      bar: 123
    }
  }
)

requiredPropsWrapper.setProps({
  foo: 'abc'
})

requiredPropsWrapper.setProps({
  // @ts-expect-error wrong type
  foo: 1
})

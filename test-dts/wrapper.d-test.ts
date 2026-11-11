/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expectType } from './index'
import { defineComponent, h } from 'vue'
import { mount, shallowMount } from '../src'
import EmitsSfc from './EmitsSfc.vue'

const AppWithDefine = defineComponent({
  template: ''
})

const wrapper = mount(AppWithDefine)
const domWrapper = wrapper.find('#other')

// find Vue wrapper
// HTML element selector
let inputMaybe = wrapper.find('input')
expectType<HTMLInputElement | undefined>(inputMaybe.element)

const buttonComp = mount(
  defineComponent({ template: '<button>Click me</button>' })
)
expectType<HTMLButtonElement>(buttonComp.element)

const multiRootComp = mount(defineComponent({ template: '<span /><span />' }))
// this will be a wrapper div element like so: <div data-v-app="">
expectType<HTMLDivElement>(multiRootComp.element)
expectType<HTMLSpanElement>(multiRootComp.element.firstElementChild)

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
const incrementEventWithoutType = wrapper.emitted('increment')
expectType<unknown[][] | undefined>(incrementEventWithoutType)

// event name
const incrementEvent = wrapper.emitted<{ count: number }>('increment')
expectType<{ count: number }[] | undefined>(incrementEvent)
expectType<{ count: number }>(incrementEvent![0])

// without event name
const allEvents = wrapper.emitted()
expectType<Record<string, unknown[]>>(allEvents)

// inferred event names and payload types from the component's emits option
const EmittedComp = defineComponent({
  emits: {
    change: (v: string) => true,
    select: (id: number, label: string) => true,
    plain: null
  },
  template: ''
})
const emittedWrapper = mount(EmittedComp)

const changeEvent = emittedWrapper.emitted('change')
expectType<[string][] | undefined>(changeEvent)
expectType<[string]>(changeEvent![0])

const selectEvent = emittedWrapper.emitted('select')
expectType<[number, string][] | undefined>(selectEvent)
expectType<[number, string]>(selectEvent![0])

const plainEvent = emittedWrapper.emitted('plain')
expectType<any[][] | undefined>(plainEvent)

// an undeclared event name keeps the untyped shape
const unknownEvent = emittedWrapper.emitted('undeclared')
expectType<unknown[][] | undefined>(unknownEvent)

// array-form emits: names infer, payloads stay untyped
const ArrayEmitsComp = defineComponent({
  emits: ['alpha', 'beta'],
  template: ''
})
const arrayEmitsWrapper = mount(ArrayEmitsComp)
const alphaEvent = arrayEmitsWrapper.emitted('alpha')
expectType<any[][] | undefined>(alphaEvent)

// payloads are inferred alongside defineProps/defineModel in <script setup>
const sfcWrapper = mount(EmitsSfc, { props: { title: '', count: 0 } })
expectType<[number, string][] | undefined>(sfcWrapper.emitted('select'))
expectType<[number][] | undefined>(sfcWrapper.emitted('update:count'))

// and for defineComponent with a setup function
const FnEmitsComp = defineComponent(
  (props: { msg: string }) => () => props.msg,
  { props: ['msg'], emits: { change: (n: number) => true } }
)
const fnEmitsWrapper = mount(FnEmitsComp, { props: { msg: '' } })
expectType<[number][] | undefined>(fnEmitsWrapper.emitted('change'))

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

// props resolved from defaults
const ComponentWithDefaults = defineComponent({
  props: {
    a: { type: String, default: 'default' },
    optional: String,
    required: { type: String, required: true },
    boolean: Boolean,
    undefinedDefault: { type: Boolean, default: undefined }
  },
  emits: ['change'],
  template: '<div />'
})
const defaultsWrapper = mount(ComponentWithDefaults, {
  props: { required: 'required' }
})

expectType<string>(defaultsWrapper.props('a'))
expectType<string>(defaultsWrapper.props().a)
expectType<string | undefined>(defaultsWrapper.props('optional'))
expectType<string | undefined>(defaultsWrapper.props().optional)
expectType<string>(defaultsWrapper.props('required'))
expectType<string>(defaultsWrapper.props().required)
expectType<boolean>(defaultsWrapper.props('boolean'))
expectType<boolean>(defaultsWrapper.props().boolean)
expectType<boolean | undefined>(defaultsWrapper.props('undefinedDefault'))
expectType<boolean | undefined>(defaultsWrapper.props().undefinedDefault)
expectType<typeof defaultsWrapper.vm.$props.onChange>(
  defaultsWrapper.props('onChange')
)
expectType<typeof defaultsWrapper.vm.$props.key>(defaultsWrapper.props('key'))
// @ts-expect-error :: unknown prop
defaultsWrapper.props('missing')
defaultsWrapper.setProps({ a: undefined })
// @ts-expect-error :: should require string
defaultsWrapper.setProps({ a: 123 })

const shallowDefaultsWrapper = shallowMount(ComponentWithDefaults, {
  props: { required: 'required' }
})
expectType<string>(shallowDefaultsWrapper.props('a'))
expectType<string>(shallowDefaultsWrapper.props().a)

const childWithDefaults = mount({
  render: () => h(ComponentWithDefaults, { required: 'required' })
}).findComponent(ComponentWithDefaults)
expectType<string>(childWithDefaults.props('a'))
expectType<string>(childWithDefaults.props().a)

// a setup binding shadowing a prop does not change the prop type
const shadowedPropsWrapper = mount(
  defineComponent({
    props: {
      required: { type: String, required: true },
      optional: String,
      defaulted: { type: String, default: 'default' }
    },
    setup: () => ({ required: 123, optional: 'local', defaulted: 123 }),
    template: '<div />'
  }),
  { props: { required: 'required' } }
)

expectType<string>(shadowedPropsWrapper.props('required'))
expectType<string>(shadowedPropsWrapper.props().required)
expectType<string | undefined>(shadowedPropsWrapper.props('optional'))
expectType<string | undefined>(shadowedPropsWrapper.props().optional)
expectType<string>(shadowedPropsWrapper.props('defaulted'))
expectType<string>(shadowedPropsWrapper.props().defaulted)

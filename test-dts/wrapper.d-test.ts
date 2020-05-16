import { expectType } from 'tsd'
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
expectType<string>(wrapper.attributes('key'))
expectType<{ [key: string]: string }>(domWrapper.attributes())
expectType<string>(domWrapper.attributes('key'))

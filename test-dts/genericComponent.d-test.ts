import { expectType } from './index'
import type { VueWrapper } from '../src'
import { type VNode, defineComponent } from 'vue'
import { mount } from '../src'

declare const GenericSelect: <Item>(props: { items: Item[] }) => VNode

const wrapper = mount(defineComponent({ template: '' }))
const result = wrapper.findComponent(GenericSelect)
expectType<VueWrapper>(result)

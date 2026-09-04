import { expectType } from './index'
import type { FunctionalComponent, VNode } from 'vue'
import { defineComponent, h } from 'vue'
import { mount } from '../src'
import type { DOMWrapper, VueWrapper } from '../src'
import type WrapperLike from '../src/interfaces/wrapperLike'

// Real generic SFC. `vue-tsc` emits a generic call signature whose return
// type carries a `__ctx` property; that is the discriminator the overload
// in `src/baseWrapper.ts` keys on to pick `VueWrapper` over `DOMWrapper`.
// Resolved by `vue-tsc` via the `tsd` script (see package.json) so the type
// below is the actual shape vue-tsc would emit for a user component, not
// a hand-written mock.
import GenericSfc from './GenericSfc.vue'

// A plain generic functional component returns bare `VNode` (no `__ctx`).
declare const GenericFunctional: <T>(props: { items: T[] }) => VNode

const wrapper = mount(defineComponent({ template: '' }))

// ---- findComponent ----
// vue-tsc generic SFC should resolve to VueWrapper, not DOMWrapper.
const sfcFound = wrapper.findComponent(GenericSfc)
expectType<VueWrapper>(sfcFound)
// `.vm` is a VueWrapper-only API; it must type-check on the vue-tsc SFC result.
expectType<unknown>(sfcFound.vm)

// Plain generic functional component must still resolve to DOMWrapper; `.vm`
// should NOT type-check (use @ts-expect-error to assert this).
const fnFound = wrapper.findComponent(GenericFunctional)
expectType<DOMWrapper<Node>>(fnFound)
void (
  // @ts-expect-error -- DOMWrapper has no `vm` property.
  fnFound.vm
)

// ---- getComponent ----
const sfcGot = wrapper.getComponent(GenericSfc)
expectType<Omit<VueWrapper, 'exists'>>(sfcGot)
void (
  // @ts-expect-error -- `exists` is stripped on getComponent.
  sfcGot.exists
)
expectType<unknown>(sfcGot.vm)

const fnGot = wrapper.getComponent(GenericFunctional)
expectType<Omit<DOMWrapper<Element>, 'exists'>>(fnGot)
void (
  // @ts-expect-error -- DOMWrapper has no `vm` property.
  fnGot.vm
)

// ---- findAllComponents ----
const sfcAll = wrapper.findAllComponents(GenericSfc)
expectType<VueWrapper[]>(sfcAll)
expectType<unknown | undefined>(sfcAll[0]?.vm)

const fnAll = wrapper.findAllComponents(GenericFunctional)
expectType<DOMWrapper<Node>[]>(fnAll)
void (
  // @ts-expect-error -- DOMWrapper<Node>[] elements have no `vm` property.
  fnAll[0]?.vm
)

// A `FunctionalComponent`-typed component has a call signature returning `any`
// (see Vue's FunctionalComponent type). The `any` return must not satisfy the
// `__ctx` discriminator, so all three APIs keep resolving to DOMWrapper and
// `.vm` must not type-check.
const PlainFunctional: FunctionalComponent<{ a: string }> = props =>
  h('div', props.a)

// ---- findComponent (FunctionalComponent shape) ----
const fcFound = wrapper.findComponent(PlainFunctional)
expectType<DOMWrapper<Node>>(fcFound)
void (
  // @ts-expect-error -- DOMWrapper has no `vm` property.
  fcFound.vm
)

// ---- getComponent (FunctionalComponent shape) ----
const fcGot = wrapper.getComponent(PlainFunctional)
expectType<Omit<DOMWrapper<Element>, 'exists'>>(fcGot)
void (
  // @ts-expect-error -- DOMWrapper has no `vm` property.
  fcGot.vm
)

// ---- findAllComponents (FunctionalComponent shape) ----
const fcAll = wrapper.findAllComponents(PlainFunctional)
expectType<DOMWrapper<Node>[]>(fcAll)
void (
  // @ts-expect-error -- DOMWrapper<Node>[] elements have no `vm` property.
  fcAll[0]?.vm
)

// The WrapperLike interface mirrors the BaseWrapper overloads, including the
// `any`-return guard.
const wrapperLike: WrapperLike = wrapper
expectType<DOMWrapper<Element>>(wrapperLike.findComponent(PlainFunctional))
expectType<DOMWrapper<Node>[]>(wrapperLike.findAllComponents(PlainFunctional))
expectType<Omit<DOMWrapper<Element>, 'exists'>>(
  wrapperLike.getComponent(PlainFunctional)
)

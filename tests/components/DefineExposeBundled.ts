// @ts-ignore
import {
  defineComponent,
  ref,
  openBlock,
  createElementBlock,
  Fragment,
  createElementVNode,
  toDisplayString
} from 'vue'
const exposedState1 = 'exposedState1'
const exposedState2 = 'exposedState2'
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    name: 'Hello'
  },
  __name: 'DefineExposeScriptSetup',
  setup(__props, { expose: __expose }) {
    const exposedState2Getter = () => {
      return exposedState2
    }
    const exposedRef = ref('exposedRef')
    const exposedRefGetter = () => {
      return exposedRef.value
    }
    const exposedMethod1 = () => {
      return 'result of exposedMethod1'
    }
    const exposedMethod2 = () => {
      return 'result of exposedMethod2'
    }
    const refNonExposed = ref('refNonExposed')
    const refNonExposedGetter = () => {
      return refNonExposed.value
    }
    const count = ref(0)
    const inc = () => {
      count.value++
    }
    const resetCount = () => {
      count.value = 0
    }
    __expose({
      exposeObjectLiteral: 'exposeObjectLiteral',
      exposedState1,
      exposedState2Alias: exposedState2,
      exposedState2Getter,
      exposedRef,
      exposedRefGetter,
      exposedMethod1,
      exposedMethod2Alias: exposedMethod2,
      count,
      resetCount,
      refNonExposedGetter
    })
    return (_ctx, _cache) => {
      return (
        openBlock(),
        createElementBlock(
          Fragment,
          null,
          [
            createElementVNode(
              'button',
              { onClick: inc },
              toDisplayString(count.value),
              1
            ),
            createElementVNode(
              'div',
              { 'force-expose': exposedMethod1 },
              toDisplayString(refNonExposed.value),
              1
            )
          ],
          64
        )
      )
    }
  }
})
export default _sfc_main

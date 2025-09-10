// @ts-ignore
import { openBlock, createElementBlock } from 'vue'
const _sfc_main = {
  __name: 'FindComponentExposeScriptSetupBundled',
  props: {
    someProp: String
  },
  setup(__props, { expose: __expose }) {
    const exposedFn = () => {
      return 'exposedFnReturn'
    }
    __expose({
      exposedFn
    })
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock('div', null, 'Example')
    }
  }
}
export default _sfc_main

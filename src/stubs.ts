import { transformVNodeArgs, h } from 'vue'

interface IStubOptions {
  name?: string
}

// TODO: figure out how to type this
type VNodeArgs = any[]

export const createStub = (options: IStubOptions) => {
  const tag = options.name ? `${options.name}-stub` : 'anonymous-stub'
  const render = () => h(tag)

  return { name: tag, render }
}

const isHTMLElement = (args: VNodeArgs) =>
  Array.isArray(args) && typeof args[0] === 'string'
const isCommentOrFragment = (args: VNodeArgs) => typeof args[0] === 'symbol'
const isParent = (args: VNodeArgs) =>
  typeof args[0] === 'object' && args[0]['name'] === 'VTU_COMPONENT'
const isComponent = (args: VNodeArgs) => typeof args[0] === 'object'

export function stubComponents(stubs: Record<any, any>) {
  transformVNodeArgs((args) => {
    if (isHTMLElement(args) || isCommentOrFragment(args) || isParent(args)) {
      return args
    }

    if (isComponent(args) && args[0]['name'] in stubs) {
      // return a stub component by matching Vue's `h` function
      // where the signature is h(Component, props, children)
      const name = args[0]['name']
      const stub = stubs[name]

      // default stub
      if (stub === true) {
        return [createStub({ name }), {}]
      }

      if (typeof stub === 'object') {
        return [stubs[name], {}]
      }
    }

    return args
  })
}

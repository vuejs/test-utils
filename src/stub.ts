import { h } from 'vue'

interface IStubOptions {
  name?: string
}

export const createStub = (options: IStubOptions) => {
  const tag = options.name ? `${options.name}-stub` : 'anonymous-stub'
  const render = () => h(tag)

  return { name: tag, render }
}

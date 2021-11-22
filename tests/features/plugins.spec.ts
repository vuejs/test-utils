import { ComponentPublicInstance } from 'vue'

import { mount, config, VueWrapper } from '../../src'

declare module '../../src/vueWrapper' {
  interface VueWrapper {
    width(): number
    $el: Element
    myMethod(): void
    greet: (name: string) => string
  }
}

const textValue = `I'm the innerHTML`
const mountComponent = () => mount({ template: `<h1>${textValue}</h1>` })

describe('Plugin#install', () => {
  beforeEach(() => {
    config.plugins.VueWrapper.reset()
  })

  it('accepts options', () => {
    function PluginWithOptions(
      wrapper: VueWrapper<ComponentPublicInstance>,
      options: Record<string, string>
    ) {
      return {
        greet: (name: string) => {
          return `${options.msg}, ${name}`
        }
      }
    }
    config.plugins.VueWrapper.install(PluginWithOptions, { msg: 'Hello' })

    const wrapper = mountComponent()
    expect(wrapper.greet('Lachlan')).toBe('Hello, Lachlan')
  })

  it('extends wrappers with the return values from the install function', () => {
    const width = 230
    const plugin = () => ({ width })
    config.plugins.VueWrapper.install(plugin)
    const wrapper = mountComponent()
    expect(wrapper).toHaveProperty('width', width)
  })

  it('receives the wrapper inside the plugin setup', () => {
    const plugin = (wrapper: VueWrapper<ComponentPublicInstance>) => {
      return {
        $el: wrapper.element // simple aliases
      }
    }
    config.plugins.VueWrapper.install(plugin)
    const wrapper = mountComponent()
    expect(wrapper.$el.innerHTML).toEqual(textValue)
  })

  it('supports functions', () => {
    const myMethod = jest.fn()
    const plugin = () => ({ myMethod })
    config.plugins.VueWrapper.install(plugin)
    mountComponent().myMethod()
    expect(myMethod).toHaveBeenCalledTimes(1)
  })

  describe('error states', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      // @ts-ignore
      console.error.mockRestore()
    })

    const plugins = [
      () => false,
      () => true,
      () => [],
      true,
      false,
      'property',
      120
    ]

    it.each(plugins)(
      'Calling install with %p is handled gracefully',
      (plugin) => {
        config.plugins.VueWrapper.install(plugin as any)
        expect(() => mountComponent()).not.toThrow()
      }
    )
  })
})

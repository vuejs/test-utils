import { ComponentPublicInstance, h } from 'vue'

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

describe('createStubs', () => {
  const Child1 = {
    name: 'child1',
    render: () => h('div', 'real child 1')
  }
  const Child2 = {
    name: 'child2',
    render: () => h('div', 'real child 2')
  }

  const Parent = {
    render: () => h('div', [
      h(Child1),
      h(Child1),
      h(Child2)
    ])
  }

  const customCreateStub = jest.fn(({ name }) => h(`${name}-custom-stub`))
  beforeAll(() => {
    config.plugins.createStubs = customCreateStub
  })

  afterAll(() => {
    config.plugins.createStubs = undefined
  })

  beforeEach(() => {
    customCreateStub.mockClear()
  })

  it('should be called for every stub once', () => {
    const wrapper = mount(Parent, {
      shallow: true
    })

    expect(wrapper.html()).toBe('<div>\n' +
      '  <child1-custom-stub></child1-custom-stub>\n' +
      '  <child1-custom-stub></child1-custom-stub>\n' +
      '  <child2-custom-stub></child2-custom-stub>\n' +
      '</div>')

    expect(customCreateStub).toHaveBeenCalledTimes(2)
    expect(customCreateStub).toHaveBeenCalledWith({ name: 'child1', component: Child1 })
    expect(customCreateStub).toHaveBeenCalledWith({ name: 'child2', component: Child2 })
  })

  it('should be called only for stubbed components', () => {
    const wrapper = mount(Parent, {
      global: {
        stubs: {
          child2: true
        }
      }
    })

    expect(wrapper.html()).toBe('<div>\n' +
      '  <div>real child 1</div>\n' +
      '  <div>real child 1</div>\n' +
      '  <child2-custom-stub></child2-custom-stub>\n' +
      '</div>')

    expect(customCreateStub).toHaveBeenCalledTimes(1)
    expect(customCreateStub).toHaveBeenCalledWith({ name: 'child2', component: Child2 })
  })

  it('should not be called for no stubs', () => {
    const wrapper = mount(Parent)

    expect(wrapper.html()).toBe('<div>\n' +
      '  <div>real child 1</div>\n' +
      '  <div>real child 1</div>\n' +
      '  <div>real child 2</div>\n' +
      '</div>')

    expect(customCreateStub).not.toHaveBeenCalled()
  })

  it('should not be called for manual stubs', () => {
    const wrapper = mount(Parent, {
      shallow: true,
      global: {
        stubs: {
          child2: () => h('div', 'Child 2 stub')
        }
      }
    })

    expect(wrapper.html()).toBe('<div>\n' +
      '  <child1-custom-stub></child1-custom-stub>\n' +
      '  <child1-custom-stub></child1-custom-stub>\n' +
      '  <div>Child 2 stub</div>\n' +
      '</div>')

    expect(customCreateStub).toHaveBeenCalledTimes(1)
    expect(customCreateStub).toHaveBeenCalledWith({ name: 'child1', component: Child1 })
  })
})

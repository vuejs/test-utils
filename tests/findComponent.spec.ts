import { defineComponent, nextTick, h } from 'vue'
import { mount } from '../src'
import Hello from './components/Hello.vue'
import ComponentWithoutName from './components/ComponentWithoutName.vue'

const compC = defineComponent({
  name: 'ComponentC',
  template: '<div class="C">C</div>'
})

const compD = defineComponent({
  name: 'ComponentD',
  template: '<comp-c class="c-as-root-on-d" />',
  components: { compC }
})

const compB = defineComponent({
  name: 'component-b',
  template: `
    <div class="B">
      TextBefore
      <comp-c />
      TextAfter
      <comp-c />
      <comp-d id="compD" />
    </div>`,
  components: { compC, compD }
})

const compA = defineComponent({
  template: `
    <div class="A">
      <comp-b />
      <hello ref="hello" />
      <div class="domElement" />
    </div>`,
  components: { compB, Hello }
})

const createRenderComponent = (
  name: string,
  props: Record<string, string> = {},
  children?: any
) => ({
  name,
  render() {
    return h('div', props, children)
  }
})

describe('findComponent', () => {
  it('works with simple render functions', () => {
    const Child = {
      name: 'Child',
      render() {
        return h('div', { id: 'child' })
      }
    }
    const Parent = {
      name: 'Parent',
      render() {
        return h(Child)
      }
    }

    const wrapper = mount(Parent)
    wrapper.getComponent(Child)
  })

  it('works with simple render functions many layers deep', () => {
    const A = createRenderComponent('A', { id: 'a' })
    const B = createRenderComponent('B', { id: 'b' }, h(A))
    const C = createRenderComponent('C', { id: 'c' }, h(B))
    const Parent = createRenderComponent('Parent', { id: 'parent' }, h(C))

    const wrapper = mount(Parent)
    wrapper.getComponent(A)
  })

  it('does not find plain dom elements', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent('.domElement').exists()).toBeFalsy()
  })

  it('finds component by ref', () => {
    const wrapper = mount(compA)
    // find by ref
    expect(wrapper.findComponent({ ref: 'hello' })).toBeTruthy()
  })

  it('finds component by dom selector', () => {
    const wrapper = mount(compA)
    // find by DOM selector
    expect(wrapper.findComponent('.C').vm).toHaveProperty(
      '$options.name',
      'ComponentC'
    )
  })

  it('does allows using complicated DOM selector query', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent('.B > .C').vm).toHaveProperty(
      '$options.name',
      'ComponentC'
    )
  })

  it('finds a component when root of mounted component', async () => {
    const wrapper = mount(compD)
    // make sure it finds the component, not its root
    expect(wrapper.findComponent('.c-as-root-on-d').vm).toHaveProperty(
      '$options.name',
      'ComponentC'
    )
  })

  it('finds component by name', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent({ name: 'Hello' }).text()).toBe('Hello world')
    expect(wrapper.findComponent({ name: 'ComponentB' }).exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'component-c' }).exists()).toBeTruthy()
  })

  it('finds component without a name by using its object definition', () => {
    const Component = {
      template: '<div><component-without-name/></div>',
      components: {
        ComponentWithoutName
      }
    }
    const wrapper = mount(Component)
    expect(wrapper.findComponent(ComponentWithoutName).exists()).toBe(true)
  })

  it('finds a component without a name by its locally assigned name', () => {
    const Component = {
      template: '<div><component-without-name/></div>',
      components: {
        ComponentWithoutName
      }
    }
    const wrapper = mount(Component)
    expect(
      wrapper.findComponent({ name: 'ComponentWithoutName' }).exists()
    ).toBe(true)
  })

  it('finds component by imported SFC file', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent(Hello).text()).toBe('Hello world')
    expect(wrapper.findComponent(compC).text()).toBe('C')
  })

  it('finds component in a Suspense', async () => {
    const AsyncComponent = defineComponent({
      template: '{{ result }}',
      async setup() {
        return { result: 'Hello world' }
      }
    })
    const SuspenseComponent = defineComponent({
      template: `<Suspense>
        <template #default><AsyncComponent/></template>
        <template #fallback><CompC/></template>
      </Suspense>`,
      components: {
        AsyncComponent,
        CompC: compC
      }
    })
    const wrapper = mount(SuspenseComponent)
    expect(wrapper.html()).toContain('<div class="C">C</div>')
    expect(wrapper.findComponent(compC).exists()).toBe(true)
    expect(wrapper.findComponent(AsyncComponent).exists()).toBe(false)
    await nextTick()
    await nextTick()
    expect(wrapper.html()).toContain('Hello world')
    expect(wrapper.findComponent(compC).exists()).toBe(false)
    expect(wrapper.findComponent(AsyncComponent).exists()).toBe(true)
    expect(wrapper.findComponent(AsyncComponent).text()).toBe('Hello world')
  })

  it('finds a stub by name', () => {
    const wrapper = mount(compA, {
      global: {
        stubs: ['Hello']
      }
    })
    expect(wrapper.findComponent({ name: 'Hello' }).exists()).toBe(true)
  })

  it('finds a stub by ref', () => {
    const compA = {
      template: '<div><Hello ref="hello">asd</Hello></div>',
      components: {
        Hello: { name: 'Hello' }
      }
    }
    const wrapper = mount(compA, {
      global: {
        stubs: ['Hello']
      }
    })

    expect(wrapper.findComponent({ ref: 'hello' }).exists()).toBe(true)
  })

  it('throw error if trying to unmount component from find', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent(Hello).unmount).toThrowError()
  })

  it('finds nested components and obtains expected html and innerText', () => {
    const ComponentA = {
      name: 'ComponentA',
      template: `<div><slot></slot></div>`
    }
    const ComponentB = {
      name: 'ComponentB',
      template: '<div><slot></slot></div>'
    }

    const wrapper = mount({
      components: {
        ComponentA,
        ComponentB
      },
      template: `
        <ComponentA>
          <ComponentB>1</ComponentB>
          <ComponentB>2</ComponentB>
          <ComponentB>3</ComponentB>
        </ComponentA>
      `
    })
    const com1 = wrapper.findComponent(ComponentB)
    expect(com1.html()).toBe('<div>1</div>')
  })

  it('finds nested components and obtains expected html and innerText', () => {
    const ComponentA = {
      name: 'ComponentA',
      template: `<div><slot></slot></div>`
    }
    const ComponentB = {
      name: 'ComponentB',
      template: '<div><slot></slot></div>'
    }

    const wrapper = mount({
      components: {
        ComponentA,
        ComponentB
      },
      template: `
        <ComponentA>
          <ComponentB>
            <div class="content" id="1">1</div>
          </ComponentB>
          <ComponentB>
            <div class="content" id="2">2</div>
          </ComponentB>
          <ComponentB>
            <div class="content" id="3">3</div>
          </ComponentB>
        </ComponentA>
      `
    })

    const compB = wrapper.findAllComponents(ComponentB)
    expect(compB[0].find('.content').text()).toBe('1')
    expect(compB[0].vm.$el.querySelector('.content').innerHTML).toBe('1')
    expect(compB[0].vm.$el.querySelector('.content').textContent).toBe('1')
  })

  it('finds component in deeply nested render function and slots', () => {
    const ComponentA = {
      name: 'ComponentA',
      render() {
        return h('div', { class: 'comp-a' }, this.$slots.default())
      }
    }
    const ComponentB = {
      name: 'ComponentB',
      render() {
        return h('div', { class: 'comp-b' }, this?.$slots?.default?.())
      }
    }

    const Main = defineComponent({
      name: 'Main',
      render() {
        return h(ComponentA, () => [h(ComponentB, () => '1')])
      }
    })

    const App = {
      name: 'App',
      render() {
        return h(Main)
      }
    }

    const wrapper = mount(App)
    wrapper.getComponent(ComponentB)
  })

  it('finds functional components', () => {
    const Functional = () => h('h4', 'functional')

    const App = {
      name: 'Main',
      render() {
        return h(Functional)
      }
    }

    const wrapper = mount(App)

    wrapper.getComponent(Functional)
  })
})

import { defineComponent, h, nextTick } from 'vue'
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
  name: 'A',
  template: `
    <div class="A">
      <comp-b />
      <hello ref="hello" />
      <div class="domElement" />
    </div>`,
  components: { compB, Hello }
})

describe('findComponent', () => {
  it('does not find plain dom elements', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent('.domElement').exists()).toBeFalsy()
  })

  it('finds component by ref', () => {
    const wrapper = mount(compA)
    // find by ref
    expect(wrapper.findComponent({ ref: 'hello' }).exists()).toBe(true)
  })

  it('does not find plain dom element by ref', () => {
    const ComponentWithRefOnDomElement = defineComponent({
      template: '<div ref="hello">Hello!</div>'
    })
    const wrapper = mount(ComponentWithRefOnDomElement)

    expect(wrapper.findComponent({ ref: 'hello' }).exists()).toBe(false)
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

  it('finds component by name', () => {
    const wrapper = mount(compA)
    expect(wrapper.findComponent({ name: 'Hello' }).text()).toBe('Hello world')
    expect(wrapper.findComponent({ name: 'ComponentB' }).exists()).toBeTruthy()
    expect(wrapper.findComponent({ name: 'component-c' }).exists()).toBeTruthy()
  })

  it('finds root component', async () => {
    const Comp = defineComponent({
      name: 'C',
      template: `
        <input v-model="msg" />
        {{ msg }}
      `,
      data() {
        return { msg: 'foo' }
      }
    })
    const wrapper = mount(Comp)
    expect(wrapper.findComponent(Comp).exists()).toBe(true)
    await wrapper.find('input').setValue('bar')
    expect(wrapper.html()).toContain('bar')
  })

  it('finds root component when recursion is used', async () => {
    const Comp = defineComponent({
      props: ['depth'],
      name: 'Comp',
      template: `
        <Comp :depth="depth + 1" v-if="depth < 2" />
        Depth {{ depth }}
      `
    })
    const wrapper = mount(Comp, { props: { depth: 0 } })
    expect(wrapper.findComponent(Comp).props('depth')).toBe(0)
  })

  it('finds root component without name', async () => {
    const Comp = defineComponent({
      template: `
        <input v-model="msg" />
        {{ msg }}
      `,
      data() {
        return { msg: 'foo' }
      }
    })
    const wrapper = mount(Comp)
    expect(wrapper.findComponent(Comp).exists()).toBe(true)
    await wrapper.find('input').setValue('bar')
    expect(wrapper.html()).toContain('bar')
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

  it('finds a component by its definition with shallow', () => {
    const Component = {
      template: '<div><other-name /></div>',
      components: {
        OtherName: Hello
      }
    }
    const wrapper = mount(Component, { shallow: true })
    expect(wrapper.findComponent(Hello).exists()).toBe(true)
  })

  it('finds a component by its definition when using stub without name', () => {
    const StubWithoutName = {
      template: '<div>stub-without-name</div>'
    }

    const Component = {
      template: '<div><other-name /></div>',
      components: {
        OtherName: Hello
      }
    }

    const wrapper = mount(Component, {
      global: { stubs: { Hello: StubWithoutName } }
    })
    expect(wrapper.findComponent(Hello).exists()).toBe(true)
  })

  it('finds a component by its definition when stub is reused', () => {
    const reusedStub = { template: '<div>universal stub</div>' }

    const wrapper = mount(compA, {
      global: {
        stubs: {
          Hello: reusedStub,
          compB: reusedStub
        }
      }
    })

    expect(wrapper.findComponent(Hello).exists()).toBe(true)
    expect(wrapper.findComponent(compB).exists()).toBe(true)
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

  // https://github.com/vuejs/vue-test-utils-next/issues/173
  const ComponentA = {
    name: 'ComponentA',
    template: `<div><slot></slot></div>`
  }

  const ComponentB = {
    name: 'ComponentB',
    template: '<div><slot></slot></div>'
  }

  it('finds nested components and obtains expected html and innerText', () => {
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

  // https://github.com/vuejs/vue-test-utils-next/pull/188
  const slotComponent = defineComponent({
    name: 'slotA',
    template: '<div><slot /><slot name="b" /></div>'
  })
  const SlotMain = defineComponent({
    name: 'SlotMain',
    template:
      '<slot-component><comp-b /><comp-b /><comp-b /><comp-c v-slot:b /></slot-component>',
    components: { slotComponent, compB, compC }
  })
  const SlotApp = defineComponent({
    name: 'SlotApp',
    template: `<slot-main />`,
    components: { SlotMain }
  })

  it('finds components with slots which will be compiled to `{ default: () => [children] }`', () => {
    const wrapper = mount(SlotApp)
    expect(wrapper.findComponent(slotComponent).exists()).toBe(true)
    expect(wrapper.findComponent(compB).exists()).toBe(true)
    expect(wrapper.findComponent(compC).exists()).toBe(true)
    expect(wrapper.findComponent(SlotMain).exists()).toBe(true)
  })

  it('finds a functional component', () => {
    const Func = () => h('h2')
    const wrapper = mount({
      setup() {
        return () => h('span', {}, h(Func))
      }
    })
    expect(wrapper.findComponent(Func).exists()).toBe(true)
  })

  it('finds a functional component in a fragment', () => {
    const Func = () => h('h2')
    const wrapper = mount({
      setup() {
        return () => [h('span'), h('span', {}, h(Func))]
      }
    })
    expect(wrapper.findComponent(Func).exists()).toBe(true)
  })

  describe('chaining from dom wrapper', () => {
    it('finds a component nested inside a node', () => {
      const Comp = defineComponent({
        components: { Hello: Hello },
        template: '<div><div class="nested"><Hello /></div></div>'
      })

      const wrapper = mount(Comp)
      expect(wrapper.find('.nested').findComponent(Hello).exists()).toBe(true)
    })

    it('finds a component inside DOM node', () => {
      const Comp = defineComponent({
        components: { Hello: Hello },
        template:
          '<div><Hello class="one"/><div class="nested"><Hello class="two" /></div></div>'
      })

      const wrapper = mount(Comp)
      expect(wrapper.find('.nested').findComponent(Hello).classes('two')).toBe(
        true
      )
    })

    it('returns correct instance of recursive component', () => {
      const Comp = defineComponent({
        name: 'Comp',
        props: ['firstLevel'],
        template:
          '<div class="first"><div class="nested"><Comp v-if="firstLevel" class="second" /></div></div>'
      })

      const wrapper = mount(Comp, { props: { firstLevel: true } })
      expect(
        wrapper.find('.nested').findComponent(Comp).classes('second')
      ).toBe(true)
    })

    it('returns top-level component if it matches', () => {
      const Comp = defineComponent({
        name: 'Comp',
        template: '<div class="top"></div>'
      })

      const wrapper = mount(Comp)
      expect(wrapper.find('.top').findComponent(Comp).classes('top')).toBe(true)
    })

    it('finds functional components by component displayName', () => {
      const cmp = () => h('button', { class: 'some-class ' })
      cmp.displayName = 'FuncButton'
      const Comp = defineComponent({
        components: { ChildComponent: cmp },
        template: '<div><child-component />Test</button></div>'
      })

      const wrapper = mount(Comp)
      expect(wrapper.findAllComponents({ name: cmp.displayName }).length).toBe(
        1
      )
      expect(wrapper.findComponent({ name: cmp.displayName }).exists()).toBe(
        true
      )
    })

    it('uses refs of correct component when searching by ref', () => {
      const Child = defineComponent({
        components: { Hello },
        template: '<div><Hello ref="testRef" class="inside" /></div>'
      })
      const Comp = defineComponent({
        components: { Child, Hello },
        template:
          '<div><Child class="nested" /><Hello ref="testRef" class="outside" /></div>'
      })

      const wrapper = mount(Comp)
      expect(
        wrapper
          .find('.nested')
          .findComponent({ ref: 'testRef' })
          .classes('inside')
      ).toBe(true)
    })
  })
})

import 'reflect-metadata'
import { h } from 'vue'
import { Options, Vue } from 'vue-class-component'
import { mount } from '../../src'
import ClassComponent from '../components/ClassComponent.vue'

describe('class component', () => {
  it('minimal class component', () => {
    class Foo extends Vue {
      render() {
        return h('span')
      }
    }
    const wrapper = mount(Foo)
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('data: $props should be available', () => {
    @Options({
      props: ['foo']
    })
    class MyComp extends Vue {
      message = 'answer is ' + (this.$props as any).foo
      render() {
        return h('div', this.message)
      }
    }

    const wrapper = mount(MyComp, {
      props: {
        foo: 42
      }
    })

    expect(wrapper.html()).toBe('<div>answer is 42</div>')
  })

  it('hooks', () => {
    let created = false
    class MyComp extends Vue {
      created() {
        created = true
      }
      render() {
        return h('div')
      }
    }
    mount(MyComp)
    expect(created).toBe(true)
  })

  it('methods', () => {
    let msg: string = ''

    class MyComp extends Vue {
      hello() {
        msg = 'hi'
      }
      content() {
        return 'content'
      }
      render() {
        return h('div', this.content())
      }
    }

    const wrapper = mount(MyComp)
    wrapper.vm.hello()
    expect(wrapper.html()).toBe('<div>content</div>')
    expect(msg).toBe('hi')
  })

  it('computed', () => {
    class MyComp extends Vue {
      a!: number
      data() {
        return {
          a: 1
        }
      }
      get b() {
        return this.a + 1
      }
      render() {
        return h('div')
      }
    }

    const wrapper = mount(MyComp)
    expect(wrapper.vm.a).toBe(1)
    expect(wrapper.vm.b).toBe(2)
    wrapper.vm.a = 2
    expect(wrapper.vm.b).toBe(3)
  })

  it('works with shallow mount and SFC', async () => {
    const wrapper = mount(ClassComponent, {
      shallow: true
    })
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('h1').text()).toMatch('Hello')
  })
})

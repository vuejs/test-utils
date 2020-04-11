import { mount } from '../src'

describe('setData', () => {
  it('causes nested nodes to re-render', async () => {
    const Comp = {
      template: `<div><div v-if="show" id="show">Show</div></div>`,
      data() {
        return { show: false }
      }
    }

    const wrapper = mount(Comp)
    expect(wrapper.find('#show').exists()).toBe(false)

    await wrapper.setData({ show: true })

    expect(wrapper.find('#show').exists()).toBe(true)
  })

  it('runs watch function when data is updated', async () => {
    const Comp = {
      template: `<div>{{ sideEffect }}</div>`,
      data() {
        return { msg: '', sideEffect: '' }
      },
      watch: {
        msg() {
          this.sideEffect = 'side effect'
        }
      }
    }
    const wrapper = mount(Comp)
    expect(wrapper.html()).not.toContain('side effect')

    await wrapper.setData({ msg: 'foo' })

    expect(wrapper.html()).toContain('side effect')
  })

  it('updates a single property of a complex object', async () => {
    const Comp = {
      template: `<div>Qux: {{ foo.qux }}. Baz: {{ foo.bar.baz }}</div>`,
      data() {
        return {
          foo: {
            qux: 'will not change',
            bar: {
              baz: 'old val'
            }
          }
        }
      }
    }
    const wrapper = mount(Comp)
    expect(wrapper.html()).toBe('<div>Qux: will not change. Baz: old val</div>')

    await wrapper.setData({
      foo: {
        bar: {
          baz: 'new val'
        }
      }
    })

    expect(wrapper.html()).toBe('<div>Qux: will not change. Baz: new val</div>')
  })
})

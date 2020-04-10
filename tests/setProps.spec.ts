import { mount } from '../src'

describe('setProps', () => {
  it('updates a prop', async () => {
    const Foo = {
      props: ['foo'],
      template: '<div>{{ foo }}</div>'
    }

    const { wrapper, setProps } = mount(Foo, {
      props: {
        foo: 'foo'
      }
    })
    expect(wrapper.html()).toContain('foo')

    await setProps({ foo: 'qux' })
    expect(wrapper.html()).toContain('qux')
  })
})

import { mount } from '../src'

const AXIOM = 'Rem is the best girl'

describe('Unmount', () => {
  it('works on single root component', () => {
    const Component = {
      template: `
        <div>${AXIOM}</div>
      `,
      onErrorCaptured(err: Error) {
        throw err
      }
    }
    const wrapper = mount(Component)
    expect(() => wrapper.unmount()).not.toThrowError()
  })

  it('works on multi-root component', () => {
    const Component = {
      template: `
        <div>${AXIOM}</div>
        <div>${AXIOM}</div>
      `,
      onErrorCaptured(err: Error) {
        throw err
      }
    }
    const wrapper = mount(Component)
    wrapper.unmount()
  })
})

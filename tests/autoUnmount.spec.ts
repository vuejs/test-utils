import { mount, enableAutoUnmount, disableAutoUnmount } from '../src'

describe('enableAutoUnmount', () => {
  beforeEach(() => {
    disableAutoUnmount()
  })

  it('calls the hook function', () => {
    const hookMock = jest.fn()

    enableAutoUnmount(hookMock)

    expect(hookMock).toHaveBeenCalledWith(expect.any(Function))
  })

  it('uses the hook function to unmount wrappers', () => {
    const hookMock = jest.fn()

    enableAutoUnmount(hookMock)
    const [unmountFn] = hookMock.mock.calls[0]

    const wrapper = mount({ template: '<p>test</p>' })
    jest.spyOn(wrapper, 'unmount')

    unmountFn()

    expect(wrapper.unmount).toHaveBeenCalledTimes(1)
  })

  it('cannot be called twice', () => {
    const noop = () => {}

    enableAutoUnmount(noop)

    expect(() => enableAutoUnmount(noop)).toThrow()
  })
})

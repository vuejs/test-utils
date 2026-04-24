import { beforeEach, describe, expect, it, vi } from 'vitest'
import { disableAutoUnmount, enableAutoUnmount, mount } from '../src'

describe('enableAutoUnmount', () => {
  beforeEach(() => {
    disableAutoUnmount()
  })

  it('calls the hook function', () => {
    const hookMock = vi.fn()

    enableAutoUnmount(hookMock)

    expect(hookMock).toHaveBeenCalledWith(expect.any(Function))
  })

  it('uses the hook function to unmount wrappers', () => {
    const hookMock = vi.fn()

    enableAutoUnmount(hookMock)
    const [unmountFn] = hookMock.mock.calls[0]

    const wrapper = mount({ template: '<p>test</p>' })
    vi.spyOn(wrapper, 'unmount')

    unmountFn()

    expect(wrapper.unmount).toHaveBeenCalledTimes(1)
  })

  it('does not throw when auto unmounting an already unmounted wrapper attached to the document', () => {
    const hookMock = vi.fn()

    enableAutoUnmount(hookMock)
    const [unmountFn] = hookMock.mock.calls[0]

    const wrapper = mount(
      {
        template: '<div id="attach-to-auto-unmount">test</div>'
      },
      {
        attachTo: document.body
      }
    )

    expect(document.getElementById('attach-to-auto-unmount')).not.toBeNull()

    // Some test suites manually unmount a wrapper before the registered
    // auto-unmount hook runs after the test.
    wrapper.unmount()

    expect(document.getElementById('attach-to-auto-unmount')).toBeNull()
    // Auto-unmount still tracks the wrapper, so it must tolerate the second
    // unmount without trying to remove an already-detached container.
    expect(unmountFn).not.toThrow()
  })

  it('cannot be called twice', () => {
    const noop = () => {}

    enableAutoUnmount(noop)

    expect(() => enableAutoUnmount(noop)).toThrow()
  })
})

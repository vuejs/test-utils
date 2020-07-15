import SuspenseComponent from '../components/Suspense.vue'
import { mount, flushPromises } from '../../src'

let mockShouldError = false
jest.mock('../utils', () => ({
  simulateDelay: () => {
    if (mockShouldError) {
      throw new Error('Error!')
    }
  }
}))

describe('suspense', () => {
  test('fallback state', () => {
    const wrapper = mount(SuspenseComponent)

    expect(wrapper.html()).toContain('Fallback content')
  })

  test('default state', async (done) => {
    const wrapper = mount(SuspenseComponent)

    setTimeout(() => {
      expect(wrapper.html()).toContain('Default content')
      done()
    }, 150)
  })

  test('error state', async () => {
    mockShouldError = true
    const wrapper = mount(SuspenseComponent)

    await flushPromises()

    expect(wrapper.html()).toContain('Error!')
  })
})

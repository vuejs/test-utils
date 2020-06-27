import { createRouter, createWebHistory } from 'vue-router'
import { h } from 'vue'
import WithRouter from '../components/WithRouter.vue'
import { mount } from '../../src'

describe('vue-router', () => {
  it('works without problems', async () => {
    const router = () => {
      return createRouter({
        history: createWebHistory(),
        routes: [
          {
            path: '/posts',
            component: {
              render() {
                return h('div', 'This is the posts route')
              }
            }
          },
          {
            path: '/',
            component: {
              render() {
                return h('div', 'This is this home route')
              }
            }
          }
        ]
      })
    }

    window.location.href = '/'
    const wrapper = mount(WithRouter, {
      global: {
        plugins: [router()]
      }
    })

    expect(wrapper.html()).toContain('This is the home route')
    await wrapper.find('[data-testid="to-posts"]').trigger('click')
    expect(wrapper.html()).toContain('This is the posts route')
  })
})

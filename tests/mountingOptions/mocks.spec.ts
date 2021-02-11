import { mount, RouterLinkStub } from '../../src'

describe('mocks', () => {
  it('mocks a vuex store', async () => {
    const Foo = {
      template: `
        <div>
          count: {{ $store.state.count }}
          <button @click="$store.dispatch('inc')" />
        </div>
      `
    }
    const $store = {
      state: {
        count: 1
      },
      dispatch: jest.fn()
    }

    const wrapper = mount(Foo, {
      global: {
        mocks: { $store }
      }
    })

    expect(wrapper.html()).toContain('count: 1')
    await wrapper.find('button').trigger('click')
    expect($store.dispatch).toHaveBeenCalledWith('inc')
  })

  it('mocks vue-router', async () => {
    const Foo = {
      template: `
        <div>
          <RouterLink :to="url">Go to post: {{ id }}</RouterLink>
          <button @click="submit">Go</button>
        </div>
      `,
      computed: {
        url(): string {
          // @ts-expect-error
          return `/posts/${this.$route.params.id}`
        },
        id(): number {
          // @ts-expect-error
          return this.$route.params.id
        }
      },
      methods: {
        submit() {
          // @ts-expect-error
          this.$router.push(`/posts/${this.id}`)
        }
      }
    }

    const $router = {
      push: jest.fn()
    }
    const $route = {
      params: {
        id: 1
      }
    }

    const wrapper = mount(Foo, {
      global: {
        components: {
          RouterLink: RouterLinkStub
        },
        mocks: { $route, $router }
      }
    })

    expect(wrapper.html()).toContain('Go to post: 1')
    await wrapper.find('button').trigger('click')
    expect($router.push).toHaveBeenCalledWith('/posts/1')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { RouterLinkStub, mount } from '../../src'
import { defineComponent } from 'vue'
import ScriptSetupWithI18n from '../components/ScriptSetupWithI18n.vue'
import ComponentWithI18n from '../components/ComponentWithI18n.vue'

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
      dispatch: vi.fn()
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
    const Foo = defineComponent({
      template: `
        <div>
          <RouterLink :to="url">Go to post: {{ id }}</RouterLink>
          <button @click="submit">Go</button>
        </div>
      `,
      computed: {
        url(): string {
          return `/posts/${this.$route.params.id}`
        },
        id(): string | string[] {
          return this.$route.params.id
        }
      },
      methods: {
        submit() {
          this.$router.push(`/posts/${this.id}`)
        }
      }
    })

    const $router = {
      push: vi.fn()
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

  it('mocks a global function in a script setup component', () => {
    const wrapper = mount(ScriptSetupWithI18n, {
      global: {
        mocks: {
          $t: () => 'mocked'
        }
      }
    })
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('mocked')
  })

  it('mocks a global function in an option component', () => {
    const wrapper = mount(ComponentWithI18n, {
      global: {
        mocks: {
          $t: () => 'mocked'
        }
      }
    })
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('mocked')
  })

  it('mocks a global function in an option component which includes the setup() option', () => {
    const ComponentWithI18nAndSetupOption = defineComponent({
      setup: () => ({
        hello: 'hello'
      }),
      template: `
        <div>{{ hello }}</div>
        <!-- this emulates components that use a global function like $t for i18n -->
        <!-- this function can be mocked using global.mocks -->
        <div>{{ $t('world') }}</div>
      `
    })

    const wrapper = mount(ComponentWithI18nAndSetupOption, {
      global: {
        mocks: {
          $t: () => 'mocked'
        }
      }
    })

    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('mocked')
  })
})

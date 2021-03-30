import { defineComponent, h } from 'vue'

import { mount } from '../src'

describe('html', () => {
  it('returns html when mounting single root node', () => {
    const Component = defineComponent({
      render() {
        return h('div', {}, 'Text content')
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.html()).toBe('<div>Text content</div>')
  })

  it('returns the html when mounting multiple root nodes', () => {
    const Component = defineComponent({
      render() {
        return [h('div', {}, 'foo'), h('div', {}, 'bar'), h('div', {}, 'baz')]
      }
    })

    const wrapper = mount(Component)

    expect(wrapper.html()).toBe(
      '<div>foo</div>\n' + '<div>bar</div>\n' + '<div>baz</div>'
    )
  })

  it('returns the html when mounting a Suspense component', () => {
    const Foo = {
      template: '<div class="Foo">FOO</div>',
      setup() {
        return {}
      }
    }
    const Component = {
      template: `
        <Suspense>
          <template #default>
            <Foo />
          </template>

          <template #fallback>
            Fallback
          </template>
        </Suspense>`,
      components: { Foo }
    }
    const wrapper = mount(Component)
    expect(wrapper.html()).toEqual('<div class="Foo">FOO</div>')
  })

  it('returns the html with findComponent in a nested Suspense component', () => {
    const Foo = defineComponent({
      template: '<div class="Foo">FOO</div>',
      setup() {
        return {}
      }
    })
    const Component = {
      template: `
      <div>
        <span>
          <Suspense>
            <template #default>
              <Foo />
            </template>

            <template #fallback>
              Fallback
            </template>
          </Suspense>
        </span>
      </div>`,
      components: { Foo }
    }
    const wrapper = mount(Component)
    const foo = wrapper.findComponent(Foo)
    expect(foo.html()).toEqual('<div class="Foo">FOO</div>')
  })
})

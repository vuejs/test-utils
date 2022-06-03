import { defineComponent, onMounted, onServerPrefetch, ref } from 'vue'
import { renderToString } from '../src'

describe('renderToString', () => {
  it('returns a promise', async () => {
    const Component = defineComponent({
      template: '<div>{{ text }}</div>',
      setup() {
        return { text: 'Text content' }
      }
    })

    const wrapper = await renderToString(Component)

    expect(wrapper).toBe('<div>Text content</div>')
  })

  it('returns correct html on multi root nodes', async () => {
    const Component = defineComponent({
      template: '<div>foo</div><div>bar</div>'
    })

    const wrapper = await renderToString(Component)

    expect(wrapper).toBe('<!--[--><div>foo</div><div>bar</div><!--]-->')
  })

  it('returns correct html when onServerPrefetch is used', async () => {
    const Component = defineComponent({
      template: '<div>{{ text }}</div>',
      setup() {
        const text = ref('')

        onServerPrefetch(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              text.value = 'Text content'
              resolve(true)
            }, 100)
          })
        })

        onMounted(() => {
          text.value = 'Text content'
        })

        return { text }
      }
    })

    const wrapper = await renderToString(Component)

    expect(wrapper).toBe('<div>Text content</div>')
  })
})

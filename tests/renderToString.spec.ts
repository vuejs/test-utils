import { describe, it, expect } from 'vitest'
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

    expect(wrapper).toMatchInlineSnapshot(`"<div>Text content</div>"`)
  })

  it('returns correct html on multi root nodes', async () => {
    const Component = defineComponent({
      template: '<div>foo</div><div>bar</div>'
    })

    const wrapper = await renderToString(Component)

    expect(wrapper).toMatchInlineSnapshot(
      `"<!--[--><div>foo</div><div>bar</div><!--]-->"`
    )
  })

  it('returns correct html with pre-fetched data on server', async () => {
    function fakeFetch(text: string) {
      return Promise.resolve(text)
    }

    const Component = defineComponent({
      template: '<div>{{ text }}</div>',
      setup() {
        const text = ref<string | null>(null)

        onServerPrefetch(async () => {
          text.value = await fakeFetch('onServerPrefetch')
        })

        onMounted(async () => {
          if (!text.value) {
            text.value = await fakeFetch('onMounted')
          }
        })

        return { text }
      }
    })

    const contents = await renderToString(Component)

    expect(contents).toBe('<div>onServerPrefetch</div>')
  })
})

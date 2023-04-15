/**
 * Run SSR tests in node environment
 * @vitest-environment node
 */

import { describe, it, expect, vi } from 'vitest'
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

  it('returns print warning if `attachTo` option is used', async () => {
    const spy = vi.spyOn(console, 'warn').mockReturnValue()

    const Component = defineComponent({
      template: '<div>foo</div>'
    })

    expect(
      await renderToString(Component, {
        // @ts-expect-error `attachTo` property is not allowed
        attachTo: 'body'
      })
    ).toBe('<div>foo</div>')

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(
      'attachTo option is not available for renderToString'
    )

    spy.mockRestore()
  })
})

import { compile } from '@vue/compiler-dom'
import * as vue from 'vue'

export function processSlot(source = '', Vue = vue) {
  let template = source.trim()
  const hasWrappingTemplate = template && template.startsWith('<template')

  // allow content without `template` tag, for easier testing
  if (!hasWrappingTemplate) {
    template = `<template #default="params">${template}</template>`
  }

  const { code } = compile(
    `<SlotWrapper v-bind="$attrs">${template}</SlotWrapper>`,
    {
      mode: 'function',
      prefixIdentifiers: true
    }
  )
  const createRenderFunction = new Function('Vue', `'use strict';\n${code}`)

  return {
    inheritAttrs: false,
    render: createRenderFunction(Vue),
    components: {
      SlotWrapper: {
        inheritAttrs: false,
        setup(_, { slots, attrs }) {
          return () => {
            const names = Object.keys(slots)
            if (names.length === 0) {
              return []
            } else {
              const slotName = names[0]
              return slots[slotName](attrs)
            }
          }
        }
      }
    }
  }
}

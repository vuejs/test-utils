import { compile } from '@vue/compiler-dom'
import * as vue from 'vue'

export function processSlot(source = '', Vue = vue) {
  let template = source.trim()
  const hasWrappingTemplate = template && template.startsWith('<template')

  // allow content without `template` tag, for easier testing
  if (!hasWrappingTemplate) {
    template = `<template #default="params">${template}</template>`
  }

  // Vue does not provide an easy way to compile template in "slot" mode
  // Since we do not want to rely on compiler internals and specify
  // transforms manually we create fake component invocation with the slot we
  // need and pick slots param from render function later. Fake component will
  // never be instantiated but it requires to be a component so compile
  // properly generate invocation. Since we do not want to monkey-patch
  // `resolveComponent` function we are just using one of built-in components:
  // transition
  const { code } = compile(`<transition>${template}</transition>`, {
    mode: 'function',
    prefixIdentifiers: __USE_PREFIX_IDENTIFIERS__
  })
  const createRenderFunction = new Function(
    'Vue',
    __BROWSER__ ? `'use strict';\n${code}` : code
  )
  const renderFn = createRenderFunction(Vue)
  return (ctx = {}) => {
    const result = renderFn()
    const slotName = Object.keys(result.children)[0]
    return result.children[slotName](ctx)
  }
}

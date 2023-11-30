import { DOMWrapper } from './domWrapper'
import { VueWrapper } from './vueWrapper'
import BaseWrapper from './baseWrapper'
import { mount, shallowMount } from './mount'
import { renderToString as _renderToString } from './renderToString'
import { MountingOptions } from './types'
import { RouterLinkStub } from './components/RouterLinkStub'
import { createWrapperError } from './errorWrapper'
import { config } from './config'
import { flushPromises } from './utils/flushPromises'
import { enableAutoUnmount, disableAutoUnmount } from './utils/autoUnmount'

// is __SSR__ avaialble? If so, preferable to use that?
const isNode = typeof window === 'undefined'
const renderToString = ( isNode ?  _renderToString  : null)
export {
  mount,
  shallowMount,
  renderToString,
  enableAutoUnmount,
  disableAutoUnmount,
  RouterLinkStub,
  VueWrapper,
  DOMWrapper,
  BaseWrapper,
  config,
  flushPromises,
  MountingOptions,
  createWrapperError
}

export type { ComponentMountingOptions } from './mount'

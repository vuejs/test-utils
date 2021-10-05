import { mount, shallowMount } from './mount'
import { MountingOptions } from './types'
import { RouterLinkStub } from './components/RouterLinkStub'
import { VueWrapper } from './vueWrapper'
import { DOMWrapper } from './domWrapper'
import { createWrapperError } from './errorWrapper'
import { config } from './config'
import { flushPromises } from './utils/flushPromises'
import { enableAutoUnmount, disableAutoUnmount } from './utils/autoUnmount'

export {
  mount,
  shallowMount,
  enableAutoUnmount,
  disableAutoUnmount,
  RouterLinkStub,
  VueWrapper,
  DOMWrapper,
  config,
  flushPromises,
  MountingOptions,
  createWrapperError
}

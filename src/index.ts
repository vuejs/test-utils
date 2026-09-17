import { DOMWrapper } from './domWrapper'
import { VueWrapper } from './vueWrapper'
import BaseWrapper from './baseWrapper'
import { mount, shallowMount } from './mount'
import { renderToString } from './renderToString'
import type { GlobalMountOptions, MountingOptions, Stubs } from './types'
import { RouterLinkStub } from './components/RouterLinkStub'
import { TeleportStub } from './components/TeleportStub'
import { createWrapperError } from './errorWrapper'
import { config } from './config'
import { flushPromises } from './utils/flushPromises'
import { disableAutoUnmount, enableAutoUnmount } from './utils/autoUnmount'
import type { ComponentMountingOptions } from './mount'

export {
  mount,
  shallowMount,
  renderToString,
  enableAutoUnmount,
  disableAutoUnmount,
  RouterLinkStub,
  TeleportStub,
  VueWrapper,
  DOMWrapper,
  BaseWrapper,
  config,
  flushPromises,
  createWrapperError
}

export type {
  GlobalMountOptions,
  MountingOptions,
  Stubs,
  ComponentMountingOptions
}

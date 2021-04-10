import { mount, shallowMount } from './mount'
import { MountingOptions } from './types'
import { RouterLinkStub } from './components/RouterLinkStub'
import { VueWrapper } from './vueWrapper'
import { DOMWrapper } from './domWrapper'
import { config } from './config'
import { flushPromises } from './utils/flushPromises'
import { vmodel } from './vmodel'

export {
  mount,
  shallowMount,
  RouterLinkStub,
  VueWrapper,
  DOMWrapper,
  config,
  flushPromises,
  MountingOptions,
  vmodel
}

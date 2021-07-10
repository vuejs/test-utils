import * as Vue from 'vue'
import type { ComponentOptions } from 'vue'
import { hasOwnProperty } from '../utils'

function isCompatEnabled(key: string): boolean {
  return (Vue as any).compatUtils?.isCompatEnabled(key) ?? false
}

export function isLegacyExtendedComponent(component: unknown): component is {
  (): Function
  super: Function
  options: ComponentOptions
} {
  if (!isCompatEnabled('GLOBAL_EXTEND') || typeof component !== 'function') {
    return false
  }

  // @ts-ignore Vue.extend is part of Vue2 compat API, types are missing
  const fakeCmp = Vue.extend({})

  return (
    hasOwnProperty(component, 'super') &&
    hasOwnProperty(component, 'options') &&
    fakeCmp.super === component.super
  )
}

export function unwrapLegacyVueExtendComponent<T>(
  selector: T
): T | ComponentOptions {
  return isLegacyExtendedComponent(selector) ? selector.options : selector
}

export function isLegacyFunctionalComponent(component: unknown) {
  if (!isCompatEnabled('COMPONENT_FUNCTIONAL')) {
    return false
  }

  return (
    component &&
    typeof component === 'object' &&
    hasOwnProperty(component, 'functional') &&
    component.functional
  )
}

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

  return (
    hasOwnProperty(component, 'super') &&
    (component.super as any).extend({}).super === component.super
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

  return Boolean(
    component &&
      typeof component === 'object' &&
      hasOwnProperty(component, 'functional') &&
      component.functional
  )
}

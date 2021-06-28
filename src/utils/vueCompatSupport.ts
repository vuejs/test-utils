import * as Vue from 'vue'
import type { ComponentOptions } from 'vue'
import { FindAllComponentsSelector } from '../types'
import { hasOwnProperty } from '../utils'

function isCompatEnabled(key: string): boolean {
  return (Vue as any).compatUtils?.isCompatEnabled(key) ?? false
}

export function convertLegacyVueExtendSelector(
  selector: FindAllComponentsSelector
): FindAllComponentsSelector {
  if (!isCompatEnabled('GLOBAL_EXTEND') || typeof selector !== 'function') {
    return selector
  }

  // @ts-ignore Vue.extend is part of Vue2 compat API, types are missing
  const fakeCmp = Vue.extend({})

  return hasOwnProperty(selector, 'super') &&
    hasOwnProperty(selector, 'options') &&
    fakeCmp.super === selector.super
    ? (selector.options as FindAllComponentsSelector)
    : selector
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

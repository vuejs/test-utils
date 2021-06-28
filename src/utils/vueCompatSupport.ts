import * as Vue from 'vue'
import type { ComponentOptions } from 'vue'
import { FindAllComponentsSelector } from '../types'

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

  // @ts-ignore TypeScript does not allow access of properties on functions
  return fakeCmp.super === selector.super ? selector.options : selector
}

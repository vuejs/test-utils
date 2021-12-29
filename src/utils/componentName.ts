import { ComponentInternalInstance } from '@vue/runtime-core'
import { VNodeTypes } from 'vue'
import { isFunctionalComponent, isObjectComponent } from '../utils'
import {
  isLegacyExtendedComponent,
  unwrapLegacyVueExtendComponent
} from './vueCompatSupport'

const getComponentNameInSetup = (
  instance: any | null,
  type: VNodeTypes
): string | undefined =>
  Object.keys(instance?.setupState || {}).find(
    (key) => instance.setupState[key] === type
  )

export const getComponentRegisteredName = (
  instance: ComponentInternalInstance | null,
  type: VNodeTypes
): string | null => {
  if (!instance || !instance.parent) return null

  // try to infer the name based on local resolution
  const registry = (instance.type as any).components
  for (const key in registry) {
    if (registry[key] === type) {
      return key
    }
  }

  // try to retrieve name imported in script setup
  return getComponentNameInSetup(instance.parent, type) || null
}

export const getComponentName = (
  instance: any | null,
  type: VNodeTypes
): string => {
  if (isObjectComponent(type)) {
    return getComponentNameInSetup(instance, type) || type.name || ''
  }

  if (isLegacyExtendedComponent(type)) {
    return unwrapLegacyVueExtendComponent(type).name || ''
  }

  if (isFunctionalComponent(type)) {
    return type.displayName || type.name
  }

  return ''
}

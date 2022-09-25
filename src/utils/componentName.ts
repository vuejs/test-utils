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
    (key) =>
      Object.getOwnPropertyDescriptor(instance.setupState, key)?.value === type
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
    return (
      // If the component we stub is a script setup component and is automatically
      // imported by unplugin-vue-components we can only get its name through
      // the `__name` property.
      getComponentNameInSetup(instance, type) || type.name || type.__name || ''
    )
  }

  if (isLegacyExtendedComponent(type)) {
    return unwrapLegacyVueExtendComponent(type).name || ''
  }

  if (isFunctionalComponent(type)) {
    return type.displayName || type.name
  }

  return ''
}

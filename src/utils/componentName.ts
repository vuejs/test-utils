import type { ComponentInternalInstance, VNodeTypes } from 'vue'
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
    key =>
      Object.getOwnPropertyDescriptor(instance.setupState, key)?.value === type
  )

const getNamesInRegistry = (
  registry: Record<string, unknown> | undefined,
  type: VNodeTypes
): string[] => {
  const names: string[] = []
  for (const key in registry) {
    if (registry[key] === type) {
      names.push(key)
    }
  }
  return names
}

export const getComponentRegisteredNames = (
  instance: ComponentInternalInstance | null,
  type: VNodeTypes,
  includeGlobal = false
): string[] => {
  if (!instance || !instance.parent) return []

  // try to infer the names based on local resolution
  const names = getNamesInRegistry((instance.type as any).components, type)

  // try to retrieve name imported in script setup
  const nameInSetup = getComponentNameInSetup(instance.parent, type)
  if (nameInSetup) {
    names.push(nameInSetup)
  }

  // try to infer the name based on global resolution, as a last resort
  // so that local registration always wins over global registration.
  // This is opt-in: `find()` relies on the local names only so that it can
  // still fall back to the parent registry for anonymous components.
  if (includeGlobal) {
    names.push(
      ...getNamesInRegistry(
        instance.appContext.components as Record<string, unknown>,
        type
      )
    )
  }

  return [...new Set(names)]
}

export const getComponentRegisteredName = (
  instance: ComponentInternalInstance | null,
  type: VNodeTypes
): string | null => getComponentRegisteredNames(instance, type)[0] ?? null

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

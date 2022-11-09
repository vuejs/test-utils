import { GlobalMountOptions, RefSelector, Stub, Stubs } from './types'
import {
  Component,
  ComponentOptions,
  ConcreteComponent,
  Directive,
  FunctionalComponent
} from 'vue'
import { config } from './config'

function mergeStubs(target: Record<string, any>, source: GlobalMountOptions) {
  if (source.stubs) {
    if (Array.isArray(source.stubs)) {
      source.stubs.forEach((x) => (target[x] = true))
    } else {
      for (const [k, v] of Object.entries(source.stubs)) {
        target[k] = v
      }
    }
  }
}

// perform 1-level-deep-pseudo-clone merge in order to prevent config leaks
// example: vue-router overwrites globalProperties.$router
function mergeAppConfig(
  configGlobalConfig: GlobalMountOptions['config'],
  mountGlobalConfig: GlobalMountOptions['config']
): Required<GlobalMountOptions>['config'] {
  return {
    ...configGlobalConfig,
    ...mountGlobalConfig,
    globalProperties: {
      ...configGlobalConfig?.globalProperties,
      ...mountGlobalConfig?.globalProperties
    } as Required<GlobalMountOptions>['config']['globalProperties']
  }
}

export function mergeGlobalProperties(
  mountGlobal: GlobalMountOptions = {}
): Required<GlobalMountOptions> {
  const stubs: Record<string, any> = {}
  const configGlobal: GlobalMountOptions = config?.global ?? {}
  mergeStubs(stubs, configGlobal)
  mergeStubs(stubs, mountGlobal)

  const renderStubDefaultSlot =
    mountGlobal.renderStubDefaultSlot ??
    (configGlobal.renderStubDefaultSlot || config?.renderStubDefaultSlot) ??
    false

  if (config.renderStubDefaultSlot === true) {
    console.warn(
      'config.renderStubDefaultSlot is deprecated, use config.global.renderStubDefaultSlot instead'
    )
  }

  return {
    mixins: [...(configGlobal.mixins || []), ...(mountGlobal.mixins || [])],
    plugins: [...(configGlobal.plugins || []), ...(mountGlobal.plugins || [])],
    stubs,
    components: { ...configGlobal.components, ...mountGlobal.components },
    provide: { ...configGlobal.provide, ...mountGlobal.provide },
    mocks: { ...configGlobal.mocks, ...mountGlobal.mocks },
    config: mergeAppConfig(configGlobal.config, mountGlobal.config),
    directives: { ...configGlobal.directives, ...mountGlobal.directives },
    renderStubDefaultSlot
  }
}

export const isObject = (obj: unknown): obj is Record<string, any> =>
  !!obj && typeof obj === 'object'

// https://stackoverflow.com/a/48218209
export const mergeDeep = (
  target: Record<string, unknown>,
  source: Record<string, unknown>
) => {
  if (!isObject(target) || !isObject(source)) {
    return source
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = sourceValue
    } else if (sourceValue instanceof Date) {
      target[key] = sourceValue
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
}

export function isClassComponent(component: unknown) {
  return typeof component === 'function' && '__vccOpts' in component
}

export function isComponent(
  component: unknown
): component is ConcreteComponent {
  return Boolean(
    component &&
      (typeof component === 'object' || typeof component === 'function')
  )
}

export function isFunctionalComponent(
  component: unknown
): component is FunctionalComponent {
  return typeof component === 'function' && !isClassComponent(component)
}

export function isObjectComponent(
  component: unknown
): component is ComponentOptions {
  return Boolean(component && typeof component === 'object')
}

export function textContent(element: Node): string {
  // we check if the element is a comment first
  // to return an empty string in that case, instead of the comment content
  return element.nodeType !== Node.COMMENT_NODE
    ? element.textContent?.trim() ?? ''
    : ''
}

export function hasOwnProperty<O extends {}, P extends PropertyKey>(
  obj: O,
  prop: P
): obj is O & Record<P, unknown> {
  return obj.hasOwnProperty(prop)
}

export function isNotNullOrUndefined<T extends {}>(
  obj: T | null | undefined
): obj is T {
  return Boolean(obj)
}

export function isRefSelector(
  selector: string | RefSelector
): selector is RefSelector {
  return typeof selector === 'object' && 'ref' in selector
}

export function convertStubsToRecord(stubs: Stubs) {
  if (Array.isArray(stubs)) {
    // ['Foo', 'Bar'] => { Foo: true, Bar: true }
    return stubs.reduce((acc, current) => {
      acc[current] = true
      return acc
    }, {} as Record<string, Stub>)
  }

  return stubs
}

const isDirectiveKey = (key: string) => key.match(/^v[A-Z].*/)

export function getComponentsFromStubs(
  stubs: Stubs
): Record<string, Component | boolean> {
  const normalizedStubs = convertStubsToRecord(stubs)

  return Object.fromEntries(
    Object.entries(normalizedStubs).filter(([key]) => !isDirectiveKey(key))
  ) as Record<string, Component | boolean>
}

export function getDirectivesFromStubs(
  stubs: Stubs
): Record<string, Directive | true> {
  const normalizedStubs = convertStubsToRecord(stubs)

  return Object.fromEntries(
    Object.entries(normalizedStubs)
      .filter(([key, value]) => isDirectiveKey(key) && value !== false)
      .map(([key, value]) => [key.substring(1), value])
  ) as Record<string, Directive>
}

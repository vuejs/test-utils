import { GlobalMountOptions } from './types'
import { ComponentOptions, ConcreteComponent, FunctionalComponent } from 'vue'
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

export function mergeGlobalProperties(
  mountGlobal: GlobalMountOptions = {}
): Required<GlobalMountOptions> {
  const stubs: Record<string, any> = {}
  const configGlobal: GlobalMountOptions = config?.global ?? {}
  mergeStubs(stubs, configGlobal)
  mergeStubs(stubs, mountGlobal)

  const renderStubDefaultSlot =
    mountGlobal.renderStubDefaultSlot ??
    config?.renderStubDefaultSlot ??
    configGlobal?.renderStubDefaultSlot

  return {
    mixins: [...(configGlobal.mixins || []), ...(mountGlobal.mixins || [])],
    plugins: [...(configGlobal.plugins || []), ...(mountGlobal.plugins || [])],
    stubs,
    components: { ...configGlobal.components, ...mountGlobal.components },
    provide: { ...configGlobal.provide, ...mountGlobal.provide },
    mocks: { ...configGlobal.mocks, ...mountGlobal.mocks },
    config: { ...configGlobal.config, ...mountGlobal.config },
    directives: { ...configGlobal.directives, ...mountGlobal.directives },
    renderStubDefaultSlot
  }
}

export const isObject = (obj: unknown): obj is Record<string, any> =>
  !!obj && typeof obj === 'object'

// https://stackoverflow.com/a/48218209
export const mergeDeep = (
  target: Record<string, any>,
  source: Record<string, any>
) => {
  if (!isObject(target) || !isObject(source)) {
    return source
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
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

export function textContent(element: Element): string {
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

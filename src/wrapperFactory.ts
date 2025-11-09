import type { ComponentPublicInstance, App, VNode } from 'vue'
import type { DOMWrapper as DOMWrapperType } from './domWrapper'
import type { VueWrapper as VueWrapperType } from './vueWrapper'

export enum WrapperType {
  DOMWrapper,
  VueWrapper
}

type DOMWrapperFactory = <T extends Node>(
  element: T | null | undefined,
  subTree?: VNode
) => DOMWrapperType<T>
type VueWrapperFactory = <T extends ComponentPublicInstance>(
  app: App | null,
  vm: T,
  setProps?: (props: Record<string, unknown>) => Promise<void>
) => VueWrapperType<T>

const factories: {
  [WrapperType.DOMWrapper]?: DOMWrapperFactory
  [WrapperType.VueWrapper]?: VueWrapperFactory
} = {}

export function registerFactory(
  type: WrapperType.DOMWrapper,
  fn: DOMWrapperFactory
): void
export function registerFactory(
  type: WrapperType.VueWrapper,
  fn: VueWrapperFactory
): void
export function registerFactory(
  type: WrapperType.DOMWrapper | WrapperType.VueWrapper,
  fn: any
): void {
  factories[type] = fn
}

export const createDOMWrapper: DOMWrapperFactory = (element, subTree) =>
  factories[WrapperType.DOMWrapper]!(element, subTree)
export const createVueWrapper: VueWrapperFactory = (app, vm, setProps) =>
  factories[WrapperType.VueWrapper]!(app, vm, setProps)

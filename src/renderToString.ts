import { renderToString as baseRenderToString } from '@vue/server-renderer'
import {
  AllowedComponentProps,
  ComponentCustomProps,
  ComponentOptionsMixin,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithoutProps,
  ComponentPropsOptions,
  ComputedOptions,
  EmitsOptions,
  ExtractPropTypes,
  VNodeProps
} from 'vue'

import { createInstance } from './createInstance'
import { ComponentMountingOptions } from './mount'
import { RenderMountingOptions } from './types'

// NOTE this should come from `vue`
type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps

export function renderToString<
  T extends ((...args: any) => any) | (new (...args: any) => any)
>(
  originalComponent: T,
  options?: ComponentMountingOptions<T> &
    Pick<RenderMountingOptions<any>, 'attachTo'>
): Promise<string>

// Component declared with no props
export function renderToString<
  Props = {},
  RawBindings = {},
  D extends {} = {},
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string
>(
  componentOptions: ComponentOptionsWithoutProps<
    Props,
    RawBindings,
    D,
    C,
    M,
    E,
    Mixin,
    Extends,
    EE
  >,
  options?: RenderMountingOptions<Props & PublicProps, D>
): Promise<string>

// Component declared with { props: [] }
export function renderToString<
  PropNames extends string,
  RawBindings,
  D extends {},
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string,
  Props extends Readonly<{ [key in PropNames]?: any }> = Readonly<{
    [key in PropNames]?: any
  }>
>(
  componentOptions: ComponentOptionsWithArrayProps<
    PropNames,
    RawBindings,
    D,
    C,
    M,
    E,
    Mixin,
    Extends,
    EE,
    Props
  >,
  options?: RenderMountingOptions<Props & PublicProps, D>
): Promise<string>

// Component declared with { props: { ... } }
export function renderToString<
  // the Readonly constraint allows TS to treat the type of { required: true }
  // as constant instead of boolean.
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D extends {},
  C extends ComputedOptions = {},
  M extends Record<string, Function> = {},
  E extends EmitsOptions = Record<string, any>,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  EE extends string = string
>(
  componentOptions: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    E,
    Mixin,
    Extends,
    EE
  >,
  options?: RenderMountingOptions<
    ExtractPropTypes<PropsOptions> & PublicProps,
    D
  >
): Promise<string>

export function renderToString(component: any, options?: any): Promise<string> {
  if (options?.attachTo) {
    console.warn('attachTo option is not available for renderToString')
  }

  const { app } = createInstance(component, options)
  return baseRenderToString(app)
}

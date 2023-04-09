import { renderToString as baseRenderToString } from '@vue/server-renderer'
import {
  FunctionalComponent,
  ComponentOptionsWithObjectProps,
  ComponentOptionsWithArrayProps,
  ComponentOptionsWithoutProps,
  ExtractPropTypes,
  VNodeProps,
  ComponentOptionsMixin,
  DefineComponent,
  MethodOptions,
  AllowedComponentProps,
  ComponentCustomProps,
  ExtractDefaultPropTypes,
  EmitsOptions,
  ComputedOptions,
  ComponentPropsOptions,
  Prop
} from 'vue'

import { RenderMountingOptions } from './types'
import { createInstance } from './createInstance'

// NOTE this should come from `vue`
type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps

type ComponentMountingOptions<T> = T extends DefineComponent<
  infer PropsOrPropOptions,
  any,
  infer D,
  any,
  any
>
  ? RenderMountingOptions<
      Partial<ExtractDefaultPropTypes<PropsOrPropOptions>> &
        Omit<
          Readonly<ExtractPropTypes<PropsOrPropOptions>> & PublicProps,
          keyof ExtractDefaultPropTypes<PropsOrPropOptions>
        >,
      D
    > &
      Record<string, any>
  : RenderMountingOptions<any>

// Class component (without vue-class-component) - no props
export function renderToString<V extends {}>(
  originalComponent: {
    new (...args: any[]): V
    __vccOpts: any
  },
  options?: RenderMountingOptions<any> & Record<string, any>
): Promise<string>

// Class component (without vue-class-component) - props
export function renderToString<V extends {}, P>(
  originalComponent: {
    new (...args: any[]): V
    __vccOpts: any
    defaultProps?: Record<string, Prop<any>> | string[]
  },
  options?: RenderMountingOptions<P & PublicProps> & Record<string, any>
): Promise<string>

// Class component - no props
export function renderToString<V extends {}>(
  originalComponent: {
    new (...args: any[]): V
    registerHooks(keys: string[]): void
  },
  options?: RenderMountingOptions<any> & Record<string, any>
): Promise<string>

// Class component - props
export function renderToString<V extends {}, P>(
  originalComponent: {
    new (...args: any[]): V
    props(Props: P): any
    registerHooks(keys: string[]): void
  },
  options?: RenderMountingOptions<P & PublicProps> & Record<string, any>
): Promise<string>

// Functional component with emits
export function renderToString<Props extends {}, E extends EmitsOptions = {}>(
  originalComponent: FunctionalComponent<Props, E>,
  options?: RenderMountingOptions<Props & PublicProps> & Record<string, any>
): Promise<string>

// Component declared with defineComponent
export function renderToString<
  PropsOrPropOptions = {},
  RawBindings = {},
  D = {},
  C extends ComputedOptions = ComputedOptions,
  M extends MethodOptions = MethodOptions,
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = Record<string, any>,
  EE extends string = string,
  PP = PublicProps,
  Props = Readonly<ExtractPropTypes<PropsOrPropOptions>>,
  Defaults extends {} = ExtractDefaultPropTypes<PropsOrPropOptions>
>(
  component: DefineComponent<
    PropsOrPropOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE,
    PP,
    Props,
    Defaults
  >,
  options?: RenderMountingOptions<
    Partial<Defaults> & Omit<Props & PublicProps, keyof Defaults>,
    D
  > &
    Record<string, any>
): Promise<string>

// component declared by vue-tsc ScriptSetup
export function renderToString<
  T extends DefineComponent<any, any, any, any, any>
>(component: T, options?: ComponentMountingOptions<T>): Promise<string>

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

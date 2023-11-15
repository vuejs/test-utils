import { renderToString as baseRenderToString } from '@vue/server-renderer'
import { DefineComponent } from 'vue'
import { createInstance } from './createInstance'
import { ComponentMountingOptions } from './mount'
import { RenderMountingOptions } from './types'

export function renderToString<
  T,
  C = T extends ((...args: any) => any) | (new (...args: any) => any)
    ? T
    : T extends { props?: infer Props }
      ? DefineComponent<
          Props extends Readonly<(infer PropNames)[]> | (infer PropNames)[]
            ? { [key in PropNames extends string ? PropNames : string]?: any }
            : Props
        >
      : DefineComponent
>(
  originalComponent: T,
  options?: ComponentMountingOptions<C> &
    Pick<RenderMountingOptions<any>, 'attachTo'>
): Promise<string>

export function renderToString(component: any, options?: any): Promise<string> {
  if (options?.attachTo) {
    console.warn('attachTo option is not available for renderToString')
  }

  const { app } = createInstance(component, options)
  return baseRenderToString(app)
}

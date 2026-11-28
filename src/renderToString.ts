import { renderToString as baseRenderToString } from '@vue/server-renderer'
import { createInstance } from './createInstance'
import type { ComponentMountingOptions, MountComponent } from './mount'
import type { RenderMountingOptions } from './types'

export function renderToString<T, C = MountComponent<T>>(
  originalComponent: T,
  options?: ComponentMountingOptions<C> &
    Pick<RenderMountingOptions<any>, 'attachTo'>
): Promise<string>

export function renderToString(component: any, options?: any): Promise<string> {
  if (!__SSR__) {
    throw new Error(
      'renderToString is not available in the browser builds of @vue/test-utils'
    )
  }

  if (options?.attachTo) {
    console.warn('attachTo option is not available for renderToString')
  }

  const { app } = createInstance(component, options)
  return baseRenderToString(app)
}

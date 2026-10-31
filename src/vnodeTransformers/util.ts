import { isComponent } from '../utils'
import { registerStub } from '../stubs'
import { getCurrentInstance, transformVNodeArgs } from 'vue'
import type { App, Component, ConcreteComponent } from 'vue'

type VNodeArgsTransformerFn = NonNullable<
  Parameters<typeof transformVNodeArgs>[0]
>
type TransformVNodeArgs = Parameters<VNodeArgsTransformerFn>
type VNodeTransformerArgsType = TransformVNodeArgs[0]
type InstanceArgsType = TransformVNodeArgs[1]
type VNodeTransformerInputType = VNodeTransformerArgsType[0]

type ExtractComponentTypes<T> = T extends ConcreteComponent ? T : never

type VNodeTransformerInputComponentType =
  ExtractComponentTypes<VNodeTransformerInputType>

export type VTUVNodeTypeTransformer = (
  inputType: VNodeTransformerInputComponentType,
  instance: InstanceArgsType
) => VNodeTransformerInputComponentType

export const isTeleport = (type: any): boolean => type.__isTeleport
export const isKeepAlive = (type: any): boolean => type.__isKeepAlive

// `transformVNodeArgs` is global and keeps only the last transformer, which would
// also apply to wrappers mounted earlier and to apps not created by VTU (e.g. a
// plain `createApp` or `createSSRApp` later in the same test file). Instead, a
// single dispatcher applies the transformer of the app being rendered.
// See https://github.com/vuejs/test-utils/issues/2675
const appTransformers = new WeakMap<App, VNodeArgsTransformerFn>()
let lastTransformer: VNodeArgsTransformerFn | undefined
const dispatchVNodeTransformer: VNodeArgsTransformerFn = (args, instance) => {
  // vnodes created in `setup` have no rendering instance
  const owner = instance ?? getCurrentInstance()
  // vnodes created outside of any component (event handlers, async callbacks)
  // still go through the transformer of the last mounted wrapper
  const transformer = owner
    ? owner.appContext.app && appTransformers.get(owner.appContext.app)
    : lastTransformer
  return transformer ? transformer(args, instance) : args
}

export const installVNodeTransformer = (
  app: App,
  transformer: VNodeArgsTransformerFn
): void => {
  appTransformers.set(app, transformer)
  lastTransformer = transformer
  transformVNodeArgs(dispatchVNodeTransformer)
}

export interface RootComponents {
  // Component which has been passed to mount. For functional components it contains a wrapper
  component?: Component
  // If component is functional then contains the original component otherwise empty
  functional?: Component
}
export const isRootComponent = (
  rootComponents: RootComponents,
  type: VNodeTransformerInputComponentType,
  instance: InstanceArgsType
): boolean =>
  !!(
    !instance ||
    // Don't stub mounted component on root level
    (rootComponents.component === type && !instance?.parent) ||
    // Don't stub component with compat wrapper
    (rootComponents.functional && rootComponents.functional === type)
  )

export const createVNodeTransformer = ({
  rootComponents,
  transformers
}: {
  rootComponents: RootComponents
  transformers: VTUVNodeTypeTransformer[]
}): VNodeArgsTransformerFn => {
  const transformationCache: WeakMap<
    VNodeTransformerInputComponentType,
    VNodeTransformerInputComponentType
  > = new WeakMap()

  return (args: VNodeTransformerArgsType, instance: InstanceArgsType) => {
    const [originalType, props, children, ...restVNodeArgs] = args

    if (!isComponent(originalType)) {
      return [originalType, props, children, ...restVNodeArgs]
    }

    const componentType: VNodeTransformerInputComponentType = originalType

    const cachedTransformation = transformationCache.get(originalType)
    if (
      cachedTransformation &&
      // Don't use cache for root component, as it could use stubbed recursive component
      !isRootComponent(rootComponents, componentType, instance) &&
      !isTeleport(originalType) &&
      !isKeepAlive(originalType)
    ) {
      return [cachedTransformation, props, children, ...restVNodeArgs]
    }

    const transformedType = transformers.reduce(
      (type, transformer) => transformer(type, instance),
      componentType
    )

    if (originalType !== transformedType) {
      transformationCache.set(originalType, transformedType)

      registerStub({ source: originalType, stub: transformedType })
      // https://github.com/vuejs/test-utils/issues/1829 & https://github.com/vuejs/test-utils/issues/1888
      // Teleport/KeepAlive should return child nodes as a function
      if (isTeleport(originalType) || isKeepAlive(originalType)) {
        // the patch flag was compiled for Teleport/KeepAlive, not for a stub
        // rendering the children as a slot: bail out of optimized patching so
        // the stub updates them on re-render
        const [, ...rest] = restVNodeArgs
        return [transformedType, props, () => children, -2 /* BAIL */, ...rest]
      }
    }
    return [transformedType, props, children, ...restVNodeArgs]
  }
}

import { isComponent } from '../utils'
import { registerStub } from '../stubs'
import { ConcreteComponent, transformVNodeArgs } from 'vue'

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

const isTeleport = (type: any): boolean => type.__isTeleport

export const createVNodeTransformer = ({
  transformers
}: {
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

    const cachedTransformation = transformationCache.get(originalType)
    if (cachedTransformation) {
      // https://github.com/vuejs/test-utils/issues/1829
      // Teleport should return child nodes as a function
      if (isTeleport(originalType)) {
        return [cachedTransformation, props, () => children, ...restVNodeArgs]
      }
      return [cachedTransformation, props, children, ...restVNodeArgs]
    }

    const componentType: VNodeTransformerInputComponentType = originalType

    const transformedType = transformers.reduce(
      (type, transformer) => transformer(type, instance),
      componentType
    )

    if (originalType !== transformedType) {
      transformationCache.set(originalType, transformedType)

      registerStub({ source: originalType, stub: transformedType })
      // https://github.com/vuejs/test-utils/issues/1829
      // Teleport should return child nodes as a function
      if (isTeleport(originalType)) {
        return [transformedType, props, () => children, ...restVNodeArgs]
      }
    }
    return [transformedType, props, children, ...restVNodeArgs]
  }
}

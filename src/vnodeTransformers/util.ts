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
    const [originalType, ...restVNodeArgs] = args

    if (!isComponent(originalType)) {
      return [originalType, ...restVNodeArgs]
    }

    const cachedTransformation = transformationCache.get(originalType)
    if (cachedTransformation) {
      return [cachedTransformation, ...restVNodeArgs]
    }

    const componentType: VNodeTransformerInputComponentType = originalType

    const transformedType = transformers.reduce(
      (type, transformer) => transformer(type, instance),
      componentType
    )

    if (originalType !== transformedType) {
      transformationCache.set(originalType, transformedType)

      registerStub({ source: originalType, stub: transformedType })
    }

    return [transformedType, ...restVNodeArgs]
  }
}

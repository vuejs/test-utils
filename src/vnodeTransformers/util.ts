import { isComponent } from '../utils'
import { ConcreteComponent, transformVNodeArgs } from 'vue'

type VNodeArgsTransformerFn = NonNullable<
  Parameters<typeof transformVNodeArgs>[0]
>
type TransformVNodeArgs = Parameters<VNodeArgsTransformerFn>
type VNodeTransformerArgsType = TransformVNodeArgs[0]
type InstanceArgsType = TransformVNodeArgs[1]
type VNodeTransformerInputType = VNodeTransformerArgsType[0]

type VNodeTransformerInputComponentType = VNodeTransformerInputType &
  ConcreteComponent

export type VTUVNodeTypeTransformer = (
  inputType: VNodeTransformerInputComponentType,
  instance: InstanceArgsType
) => VNodeTransformerInputComponentType

export const createVNodeTransformer = ({
  transformers
}: {
  transformers: VTUVNodeTypeTransformer[]
}): VNodeArgsTransformerFn => {
  return (args: VNodeTransformerArgsType, instance: InstanceArgsType) => {
    const [originalType, ...restVNodeArgs] = args

    if (!isComponent(originalType)) {
      return [originalType, ...restVNodeArgs]
    }

    const componentType: VNodeTransformerInputComponentType = originalType

    const transformedType = transformers.reduce(
      (type, transformer) => transformer(type, instance),
      componentType
    )
    return [transformedType, ...restVNodeArgs]
  }
}

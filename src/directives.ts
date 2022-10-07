import {
  transformVNodeArgs,
  Directive,
  ComponentInternalInstance,
  VNodeTypes
} from 'vue'
import { isObject } from './utils'

interface CreateDirectivesTransformerConfig {
  directives?: Record<string, Directive>
}
type VNodeArgsTransformer = NonNullable<
  Parameters<typeof transformVNodeArgs>[0]
>

export function createDirectivesTransformer({
  directives = {}
}: CreateDirectivesTransformerConfig): VNodeArgsTransformer {
  const directivesTransformerCache: WeakMap<
    VNodeTypes & object,
    VNodeTypes & object
  > = new WeakMap()

  if (Object.keys(directives).length === 0) {
    return (args) => args
  }

  return function directivesTransformer(
    args,
    instance: ComponentInternalInstance | null
  ) {
    // We care about
    // * object components
    // * functional components
    // * legacy components
    // * legacy functional components
    // * class components (sigh)

    const [nodeType, props, children, patchFlag, dynamicProps] = args

    if (!isObject(nodeType)) {
      return args
    }

    if ((nodeType as any).__PATCHED) {
      console.log('wtf')
    }

    const cachedTransformation = directivesTransformerCache.get(nodeType)
    if (cachedTransformation) {
      return [cachedTransformation, props, children, patchFlag, dynamicProps]
    }

    const nodeTypeWithDirectives = {
      __PATCHED: true,
      ...nodeType,
      directives: {
        ...((nodeType as any)?.directives ?? {}),
        ...directives
      }
    }

    directivesTransformerCache.set(nodeType, nodeTypeWithDirectives as any)

    return [
      nodeTypeWithDirectives as any,
      props,
      children,
      patchFlag,
      dynamicProps
    ]
  }
}

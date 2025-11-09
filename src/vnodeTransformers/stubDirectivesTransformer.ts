import type { Directive } from 'vue'
import { isObjectComponent } from '../utils'
import type { VTUVNodeTypeTransformer } from './util'

interface CreateDirectivesTransformerConfig {
  directives: Record<string, Directive | true>
}

const noop = () => {}
export function createStubDirectivesTransformer({
  directives = {}
}: CreateDirectivesTransformerConfig): VTUVNodeTypeTransformer {
  if (Object.keys(directives).length === 0) {
    return (type) => type
  }

  return function directivesTransformer(type) {
    if (isObjectComponent(type) && type.directives) {
      // We want to change component types as rarely as possible
      // So first we check if there are any directives we should stub
      const directivesToPatch = Object.keys(type.directives).filter(
        (key) => key in directives
      )

      if (!directivesToPatch.length) {
        return type
      }

      const replacementDirectives = Object.fromEntries(
        directivesToPatch.map((name) => {
          const directive = directives[name]

          return [name, typeof directive === 'boolean' ? noop : directive]
        })
      )

      return {
        ...type,
        directives: {
          ...type.directives,
          // let's add replacement directives on top of existing component directives
          ...replacementDirectives
        }
      }
    }

    return type
  }
}

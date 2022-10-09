import { Directive } from 'vue'
import { isObjectComponent } from '../utils'
import type { VTUVNodeTypeTransformer } from './util'

interface CreateDirectivesTransformerConfig {
  directives: Record<string, Directive | boolean>
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
          ...replacementDirectives
        }
      }
    }

    return type
  }
}
